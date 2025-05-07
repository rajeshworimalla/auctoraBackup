-- Create the function to handle user creation
create or replace function create_user_profile(
  p_user_id uuid,
  p_email varchar,
  p_fname varchar,
  p_lname varchar,
  p_phone varchar,
  p_username varchar
) returns void as $$
begin
  insert into public.users (
    "User_Id",
    "Email",
    "Fname",
    "Lname",
    "Phone",
    "Username",
    "Created_At",
    "Updated_At"
  ) values (
    p_user_id,
    p_email,
    p_fname,
    p_lname,
    p_phone,
    p_username,
    now(),
    now()
  );
end;
$$ language plpgsql security definer;

-- Grant execute permission to authenticated users
grant execute on function create_user_profile to authenticated;
grant execute on function create_user_profile to anon;