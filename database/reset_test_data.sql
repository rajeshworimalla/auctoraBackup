-- First, clear existing data
DELETE FROM auctions;
DELETE FROM "Artwork";

-- Insert test artworks
INSERT INTO "Artwork" (
    title,
    description,
    image_url,
    price,
    category,
    medium,
    dimensions,
    year,
    artist_name,
    is_sold
) VALUES 
-- Gallery Items (for direct sale)
(
    'Sunset by the Beach',
    'A beautiful sunset scene with vibrant orange and purple hues',
    'https://images.unsplash.com/photo-1518998053901-5348d3961a04',
    1500.00,
    'painting',
    'oil',
    '24x36 inches',
    2024,
    'John Smith',
    false
),
(
    'Abstract Dreams',
    'Modern abstract composition in bold colors',
    'https://images.unsplash.com/photo-1541961017774-22349e4a1262',
    2000.00,
    'painting',
    'acrylic',
    '30x40 inches',
    2024,
    'Sarah Johnson',
    false
),
(
    'Urban Life',
    'Black and white photography of city life',
    'https://images.unsplash.com/photo-1514539079130-25950c84af65',
    800.00,
    'photography',
    'digital',
    '20x24 inches',
    2024,
    'Mike Wilson',
    false
);

-- Now insert auction items
INSERT INTO "Artwork" (
    title,
    description,
    image_url,
    price,
    category,
    medium,
    dimensions,
    year,
    artist_name,
    is_sold
) VALUES 
(
    'Mountain Majesty',
    'Stunning mountain landscape at sunrise',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    3000.00,
    'painting',
    'oil',
    '36x48 inches',
    2024,
    'Emma Davis',
    false
),
(
    'Dancing Figures',
    'Bronze sculpture of dancing figures',
    'https://images.unsplash.com/photo-1561839561-b13bcfe95249',
    5000.00,
    'sculpture',
    'bronze',
    '18x24x12 inches',
    2024,
    'Robert Chen',
    false
),
(
    'Digital Dreamscape',
    'AI-assisted digital art creation',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba',
    1200.00,
    'digital',
    'digital',
    '4K resolution',
    2024,
    'Alex Turner',
    false
);

-- Create auctions for the last three artworks
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
WHERE title IN ('Mountain Majesty', 'Dancing Figures', 'Digital Dreamscape'); 