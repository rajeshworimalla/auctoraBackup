-- Trigger on gallery insert
CREATE TRIGGER check_artwork_exclusivity_on_gallery
AFTER INSERT OR UPDATE ON gallery
FOR EACH ROW EXECUTE FUNCTION enforce_artwork_exclusivity();

-- Trigger on auctions insert
CREATE TRIGGER check_artwork_exclusivity_on_auctions
AFTER INSERT OR UPDATE ON auctions
FOR EACH ROW EXECUTE FUNCTION enforce_artwork_exclusivity();
