
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;
DROP TABLE IF EXISTS public.users CASCADE;


CREATE TABLE public.users (
  "User_Id" uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  "Email" text NOT NULL UNIQUE,
  "Fname" text,
  "Lname" text,
  "Phone" text,
  "Username" text,
  "Created_At" timestamptz DEFAULT now(),
  "Updated_At" timestamptz DEFAULT now()
);

-- Step 3: Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 4: Policies for authenticated users
CREATE POLICY "Allow user insert"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = "User_Id");

CREATE POLICY "Allow user read"
ON public.users FOR SELECT
TO authenticated
USING (auth.uid() = "User_Id");

CREATE POLICY "Allow user update"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = "User_Id");


