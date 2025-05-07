CREATE TABLE auction_wins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID REFERENCES auctions(auction_id) ON DELETE CASCADE,
  winner_id UUID NOT NULL, 
  final_price NUMERIC,
  won_at TIMESTAMPTZ DEFAULT now()
);