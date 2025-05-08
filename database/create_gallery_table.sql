-- Create the gallery table
CREATE TABLE IF NOT EXISTS gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artwork_id UUID REFERENCES "Artwork"(artwork_id) ON DELETE CASCADE,
    featured BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_gallery_artwork_id ON gallery(artwork_id);

-- Enable Row Level Security
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Create policies for gallery table
CREATE POLICY "Anyone can view gallery items"
    ON gallery FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Users can add items to gallery"
    ON gallery FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "Artwork"
            WHERE artwork_id = gallery.artwork_id
            AND owner_id = auth.uid()
        )
    );

-- Insert initial gallery items
INSERT INTO gallery(artwork_id, featured, display_order, created_at)
VALUES
((SELECT artwork_id FROM "Artwork" WHERE title = 'Highest Peak of the World: Everest'), TRUE, 12, NOW()),
((SELECT artwork_id FROM "Artwork" WHERE title = 'Gautam Buddha – The Enlightened One'), FALSE, 34, NOW()),
((SELECT artwork_id FROM "Artwork" WHERE title = 'Buddhist Thangka from Nepal'), TRUE, 7, NOW()),
((SELECT artwork_id FROM "Artwork" WHERE title = 'Pashupatinath Temple at Sunset'), FALSE, 19, NOW()),
((SELECT artwork_id FROM "Artwork" WHERE title = 'Abstract Climbers on a Snowy Mountain'), TRUE, 25, NOW()),
((SELECT artwork_id FROM "Artwork" WHERE title = 'Kumari – Living Goddess of Nepal'), FALSE, 42, NOW()),
((SELECT artwork_id FROM "Artwork" WHERE title = 'Lord Shiva – The Destroyer'), TRUE, 17, NOW()),
((SELECT artwork_id FROM "Artwork" WHERE title = 'Himalayan Serenity – Hand-Painted Mountain Landscape'), FALSE, 8, NOW()),
((SELECT artwork_id FROM "Artwork" WHERE title = 'Mystic Forest River – Oil Painting Landscape'), TRUE, 29, NOW()),
((SELECT artwork_id FROM "Artwork" WHERE title = 'Fragmented Identity – Abstract Portrait Painting'), TRUE, 31, NOW()),
((SELECT artwork_id FROM "Artwork" WHERE title = 'Vision Unbound – Abstract Eye in Motion'), FALSE, 55, NOW()),
((SELECT artwork_id FROM "Artwork" WHERE title = 'The Fallen Angels'), TRUE, 66, NOW()); 