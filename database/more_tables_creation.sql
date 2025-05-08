drop table if exists shipping_info cascade;
drop table if exists orders cascade;
drop table if exists order_items cascade;
drop table if exists payment_info cascade;

-- Shipping Info Table
create table shipping_info (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references users("User_Id") on delete cascade,
    full_name varchar not null,
    address_line1 varchar not null,
    address_line2 varchar,
    city varchar not null,
    state varchar not null,
    postal_code varchar not null,
    country varchar not null default 'USA',
    phone_number varchar not null,
    created_at timestamptz default now()
);

-- Orders Table
create table orders (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references users("User_Id") on delete cascade,
    shipping_id uuid references shipping_info(id),
    total_amount decimal(10,2) not null,
    status varchar not null default 'pending', -- e.g. pending, paid, shipped, delivered
    created_at timestamptz default now()
);

-- Order Items Table
create table order_items (
    id uuid default uuid_generate_v4() primary key,
    order_id uuid references orders(id) on delete cascade,
    artwork_id uuid references "Artwork"(artwork_id),
    quantity integer not null,
    price_at_time decimal(10,2) not null
);

-- Payment Info Table
create table payment_info (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references users("User_Id") on delete cascade,
    card_number varchar not null,
    card_holder_name varchar not null,
    expiry_date varchar not null,
    cvv varchar not null,
    billing_address_line1 varchar not null,
    billing_address_line2 varchar,
    billing_city varchar not null,
    billing_state varchar not null,
    billing_postal_code varchar not null,
    billing_country varchar not null default 'USA',
    created_at timestamptz default now()
);