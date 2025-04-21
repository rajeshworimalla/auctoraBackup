-- Insert sample users (if they don't exist in auth.users)
-- Note: In production, users are typically created through Supabase Auth
-- These are just for testing purposes
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES
    ('d0d7d63a-5e4b-4b28-b1a7-8449e0e00ca1', 'artist1@example.com', '{"full_name": "Sarah Chen", "role": "artist"}'),
    ('c9c0b4f2-8e4a-4c3b-b1a7-8449e0e00ca2', 'artist2@example.com', '{"full_name": "James Rodriguez", "role": "artist"}'),
    ('b8b1a3e1-7d3c-4a2a-b1a7-8449e0e00ca3', 'collector1@example.com', '{"full_name": "Emily Thompson", "role": "collector"}'),
    ('a7a2b2d0-6c2b-3b1a-b1a7-8449e0e00ca4', 'collector2@example.com', '{"full_name": "Michael Brown", "role": "collector"}')
ON CONFLICT (id) DO NOTHING;

-- Insert sample artworks
INSERT INTO artworks (artwork_id, title, description, image_url, price, category, medium, dimensions, year, artist_name, owner_id)
VALUES
    -- Sarah Chen's Artworks
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Sunset Harmony', 
     'A vibrant contemporary interpretation of a sunset over the ocean, featuring bold orange and purple hues.',
     'https://example.com/images/sunset_harmony.jpg',
     2500.00, 'Painting', 'Oil', '36x48 inches', 2023, 'Sarah Chen',
     'd0d7d63a-5e4b-4b28-b1a7-8449e0e00ca1'),
    
    ('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Urban Dreams', 
     'Abstract cityscape capturing the energy and rhythm of modern urban life.',
     'https://example.com/images/urban_dreams.jpg',
     3000.00, 'Painting', 'Acrylic', '40x60 inches', 2023, 'Sarah Chen',
     'd0d7d63a-5e4b-4b28-b1a7-8449e0e00ca1'),

    -- James Rodriguez's Artworks
    ('f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Digital Dystopia', 
     'A digital art piece exploring the relationship between humanity and technology.',
     'https://example.com/images/digital_dystopia.jpg',
     1800.00, 'Digital Art', 'Digital', '24x36 inches', 2023, 'James Rodriguez',
     'c9c0b4f2-8e4a-4c3b-b1a7-8449e0e00ca2'),
    
    ('f47ac10b-58cc-4372-a567-0e02b2c3d482', 'Nature''s Whisper', 
     'A delicate watercolor capturing the subtle beauty of morning dew on spring flowers.',
     'https://example.com/images/natures_whisper.jpg',
     1500.00, 'Painting', 'Watercolor', '18x24 inches', 2023, 'James Rodriguez',
     'c9c0b4f2-8e4a-4c3b-b1a7-8449e0e00ca2');

-- Insert sample auctions (some active, some ended, some pending)
INSERT INTO auctions (auction_id, artwork_id, starting_price, current_highest_bid, highest_bidder_id, 
                     reserve_price, start_time, end_time, status)
VALUES
    -- Active auction for Sunset Harmony
    ('a47ac10b-58cc-4372-a567-0e02b2c3d479', 
     'f47ac10b-58cc-4372-a567-0e02b2c3d479',
     2000.00, 2500.00, 'b8b1a3e1-7d3c-4a2a-b1a7-8449e0e00ca3',
     3000.00, 
     CURRENT_TIMESTAMP - INTERVAL '2 days',
     CURRENT_TIMESTAMP + INTERVAL '5 days',
     'active'),

    -- Ending soon auction for Urban Dreams
    ('a47ac10b-58cc-4372-a567-0e02b2c3d480',
     'f47ac10b-58cc-4372-a567-0e02b2c3d480',
     2500.00, 3200.00, 'a7a2b2d0-6c2b-3b1a-b1a7-8449e0e00ca4',
     3500.00,
     CURRENT_TIMESTAMP - INTERVAL '6 days',
     CURRENT_TIMESTAMP + INTERVAL '1 day',
     'active'),

    -- Ended auction for Digital Dystopia
    ('a47ac10b-58cc-4372-a567-0e02b2c3d481',
     'f47ac10b-58cc-4372-a567-0e02b2c3d481',
     1500.00, 2200.00, 'b8b1a3e1-7d3c-4a2a-b1a7-8449e0e00ca3',
     2000.00,
     CURRENT_TIMESTAMP - INTERVAL '10 days',
     CURRENT_TIMESTAMP - INTERVAL '3 days',
     'ended'),

    -- Pending auction for Nature's Whisper
    ('a47ac10b-58cc-4372-a567-0e02b2c3d482',
     'f47ac10b-58cc-4372-a567-0e02b2c3d482',
     1200.00, NULL, NULL,
     1800.00,
     CURRENT_TIMESTAMP + INTERVAL '1 day',
     CURRENT_TIMESTAMP + INTERVAL '8 days',
     'pending');

