-- Enable RLS
alter table shipping_info enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payment_info enable row level security;

-- SHIPPING INFO
create policy "Users can view their own shipping info"
on shipping_info for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own shipping info"
on shipping_info for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own shipping info"
on shipping_info for update
to authenticated
using (auth.uid() = user_id);

-- ORDERS
create policy "Users can view their own orders"
on orders for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own orders"
on orders for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own orders"
on orders for update
to authenticated
using (auth.uid() = user_id);

-- ORDER ITEMS
create policy "Users can view their own order items"
on order_items for select
to authenticated
using (
  exists (
    select 1 from orders
    where orders.id = order_items.order_id
    and orders.user_id = auth.uid()
  )
);

create policy "Users can insert their own order items"
on order_items for insert
to authenticated
with check (
  exists (
    select 1 from orders
    where orders.id = order_items.order_id
    and orders.user_id = auth.uid()
  )
);

-- PAYMENT INFO
create policy "Users can view their own payment info"
on payment_info for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own payment info"
on payment_info for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own payment info"
on payment_info for update
to authenticated
using (auth.uid() = user_id);