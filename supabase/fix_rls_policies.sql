-- IMPORTANT: Run this in your Supabase SQL Editor
-- This script updates the database with correct bookmakers and fixes RLS

-- First, drop existing policies
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.teams;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.bookmakers;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.performance_entries;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.performance_entries;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read access" ON public.teams;
DROP POLICY IF EXISTS "Allow public read access" ON public.bookmakers;
DROP POLICY IF EXISTS "Allow public read access" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read access" ON public.performance_entries;
DROP POLICY IF EXISTS "Allow public insert" ON public.performance_entries;
DROP POLICY IF EXISTS "Allow public update" ON public.profiles;

-- Create new policies that allow public access (for development)
CREATE POLICY "Allow public read access" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.bookmakers FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.performance_entries FOR SELECT USING (true);

CREATE POLICY "Allow public insert teams" ON public.teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert bookmakers" ON public.bookmakers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert entries" ON public.performance_entries FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update teams" ON public.teams FOR UPDATE USING (true);
CREATE POLICY "Allow public update bookmakers" ON public.bookmakers FOR UPDATE USING (true);
CREATE POLICY "Allow public update profiles" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Allow public update entries" ON public.performance_entries FOR UPDATE USING (true);

CREATE POLICY "Allow public delete teams" ON public.teams FOR DELETE USING (true);
CREATE POLICY "Allow public delete bookmakers" ON public.bookmakers FOR DELETE USING (true);
CREATE POLICY "Allow public delete profiles" ON public.profiles FOR DELETE USING (true);
CREATE POLICY "Allow public delete entries" ON public.performance_entries FOR DELETE USING (true);

-- Clear existing bookmakers and insert the correct ones
DELETE FROM public.bookmakers;

INSERT INTO public.bookmakers (name, active) VALUES
  ('1xbet', true),
  ('1win', true),
  ('Melbet', true),
  ('Betwinner', true),
  ('Linebet', true),
  ('888Starz', true),
  ('Megapari', true),
  ('Afropari', true),
  ('Goldpari', true),
  ('Ngenge', true),
  ('Premier bet', true),
  ('Spinbetter', true),
  ('Winwin', true);

-- Clear existing teams and insert the correct ones
DELETE FROM public.teams;

INSERT INTO public.teams (name) VALUES
  ('Team Joseph'),
  ('Team Peter'),
  ('Team Henry');

-- Note: CMs don't belong to a team in your structure, they are individual
-- We'll handle them through the profiles table directly
