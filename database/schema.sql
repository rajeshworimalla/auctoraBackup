-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view artworks" ON artworks;
DROP POLICY IF EXISTS "Users can create their own artworks" ON artworks;
DROP POLICY IF EXISTS "Users can update their own artworks" ON artworks;
DROP POLICY IF EXISTS "Users can delete their own artworks" ON artworks;
DROP POLICY IF EXISTS "Anyone can view auctions" ON auctions;
DROP POLICY IF EXISTS "Users can create auctions for their artworks" ON auctions;
DROP POLICY IF EXISTS "Only artwork owner can update auction" ON auctions;
DROP POLICY IF EXISTS "Anyone can view bids" ON trendingbids;
DROP POLICY IF EXISTS "Authenticated users can place bids" ON trendingbids;
DROP POLICY IF EXISTS "Users can only update their own bids" ON trendingbids;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS trendingbids;
DROP TABLE IF EXISTS auctions;
DROP TABLE IF EXISTS artworks;

-- Create artworks table
CREATE TABLE artworks (
    artwork_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    price DECIMAL(10,2),
    category VARCHAR(50),
    medium VARCHAR(50),
    dimensions VARCHAR(100),
    year INTEGER,
    artist_name VARCHAR(255),
    is_sold BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    owner_id UUID REFERENCES auth.users(id) -- Changed from user_id to owner_id
);

-- Create auctions table
CREATE TABLE auctions (
    auction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artwork_id UUID REFERENCES artworks(artwork_id) ON DELETE CASCADE,
    starting_price DECIMAL(10,2) NOT NULL,
    current_highest_bid DECIMAL(10,2),
    highest_bidder_id UUID REFERENCES auth.users(id),
    reserve_price DECIMAL(10,2),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'ended', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create bids table
CREATE TABLE trendingbids (
    bid_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id UUID REFERENCES auctions(auction_id) ON DELETE CASCADE,
    bidder_id UUID REFERENCES auth.users(id), -- Changed from user_id to bidder_id
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_bid_amount CHECK (amount > 0)
);

-- Create indexes for better query performance
CREATE INDEX idx_artworks_owner_id ON artworks(owner_id);
CREATE INDEX idx_auctions_artwork_id ON auctions(artwork_id);
CREATE INDEX idx_auctions_status ON auctions(status);
CREATE INDEX idx_trendingbids_auction_id ON trendingbids(auction_id);
CREATE INDEX idx_trendingbids_bidder_id ON trendingbids(bidder_id);

-- Enable Row Level Security
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trendingbids ENABLE ROW LEVEL SECURITY;

-- Create policies for artworks
CREATE POLICY "Anyone can view artworks"
    ON artworks FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Users can create their own artworks"
    ON artworks FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own artworks"
    ON artworks FOR UPDATE
    TO authenticated
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own artworks"
    ON artworks FOR DELETE
    TO authenticated
    USING (auth.uid() = owner_id);

-- Create policies for auctions
CREATE POLICY "Anyone can view auctions"
    ON auctions FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Users can create auctions for their artworks"
    ON auctions FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM artworks
            WHERE artwork_id = auctions.artwork_id
            AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Only artwork owner can update auction"
    ON auctions FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM artworks
            WHERE artwork_id = auctions.artwork_id
            AND owner_id = auth.uid()
        )
    );

-- Create policies for bids
CREATE POLICY "Anyone can view bids"
    ON trendingbids FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Authenticated users can place bids"
    ON trendingbids FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = bidder_id
        AND NOT EXISTS (
            SELECT 1 FROM artworks a
            JOIN auctions auc ON a.artwork_id = auc.artwork_id
            WHERE auc.auction_id = trendingbids.auction_id
            AND a.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can only update their own bids"
    ON trendingbids FOR UPDATE
    TO authenticated
    USING (auth.uid() = bidder_id);

-- Create function to update auction status
CREATE OR REPLACE FUNCTION check_auction_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update auction status based on time
    IF NEW.end_time <= CURRENT_TIMESTAMP THEN
        NEW.status := 'ended';
    ELSIF NEW.start_time <= CURRENT_TIMESTAMP AND NEW.end_time > CURRENT_TIMESTAMP THEN
        NEW.status := 'active';
    ELSE
        NEW.status := 'pending';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auction status updates
CREATE TRIGGER update_auction_status
    BEFORE INSERT OR UPDATE ON auctions
    FOR EACH ROW
    EXECUTE FUNCTION check_auction_status();

-- Create function to update highest bid
CREATE OR REPLACE FUNCTION update_highest_bid()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the auction's current highest bid and bidder
    UPDATE auctions
    SET current_highest_bid = NEW.amount,
        highest_bidder_id = NEW.bidder_id,
        updated_at = CURRENT_TIMESTAMP
    WHERE auction_id = NEW.auction_id
    AND (current_highest_bid IS NULL OR current_highest_bid < NEW.amount);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for bid updates
CREATE TRIGGER update_auction_highest_bid
    AFTER INSERT ON trendingbids
    FOR EACH ROW
    EXECUTE FUNCTION update_highest_bid(); 