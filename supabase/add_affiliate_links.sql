-- Run this in Supabase SQL Editor to add custom links/codes table

-- Table to store custom affiliate links and promo codes per entity (team or CM) and bookmaker
CREATE TABLE IF NOT EXISTS public.affiliate_links (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  bookmaker_id uuid REFERENCES public.bookmakers(id) ON DELETE CASCADE NOT NULL,
  affiliate_link text,
  promo_code text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- Ensure either team_id or profile_id is set, but not both
  CONSTRAINT team_or_profile CHECK (
    (team_id IS NOT NULL AND profile_id IS NULL) OR 
    (team_id IS NULL AND profile_id IS NOT NULL)
  ),
  -- Unique constraint per team/bookmaker or profile/bookmaker
  CONSTRAINT unique_team_bookmaker UNIQUE (team_id, bookmaker_id),
  CONSTRAINT unique_profile_bookmaker UNIQUE (profile_id, bookmaker_id)
);

-- Enable RLS
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" ON public.affiliate_links FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.affiliate_links FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.affiliate_links FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.affiliate_links FOR DELETE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_affiliate_links_updated_at ON public.affiliate_links;
CREATE TRIGGER update_affiliate_links_updated_at
    BEFORE UPDATE ON public.affiliate_links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
