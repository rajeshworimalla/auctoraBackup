-- Create the Artwork table
CREATE TABLE "Artwork" (
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
    owner_id UUID REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX idx_artwork_owner_id ON "Artwork"(owner_id);
CREATE INDEX idx_artwork_category ON "Artwork"(category);
CREATE INDEX idx_artwork_price ON "Artwork"(price);

-- Enable Row Level Security
ALTER TABLE "Artwork" ENABLE ROW LEVEL SECURITY;

-- Create policies for Artwork table
CREATE POLICY "Anyone can view artwork"
    ON "Artwork"
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Users can create their own artwork"
    ON "Artwork"
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own artwork"
    ON "Artwork"
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own artwork"
    ON "Artwork"
    FOR DELETE
    TO authenticated
    USING (auth.uid() = owner_id);

-- Recreate foreign key constraints
ALTER TABLE wishlist
    ADD CONSTRAINT wishlist_artwork_id_fkey
    FOREIGN KEY (artwork_id)
    REFERENCES "Artwork"(artwork_id)
    ON DELETE CASCADE;

ALTER TABLE auctions
    ADD CONSTRAINT auctions_artwork_id_fkey
    FOREIGN KEY (artwork_id)
    REFERENCES "Artwork"(artwork_id)
    ON DELETE CASCADE;

ALTER TABLE cart_items
    ADD CONSTRAINT cart_items_artwork_id_fkey
    FOREIGN KEY (artwork_id)
    REFERENCES "Artwork"(artwork_id)
    ON DELETE CASCADE;

-- Recreate auction-related policies
CREATE POLICY "Users can create auctions for their artworks"
    ON auctions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "Artwork"
            WHERE artwork_id = auctions.artwork_id
            AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Only artwork owner can update auction"
    ON auctions
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "Artwork"
            WHERE artwork_id = auctions.artwork_id
            AND owner_id = auth.uid()
        )
    );

-- Recreate trending bids policy
CREATE POLICY "Authenticated users can place bids"
    ON trendingbids
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = bidder_id
        AND NOT EXISTS (
            SELECT 1 FROM "Artwork" a
            JOIN auctions auc ON a.artwork_id = auc.artwork_id
            WHERE auc.auction_id = trendingbids.auction_id
            AND a.owner_id = auth.uid()
        )
    ); 