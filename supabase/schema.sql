-- Taco Food Tracker schema
-- Run in Supabase SQL editor (Dashboard > SQL Editor > New query > paste > Run).
-- All access goes through Next.js server routes using the service_role key,
-- so RLS stays ON with no public policies (client never touches these tables directly).

create extension if not exists pgcrypto;

create table if not exists household (
  id           uuid primary key default gen_random_uuid(),
  key          text unique not null,          -- secret slug in the URL (/h/<key>)
  cat_name     text not null default 'Taco',
  -- gram-equivalents used only for the "grams" view toggle; editable in Settings
  dry_scoop_g  numeric not null default 30,   -- 1 scoop dry  = N grams
  wet_pouch_g  numeric not null default 85,   -- 1 pouch wet  = N grams
  daily_target_g numeric,                     -- optional; null = no target
  created_at   timestamptz not null default now()
);

create table if not exists food_log (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references household(id) on delete cascade,
  fed_at        timestamptz not null default now(),
  food_type     text not null check (food_type in ('wet','dry')),
  amount        numeric not null check (amount > 0),
  unit          text not null check (unit in ('grams','scoop','pouch')),
  fed_by        text,
  note          text,
  created_at    timestamptz not null default now()
);

create table if not exists weight_log (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references household(id) on delete cascade,
  measured_on   date not null default current_date,
  weight_kg     numeric not null check (weight_kg > 0),
  created_at    timestamptz not null default now()
);

create index if not exists food_log_household_fed_at_idx on food_log (household_id, fed_at);
create index if not exists weight_log_household_measured_idx on weight_log (household_id, measured_on);

alter table household  enable row level security;
alter table food_log   enable row level security;
alter table weight_log enable row level security;
-- No policies added on purpose: only the service_role key (server-side) bypasses RLS.

-- Seed one household. Change the key to your own random secret, then use it in the URL.
insert into household (key, cat_name)
values ('taco-home-CHANGEME', 'Taco')
on conflict (key) do nothing;
