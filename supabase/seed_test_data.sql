-- DONNÉES DE TEST POUR TRAKR
-- Exécutez ce script dans Supabase SQL Editor après les autres scripts

-- Insérer des équipes
INSERT INTO public.teams (name) VALUES
  ('Team Alpha'),
  ('Team Bravo'),
  ('Team Charlie')
ON CONFLICT DO NOTHING;

-- Récupérer les IDs des équipes et bookmakers pour les utiliser dans les insertions
DO $$
DECLARE
  team_alpha_id uuid;
  team_bravo_id uuid;
  team_charlie_id uuid;
  cm1_id uuid;
  cm2_id uuid;
  cm3_id uuid;
  cm4_id uuid;
  bm_1xbet uuid;
  bm_1win uuid;
  bm_melbet uuid;
  bm_betwinner uuid;
  bm_linebet uuid;
BEGIN
  -- Récupérer les IDs des équipes
  SELECT id INTO team_alpha_id FROM public.teams WHERE name = 'Team Alpha' LIMIT 1;
  SELECT id INTO team_bravo_id FROM public.teams WHERE name = 'Team Bravo' LIMIT 1;
  SELECT id INTO team_charlie_id FROM public.teams WHERE name = 'Team Charlie' LIMIT 1;

  -- Récupérer les IDs des bookmakers
  SELECT id INTO bm_1xbet FROM public.bookmakers WHERE name = '1xbet' LIMIT 1;
  SELECT id INTO bm_1win FROM public.bookmakers WHERE name = '1win' LIMIT 1;
  SELECT id INTO bm_melbet FROM public.bookmakers WHERE name = 'Melbet' LIMIT 1;
  SELECT id INTO bm_betwinner FROM public.bookmakers WHERE name = 'Betwinner' LIMIT 1;
  SELECT id INTO bm_linebet FROM public.bookmakers WHERE name = 'Linebet' LIMIT 1;

  -- Créer des Community Managers
  INSERT INTO public.profiles (full_name, role, youtube_channel) 
  VALUES ('Sarah Dubois', 'cm', 'https://youtube.com/@sarahdubois')
  RETURNING id INTO cm1_id;

  INSERT INTO public.profiles (full_name, role, youtube_channel) 
  VALUES ('Marc Leblanc', 'cm', 'https://youtube.com/@marcleblanc')
  RETURNING id INTO cm2_id;

  INSERT INTO public.profiles (full_name, role, youtube_channel) 
  VALUES ('Julie Martin', 'cm', NULL)
  RETURNING id INTO cm3_id;

  INSERT INTO public.profiles (full_name, role, youtube_channel) 
  VALUES ('Pierre Durand', 'cm', 'https://youtube.com/@pierredurand')
  RETURNING id INTO cm4_id;

  -- Insérer des entrées de performance pour les équipes (30 derniers jours)
  -- Team Alpha - 1xbet
  INSERT INTO public.performance_entries (date, team_id, bookmaker_id, link_identifier, registrations, deposits, revenue, net_revenue)
  VALUES 
    (CURRENT_DATE - INTERVAL '1 day', team_alpha_id, bm_1xbet, 'direct_link', 45, 28, 1250.00, 875.00),
    (CURRENT_DATE - INTERVAL '2 days', team_alpha_id, bm_1xbet, 'promo_code', 38, 22, 980.00, 686.00),
    (CURRENT_DATE - INTERVAL '3 days', team_alpha_id, bm_1xbet, 'direct_link', 52, 31, 1420.00, 994.00),
    (CURRENT_DATE - INTERVAL '5 days', team_alpha_id, bm_1xbet, 'direct_link', 41, 25, 1100.00, 770.00),
    (CURRENT_DATE - INTERVAL '7 days', team_alpha_id, bm_1xbet, 'promo_code', 36, 19, 850.00, 595.00);

  -- Team Alpha - 1win
  INSERT INTO public.performance_entries (date, team_id, bookmaker_id, link_identifier, registrations, deposits, revenue, net_revenue)
  VALUES 
    (CURRENT_DATE - INTERVAL '1 day', team_alpha_id, bm_1win, 'direct_link', 32, 18, 780.00, 546.00),
    (CURRENT_DATE - INTERVAL '3 days', team_alpha_id, bm_1win, 'promo_code', 28, 15, 650.00, 455.00);

  -- Team Bravo - Multiple bookmakers
  INSERT INTO public.performance_entries (date, team_id, bookmaker_id, link_identifier, registrations, deposits, revenue, net_revenue)
  VALUES 
    (CURRENT_DATE - INTERVAL '1 day', team_bravo_id, bm_melbet, 'direct_link', 55, 35, 1580.00, 1106.00),
    (CURRENT_DATE - INTERVAL '2 days', team_bravo_id, bm_melbet, 'direct_link', 48, 29, 1320.00, 924.00),
    (CURRENT_DATE - INTERVAL '4 days', team_bravo_id, bm_betwinner, 'promo_code', 42, 24, 1080.00, 756.00),
    (CURRENT_DATE - INTERVAL '6 days', team_bravo_id, bm_betwinner, 'direct_link', 38, 21, 940.00, 658.00);

  -- Team Charlie
  INSERT INTO public.performance_entries (date, team_id, bookmaker_id, link_identifier, registrations, deposits, revenue, net_revenue)
  VALUES 
    (CURRENT_DATE - INTERVAL '1 day', team_charlie_id, bm_linebet, 'promo_code', 25, 14, 620.00, 434.00),
    (CURRENT_DATE - INTERVAL '3 days', team_charlie_id, bm_linebet, 'direct_link', 22, 12, 530.00, 371.00),
    (CURRENT_DATE - INTERVAL '5 days', team_charlie_id, bm_1xbet, 'direct_link', 30, 17, 750.00, 525.00);

  -- CM Performance entries
  -- Sarah Dubois
  INSERT INTO public.performance_entries (date, profile_id, bookmaker_id, link_identifier, registrations, deposits, revenue, net_revenue)
  VALUES 
    (CURRENT_DATE - INTERVAL '1 day', cm1_id, bm_1xbet, 'direct_link', 18, 11, 480.00, 336.00),
    (CURRENT_DATE - INTERVAL '2 days', cm1_id, bm_1xbet, 'promo_code', 15, 9, 390.00, 273.00),
    (CURRENT_DATE - INTERVAL '4 days', cm1_id, bm_1win, 'direct_link', 12, 7, 310.00, 217.00);

  -- Marc Leblanc
  INSERT INTO public.performance_entries (date, profile_id, bookmaker_id, link_identifier, registrations, deposits, revenue, net_revenue)
  VALUES 
    (CURRENT_DATE - INTERVAL '1 day', cm2_id, bm_melbet, 'promo_code', 22, 14, 620.00, 434.00),
    (CURRENT_DATE - INTERVAL '3 days', cm2_id, bm_melbet, 'direct_link', 19, 11, 480.00, 336.00),
    (CURRENT_DATE - INTERVAL '5 days', cm2_id, bm_betwinner, 'promo_code', 16, 9, 400.00, 280.00);

  -- Julie Martin
  INSERT INTO public.performance_entries (date, profile_id, bookmaker_id, link_identifier, registrations, deposits, revenue, net_revenue)
  VALUES 
    (CURRENT_DATE - INTERVAL '1 day', cm3_id, bm_linebet, 'direct_link', 14, 8, 350.00, 245.00),
    (CURRENT_DATE - INTERVAL '2 days', cm3_id, bm_linebet, 'promo_code', 11, 6, 260.00, 182.00);

  -- Pierre Durand
  INSERT INTO public.performance_entries (date, profile_id, bookmaker_id, link_identifier, registrations, deposits, revenue, net_revenue)
  VALUES 
    (CURRENT_DATE - INTERVAL '1 day', cm4_id, bm_1xbet, 'direct_link', 25, 16, 710.00, 497.00),
    (CURRENT_DATE - INTERVAL '3 days', cm4_id, bm_1win, 'promo_code', 20, 12, 530.00, 371.00),
    (CURRENT_DATE - INTERVAL '6 days', cm4_id, bm_melbet, 'direct_link', 17, 10, 440.00, 308.00);

  -- Ajouter quelques liens affiliés personnalisés
  INSERT INTO public.affiliate_links (team_id, bookmaker_id, affiliate_link, promo_code)
  VALUES 
    (team_alpha_id, bm_1xbet, 'https://1xbet.com/aff/teamalpha', 'ALPHA2024'),
    (team_alpha_id, bm_1win, 'https://1win.com/aff/teamalpha', 'ALPHA1WIN'),
    (team_bravo_id, bm_melbet, 'https://melbet.com/aff/bravo', 'BRAVO100');

  INSERT INTO public.affiliate_links (profile_id, bookmaker_id, affiliate_link, promo_code)
  VALUES 
    (cm1_id, bm_1xbet, 'https://1xbet.com/sarah', 'SARAHBET'),
    (cm2_id, bm_melbet, 'https://melbet.com/marc', 'MARCVIP');

END $$;

-- Vérification
SELECT 'Teams: ' || COUNT(*) FROM public.teams;
SELECT 'CMs: ' || COUNT(*) FROM public.profiles WHERE role = 'cm';
SELECT 'Performance Entries: ' || COUNT(*) FROM public.performance_entries;
SELECT 'Affiliate Links: ' || COUNT(*) FROM public.affiliate_links;
