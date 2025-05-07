create or replace function notify_auction_end()
returns trigger as $$
declare
  top_bid record;
  all_bidders uuid[];
  bidder uuid;
begin
  -- Get the top bid
  select bidder_id into top_bid
  from bids
  where auction_id = NEW.auction_id
  order by amount desc
  limit 1;

  -- Notify the winner
  insert into notifications (user_id, message)
  values (top_bid.bidder_id, 'Congratulations! You won the auction.');

  -- Notify all other participants
  select array_agg(distinct bidder_id) into all_bidders
  from bids
  where auction_id = NEW.auction_id and bidder_id != top_bid.bidder_id;

  foreach bidder in array all_bidders
  loop
    insert into notifications (user_id, message)
    values (bidder, 'Thank you for participating. Unfortunately, you did not win.');
  end loop;

  return NEW;
end;
$$ language plpgsql;
