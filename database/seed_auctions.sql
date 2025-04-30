-- Insert test auctions
INSERT INTO auctions (
    artwork_id,
    starting_price,
    current_highest_bid,
    start_time,
    end_time,
    status,
    reserve_price
) 
SELECT 
    artwork_id,
    price as starting_price,
    price as current_highest_bid,
    CURRENT_TIMESTAMP as start_time,
    CURRENT_TIMESTAMP + INTERVAL '7 days' as end_time,
    'live' as status,
    price * 1.2 as reserve_price
FROM "Artwork"
WHERE NOT is_sold
LIMIT 3; 