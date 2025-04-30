-- First, let's delete the placeholder artworks
DELETE FROM "Artwork" WHERE title = 'Untitled Artwork';

-- Now insert the original artworks
INSERT INTO "Artwork" (
    artwork_id,
    title,
    description,
    image_url,
    price,
    category,
    medium,
    artist_name,
    is_sold,
    created_at,
    updated_at
) VALUES
-- Original artworks from sample_data.sql
(uuid_generate_v4(), 'Whispers Of The Wild', 'A hand-carved wooden elephant that embodies power and calm. Crafted from reclaimed teakwood, this piece brings warmth and strength to any collection.', '/uploads/artworks/art1.jpg', 180.00, 'sculpture', 'wood', 'Sarah Chen', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'Echoes in Steel', 'An abstract metal sculpture shaped by fire and vision. Twisted forms reflect chaos and clarity—perfect for a modern industrial gallery.', '/uploads/artworks/art2.jpg', 290.00, 'sculpture', 'metal', 'James Rodriguez', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'Grace in Marble', 'This elegant marble sculpture captures feminine serenity in fluid detail. Inspired by neoclassical European styles of the 18th century.', '/uploads/artworks/art3.jpg', 250.00, 'sculpture', 'marble', 'Sarah Chen', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'Timeless Reverie', 'An 18th-century oil painting on canvas, rich in earthy tones and soft light. Ideal for collectors of historical European works.', '/uploads/artworks/art4.jpg', 340.00, 'painting', 'oil', 'James Rodriguez', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'Fragmented Bloom', 'A vibrant modern interpretation of nature''s fragility. This semi-abstract floral piece blends chaos and color in bold brushstrokes.', '/uploads/artworks/art5.png', 290.00, 'painting', 'mixed media', 'Sarah Chen', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'The Stag in Focus', 'This captivating piece of digital artwork features a stylized low-poly deer, meticulously crafted using sharp geometric shapes and a bold palette of purples, pinks, and earthy tones. Framed elegantly and showcased on a minimalist exhibition wall, the artwork draws viewers in with the deer''s direct, almost soulful gaze', '/uploads/artworks/art6.png', 290.00, 'digital', 'digital', 'James Rodriguez', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'Apple and Snail', 'A high-resolution photograph depicting a surreal arrangement of a sliced green apple filled with a glowing liquid, with a small snail ascending its surface.', '/uploads/artworks/art7.png', 450.00, 'photography', 'photography', 'Sarah Chen', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'Armored Rider in Motion', 'This metallic sculpture features a futuristic, armored motorcyclist in motion, crafted with precision in polished steel and brushed alloys.', '/uploads/artworks/art8.png', 900.00, 'sculpture', 'metal', 'James Rodriguez', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'Contours of Thought', 'A striking abstract painting that captures the dynamic interplay of color, form, and texture. Layered geometric shapes in vivid hues of red, blue, yellow, and green are harmonized', '/uploads/artworks/art9.png', 1900.00, 'painting', 'acrylic', 'Sarah Chen', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Keep the existing auction artworks but update their details
UPDATE "Artwork"
SET 
    title = 'Abstract Harmony',
    description = 'A stunning contemporary piece showcasing vibrant colors and dynamic composition',
    price = 2800.00,
    category = 'painting',
    medium = 'acrylic',
    artist_name = 'Sarah Chen'
WHERE artwork_id = 'a47ac10b-58cc-4372-a567-0e02b2c3d480';

UPDATE "Artwork"
SET 
    title = 'Urban Perspective',
    description = 'Modern interpretation of city life through geometric patterns',
    price = 2000.00,
    category = 'painting',
    medium = 'mixed media',
    artist_name = 'James Rodriguez'
WHERE artwork_id = 'a47ac10b-58cc-4372-a567-0e02b2c3d479'; 