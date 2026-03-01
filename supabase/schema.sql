-- Supabase schema for gcg-deckmaker-next
-- Run this in Supabase SQL Editor.

create table if not exists public.app_users (
  id uuid primary key,
  name text not null unique,
  is_read_only boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.decks (
  id uuid primary key,
  name text not null,
  owner_id uuid references public.app_users(id) on delete cascade,
  is_public boolean not null default false,
  cards jsonb not null default '{}'::jsonb,
  icon_cards jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists decks_owner_updated_idx
  on public.decks(owner_id, updated_at desc);
create index if not exists decks_public_updated_idx
  on public.decks(is_public, updated_at desc);
create index if not exists decks_updated_idx
  on public.decks(updated_at desc);

-- Optional: Row Level Security.
-- For server-side service role access only, RLS can stay disabled.
-- If you plan direct client access later, enable RLS and add policies.
