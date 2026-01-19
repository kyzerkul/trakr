-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create teams table
create table if not exists public.teams (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text check (role in ('admin', 'editor', 'cm')),
  team_id uuid references public.teams(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create bookmakers table
create table if not exists public.bookmakers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create performance_entries table
create table if not exists public.performance_entries (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  profile_id uuid references public.profiles(id) not null,
  bookmaker_id uuid references public.bookmakers(id) not null,
  link_identifier text,
  registrations integer default 0,
  deposits integer default 0,
  revenue numeric(10, 2) default 0,
  net_revenue numeric(10, 2) default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.teams enable row level security;
alter table public.profiles enable row level security;
alter table public.bookmakers enable row level security;
alter table public.performance_entries enable row level security;

-- Policies
create policy "Allow read access for authenticated users" on public.teams for select using (auth.role() = 'authenticated');
create policy "Allow read access for authenticated users" on public.profiles for select using (auth.role() = 'authenticated');
create policy "Allow read access for authenticated users" on public.bookmakers for select using (auth.role() = 'authenticated');
create policy "Allow read access for authenticated users" on public.performance_entries for select using (auth.role() = 'authenticated');

create policy "Allow insert for authenticated users" on public.performance_entries for insert with check (auth.role() = 'authenticated');
create policy "Allow update for authenticated users" on public.profiles for update using (auth.uid() = id);

-- Seed Data (Run only if needed)
insert into public.teams (name) values ('Team Joseph'), ('Team Peter'), ('Team Henry'), ('Community Managers') on conflict do nothing;
insert into public.bookmakers (name) values ('Bet365'), ('DraftKings'), ('FanDuel'), ('BetMGM') on conflict do nothing;
