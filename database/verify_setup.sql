-- Check Artwork table contents
SELECT COUNT(*) as total_artworks FROM "Artwork";

-- Check auctions with their artwork details
SELECT 
    a.auction_id,
    a.status,
    art.title,
    art.price as artwork_price,
    a.current_highest_bid
FROM auctions a
JOIN "Artwork" art ON a.artwork_id = art.artwork_id
WHERE a.status = 'active'
ORDER BY a.end_time; 