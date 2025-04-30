-- First, let's insert the data from the old artworks table into the new Artwork table
INSERT INTO "Artwork" (
    artwork_id,
    title,
    description,
    image_url,
    price,
    category,
    medium,
    dimensions,
    year,
    artist_name,
    is_sold,
    created_at,
    updated_at,
    owner_id
)
SELECT 
    artwork_id,
    title,
    description,
    image_url,
    price,
    category,
    medium,
    dimensions,
    year,
    artist_name,
    is_sold,
    created_at,
    updated_at,
    owner_id
FROM artworks;

-- Now we can add the foreign key constraints
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

ALTER TABLE wishlist
    ADD CONSTRAINT wishlist_artwork_id_fkey
    FOREIGN KEY (artwork_id)
    REFERENCES "Artwork"(artwork_id)
    ON DELETE CASCADE; 