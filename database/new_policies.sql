-- Drop existing policies
drop policy if exists "Enable insert for signup" on public.users;
drop policy if exists "Allow read own data" on public.users;
drop policy if exists "Allow update own data" on public.users;

-- Create new policies
-- Allow insert for anyone (needed for signup)
create policy "Enable insert for signup"
on public.users
for insert
to public
with check (true);

-- Allow users to read their own data
create policy "Allow read own data"
on public.users
for select
to authenticated
using (auth.uid() = "User_Id");

-- Allow users to update their own data
create policy "Allow update own data"
on public.users
for update
to authenticated
using (auth.uid() = "User_Id");