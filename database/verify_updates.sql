-- Check the updated artwork details
SELECT 
    art.artwork_id,
    art.title,
    art.description,
    art.price as base_price,
    art.category,
    art.medium,
    art.artist_name,
    a.current_highest_bid,
    a.status
FROM "Artwork" art
JOIN auctions a ON art.artwork_id = a.artwork_id
WHERE a.status = 'active'
ORDER BY a.current_highest_bid DESC; 