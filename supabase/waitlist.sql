-- Fade barber waitlist table for the landing page (PUBLIC_WAITLIST_MODE=supabase).
-- Run once in the Supabase SQL editor (or add to your migrations).
--
-- Security model:
--   * RLS is ENABLED.
--   * The `anon` role (the publishable key, or legacy anon key, shipped in the static site) may INSERT only.
--   * No SELECT/UPDATE/DELETE policy exists for anon or authenticated, so sign-ups cannot be read back
--     from the browser. Read them in the Supabase dashboard or with the service_role key server-side.
--   * The landing page sends `Prefer: return=minimal`, so INSERT works without SELECT rights.

create extension if not exists pgcrypto;

create table if not exists public.barber_waitlist (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(btrim(name)) between 1 and 120),
  email       text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$'),
  city        text not null default 'Chicago' check (char_length(btrim(city)) between 1 and 120),
  role        text not null check (role in ('barber', 'shop_owner')),
  shop_name   text check (shop_name is null or char_length(shop_name) <= 160),
  instagram   text check (instagram is null or instagram ~ '^[A-Za-z0-9._]{1,30}$'),
  consent     boolean not null check (consent = true),
  source      text not null default 'landing' check (char_length(source) <= 60)
);

comment on table public.barber_waitlist is 'Barber early-access waitlist from the fade-landing site. Insert-only for anon.';

-- One sign-up per email (case-insensitive). Duplicate inserts return HTTP 409, which the form
-- treats as "already on the list".
create unique index if not exists barber_waitlist_email_lower_key
  on public.barber_waitlist (lower(email));

alter table public.barber_waitlist enable row level security;

-- Lock down privileges, then grant only INSERT on the user-supplied columns.
revoke all on table public.barber_waitlist from anon, authenticated;
grant insert (name, email, city, role, shop_name, instagram, consent, source)
  on table public.barber_waitlist to anon;

drop policy if exists "anon can join waitlist" on public.barber_waitlist;
create policy "anon can join waitlist"
  on public.barber_waitlist
  for insert
  to anon
  with check (consent = true and source = 'landing');

-- Intentionally NO select/update/delete policies.
