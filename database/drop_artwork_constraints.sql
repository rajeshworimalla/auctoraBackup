-- First, drop the policies that reference the Artwork table
DROP POLICY IF EXISTS "Users can create auctions for their artworks" ON auctions;
DROP POLICY IF EXISTS "Only artwork owner can update auction" ON auctions;
DROP POLICY IF EXISTS "Authenticated users can place bids" ON trendingbids;

-- Then drop the foreign key constraints
ALTER TABLE wishlist DROP CONSTRAINT IF EXISTS wishlist_artwork_id_fkey;
ALTER TABLE auctions DROP CONSTRAINT IF EXISTS auctions_artwork_id_fkey;
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_artwork_id_fkey;

-- Finally, drop the Artwork table
DROP TABLE IF EXISTS "Artwork"; 