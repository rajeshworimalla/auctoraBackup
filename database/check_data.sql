-- Check if we have any data in the Artwork table
SELECT COUNT(*) as artwork_count FROM "Artwork";

-- Check what artworks we have
SELECT 
    artwork_id,
    title,
    price,
    category,
    is_sold,
    artist_name
FROM "Artwork"
ORDER BY created_at DESC;

-- Check Artwork table
SELECT COUNT(*) as total_artworks FROM "Artwork";
SELECT * FROM "Artwork" ORDER BY artwork_id;

-- Check auctions table
SELECT COUNT(*) as total_auctions FROM auctions;
SELECT * FROM auctions ORDER BY auction_id;

-- Check which artworks are in auctions
SELECT 
    a.artwork_id,
    a.title,
    CASE WHEN au.auction_id IS NULL THEN 'Gallery' ELSE 'Auction' END as location,
    au.status as auction_status,
    au.start_time,
    au.end_time
FROM "Artwork" a
LEFT JOIN auctions au ON a.artwork_id = au.artwork_id
ORDER BY a.artwork_id; 