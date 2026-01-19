-- Run this in Supabase SQL Editor to set up authentication users

-- Create admin_users table to store user roles
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE,
  role text CHECK (role IN ('admin', 'editor')) NOT NULL DEFAULT 'editor',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Allow authenticated read" ON public.admin_users;
DROP POLICY IF EXISTS "Allow admin insert" ON public.admin_users;
DROP POLICY IF EXISTS "Allow admin update" ON public.admin_users;
DROP POLICY IF EXISTS "Allow admin delete" ON public.admin_users;

-- Policies for admin_users
CREATE POLICY "Allow authenticated read" ON public.admin_users 
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow admin insert" ON public.admin_users 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND role = 'admin')
    OR NOT EXISTS (SELECT 1 FROM public.admin_users)
  );

CREATE POLICY "Allow admin update" ON public.admin_users 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Allow admin delete" ON public.admin_users 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND role = 'admin')
  );

-- Create function to automatically add user to admin_users on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- First user gets admin role, others get editor
  IF NOT EXISTS (SELECT 1 FROM public.admin_users LIMIT 1) THEN
    INSERT INTO public.admin_users (id, email, role)
    VALUES (new.id, new.email, 'admin');
  ELSE
    INSERT INTO public.admin_users (id, email, role)
    VALUES (new.id, new.email, 'editor');
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