-- Insert sample bids
INSERT INTO trendingbids (bid_id, auction_id, bidder_id, amount, created_at)
VALUES
    -- Bids for Sunset Harmony
    ('b47ac10b-58cc-4372-a567-0e02b2c3d479',
     'a47ac10b-58cc-4372-a567-0e02b2c3d479',
     'b8b1a3e1-7d3c-4a2a-b1a7-8449e0e00ca3',
     2200.00,
     CURRENT_TIMESTAMP - INTERVAL '1 day'),
    
    ('b47ac10b-58cc-4372-a567-0e02b2c3d480',
     'a47ac10b-58cc-4372-a567-0e02b2c3d479',
     'a7a2b2d0-6c2b-3b1a-b1a7-8449e0e00ca4',
     2500.00,
     CURRENT_TIMESTAMP - INTERVAL '12 hours'),

    -- Bids for Urban Dreams
    ('b47ac10b-58cc-4372-a567-0e02b2c3d481',
     'a47ac10b-58cc-4372-a567-0e02b2c3d480',
     'b8b1a3e1-7d3c-4a2a-b1a7-8449e0e00ca3',
     2800.00,
     CURRENT_TIMESTAMP - INTERVAL '2 days'),
    
    ('b47ac10b-58cc-4372-a567-0e02b2c3d482',
     'a47ac10b-58cc-4372-a567-0e02b2c3d480',
     'a7a2b2d0-6c2b-3b1a-b1a7-8449e0e00ca4',
     3200.00,
     CURRENT_TIMESTAMP - INTERVAL '1 day'),

    -- Bids for Digital Dystopia (ended auction)
    ('b47ac10b-58cc-4372-a567-0e02b2c3d483',
     'a47ac10b-58cc-4372-a567-0e02b2c3d481',
     'b8b1a3e1-7d3c-4a2a-b1a7-8449e0e00ca3',
     2200.00,
     CURRENT_TIMESTAMP - INTERVAL '4 days');

-- Test Queries

-- 1. View all active auctions with their current highest bids
SELECT 
    a.title,
    auc.starting_price,
    auc.current_highest_bid,
    auc.end_time,
    u.raw_user_meta_data->>'full_name' as highest_bidder_name
FROM auctions auc
JOIN artworks a ON auc.artwork_id = a.artwork_id
LEFT JOIN auth.users u ON auc.highest_bidder_id = u.id
WHERE auc.status = 'active'
ORDER BY auc.end_time ASC;

-- 2. View all bids for a specific auction
SELECT 
    b.amount,
    b.created_at,
    u.raw_user_meta_data->>'full_name' as bidder_name
FROM trendingbids b
JOIN auth.users u ON b.bidder_id = u.id
WHERE b.auction_id = 'a47ac10b-58cc-4372-a567-0e02b2c3d479'
ORDER BY b.amount DESC;

-- 3. View all artworks by a specific artist
SELECT 
    a.title,
    a.medium,
    a.price,
    COALESCE(auc.current_highest_bid, 0) as current_bid,
    auc.status as auction_status
FROM artworks a
LEFT JOIN auctions auc ON a.artwork_id = auc.artwork_id
WHERE a.owner_id = 'd0d7d63a-5e4b-4b28-b1a7-8449e0e00ca1'; 