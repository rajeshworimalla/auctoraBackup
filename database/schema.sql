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
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS "User";

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

-- Create cart_items table
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    artwork_id UUID REFERENCES artworks(artwork_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create User table
CREATE TABLE "User" (
    "User_Id" UUID PRIMARY KEY REFERENCES auth.users(id),
    "Fname" VARCHAR(255),
    "Lname" VARCHAR(255),
    "Email" VARCHAR(255) UNIQUE,
    "Username" VARCHAR(50) UNIQUE NOT NULL,
    "Created_At" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_artworks_owner_id ON artworks(owner_id);
CREATE INDEX idx_auctions_artwork_id ON auctions(artwork_id);
CREATE INDEX idx_auctions_status ON auctions(status);
CREATE INDEX idx_trendingbids_auction_id ON trendingbids(auction_id);
CREATE INDEX idx_trendingbids_bidder_id ON trendingbids(bidder_id);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_artwork_id ON cart_items(artwork_id);

-- Enable Row Level Security
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trendingbids ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

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

-- Create policies for cart_items
CREATE POLICY "Users can view their own cart items"
    ON cart_items FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items"
    ON cart_items FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items"
    ON cart_items FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items"
    ON cart_items FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

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

-- Step 1: Ensure User_Id matches auth.users.id
ALTER TABLE "User"
ALTER COLUMN "User_Id" TYPE uuid USING "User_Id"::uuid;

-- Step 2: Populate the User table with data from auth.users
INSERT INTO "User" ("User_Id", "Fname", "Lname", "Email", "Created_At")
SELECT id, metadata->>'first_name', metadata->>'last_name', email, created_at
FROM auth.users
ON CONFLICT ("User_Id") DO NOTHING;

-- Step 3: Create a trigger to sync new users
CREATE OR REPLACE FUNCTION sync_new_users()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO "User" ("User_Id", "Fname", "Lname", "Email", "Created_At")
  VALUES (NEW.id, NEW.metadata->>'first_name', NEW.metadata->>'last_name', NEW.email, NEW.created_at)
  ON CONFLICT ("User_Id") DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_user_insert
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION sync_new_users();

-- Step 4: Add a foreign key constraint to connect User and bids
ALTER TABLE bids
ADD CONSTRAINT fk_bidder_user
FOREIGN KEY (bidder_id)
REFERENCES "User" ("User_Id")
ON DELETE CASCADE;

-- Step 1: Remove the Password column
ALTER TABLE "User"
DROP COLUMN "Password";

-- Step 2: Create a trigger to sync new users from auth.users
CREATE OR REPLACE FUNCTION sync_new_users()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO "User" ("User_Id", "Fname", "Lname", "Email", "Created_At")
  VALUES (NEW.id, NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name', NEW.email, NEW.created_at)
  ON CONFLICT ("User_Id") DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_user_insert
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION sync_new_users();

-- Step 1: Drop NOT NULL constraints for all problematic columns
ALTER TABLE "User"
ALTER COLUMN "Fname" DROP NOT NULL,
ALTER COLUMN "Lname" DROP NOT NULL,
ALTER COLUMN "Phone" DROP NOT NULL,
ALTER COLUMN "Is_Seller" DROP NOT NULL;

-- Step 2: Set default values for columns (if required)
ALTER TABLE "User"
ALTER COLUMN "Fname" SET DEFAULT 'Unknown',
ALTER COLUMN "Lname" SET DEFAULT 'Unknown',
ALTER COLUMN "Phone" SET DEFAULT 'Unknown',
ALTER COLUMN "Is_Seller" SET DEFAULT false;

-- Step 3: Update the query to handle missing data
INSERT INTO "User" ("User_Id", "Fname", "Lname", "Email", "Phone", "Is_Seller", "Created_At")
SELECT id, 
       COALESCE(raw_user_meta_data->>'first_name', 'Unknown'), 
       COALESCE(raw_user_meta_data->>'last_name', 'Unknown'), 
       email, 
       COALESCE(phone, 'Unknown'), 
       false, 
       created_at
FROM auth.users
ON CONFLICT ("User_Id") DO NOTHING;

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table with proper constraints
CREATE TABLE public.users (
  "User_Id" uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  "Email" text NOT NULL UNIQUE,
  "Fname" text,
  "Lname" text,
  "Phone" text,
  "Username" text NOT NULL UNIQUE,
  "Created_At" timestamptz DEFAULT now(),
  "Updated_At" timestamptz DEFAULT now(),
  CONSTRAINT username_length CHECK (char_length("Username") >= 3),
  CONSTRAINT username_format CHECK ("Username" ~ '^[a-zA-Z0-9_]+$')
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Allow user insert"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = "User_Id");

CREATE POLICY "Allow user read"
ON public.users FOR SELECT
TO authenticated
USING (auth.uid() = "User_Id");

CREATE POLICY "Allow user update"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = "User_Id");

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users ("User_Id", "Email", "Fname", "Lname", "Phone", "Username")
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'username'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create index for username lookups
CREATE INDEX idx_users_username ON public.users ("Username");