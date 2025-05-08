-- Function to enforce exclusivity
CREATE OR REPLACE FUNCTION enforce_artwork_exclusivity()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM gallery WHERE artwork_id = NEW.artwork_id)
     AND EXISTS (SELECT 1 FROM auctions WHERE artwork_id = NEW.artwork_id) THEN
    RAISE EXCEPTION 'An artwork cannot belong to both gallery and auction.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
