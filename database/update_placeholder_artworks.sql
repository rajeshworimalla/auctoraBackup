-- Update the first artwork (with $3200 bid)
UPDATE "Artwork"
SET 
    title = 'Abstract Harmony',
    description = 'A stunning contemporary piece showcasing vibrant colors and dynamic composition',
    price = 2800.00,
    category = 'painting',
    medium = 'acrylic',
    artist_name = 'Gallery Artist'
WHERE artwork_id = 'a47ac10b-58cc-4372-a567-0e02b2c3d480';

-- Update the second artwork (with $2500 bid)
UPDATE "Artwork"
SET 
    title = 'Urban Perspective',
    description = 'Modern interpretation of city life through geometric patterns',
    price = 2000.00,
    category = 'painting',
    medium = 'mixed media',
    artist_name = 'Gallery Artist'
WHERE artwork_id = 'a47ac10b-58cc-4372-a567-0e02b2c3d479'; 