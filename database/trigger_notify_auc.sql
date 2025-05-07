create trigger trigger_notify_auction_end
after update on auctions
for each row
when (OLD.status != 'ended' and NEW.status = 'ended')
execute function notify_auction_end();
