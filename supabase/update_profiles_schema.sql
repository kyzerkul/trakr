-- Run this in Supabase SQL Editor to fix profiles table
-- Updated to handle existing dependencies

-- First drop affiliate_links if it exists (to remove dependency)
DROP TABLE IF EXISTS public.affiliate_links CASCADE;

-- Now drop and recreate profiles
DROP TABLE IF EXISTS public.performance_entries CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table without auth.users constraint
CREATE TABLE public.profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  role text CHECK (role IN ('admin', 'editor', 'cm')) NOT NULL,
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  youtube_channel text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Recreate performance_entries
CREATE TABLE public.performance_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  bookmaker_id uuid REFERENCES public.bookmakers(id) NOT NULL,
  link_identifier text,
  registrations integer DEFAULT 0,
  deposits integer DEFAULT 0,
  revenue numeric(10, 2) DEFAULT 0,
  net_revenue numeric(10, 2) DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_entries ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Allow public read access" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.profiles FOR DELETE USING (true);

-- Policies for performance_entries
CREATE POLICY "Allow public read access" ON public.performance_entries FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.performance_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.performance_entries FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.performance_entries FOR DELETE USING (true);
