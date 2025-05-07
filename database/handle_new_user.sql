-- Drop existing users table (WARNING: deletes data)
drop table if exists public.users cascade;

-- Recreate table
create table public.users (
  "User_Id" uuid primary key references auth.users(id) on delete cascade,
  "Fname" varchar,
  "Lname" varchar,
  "Email" varchar unique not null,
  "Phone" varchar,
  "Username" varchar,
  "Created_At" timestamptz default now(),
  "Updated_At" timestamptz default now()
);

-- Enable Row Level Security
alter table public.users enable row level security;

--  INSERT policy must use WITH CHECK
create policy "Allow insert for own account"
on public.users
for insert
to authenticated
with check (auth.uid() = "User_Id");

-- SELECT policy still uses USING
create policy "Allow read own data"
on public.users
for select
to authenticated
using (auth.uid() = "User_Id");

-- UPDATE policy uses USING
create policy "Allow update own data"
on public.users
for update
to authenticated
using (auth.uid() = "User_Id");
