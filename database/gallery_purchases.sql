CREATE TABLE gallery_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id UUID REFERENCES "Artwork"(artwork_id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL, -- references auth.users(id) or users table
  purchased_at TIMESTAMPTZ DEFAULT now()
);