-- First, let's see what artwork_ids are referenced in auctions
WITH missing_artworks AS (
    SELECT DISTINCT artwork_id 
    FROM auctions 
    WHERE artwork_id NOT IN (SELECT artwork_id FROM "Artwork")
)
-- Insert placeholder records for these missing artworks
INSERT INTO "Artwork" (
    artwork_id,
    title,
    description,
    price,
    category,
    medium,
    is_sold,
    created_at,
    updated_at
)
SELECT 
    artwork_id,
    'Untitled Artwork',
    'This is a placeholder for a missing artwork record',
    0,
    'Other',
    'Unknown',
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM missing_artworks;

-- Now we can safely add the foreign key constraints
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