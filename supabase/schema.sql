-- ============================================================
-- openwhen personal — Supabase schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Admin config (single row, hashed password)
create table if not exists admin_config (
  id          uuid primary key default gen_random_uuid(),
  username    text not null unique,
  password_hash text not null,
  created_at  timestamptz default now()
);

-- Collections
create table if not exists collections (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,          -- URL-safe ID for share link
  title         text not null default 'My Collection',
  recipient_name text not null default 'you',
  description   text,
  cover_color   text default '#fdf8f3',        -- customisable bg
  cover_emoji   text default '💌',
  font_style    text default 'serif',          -- serif | sans | mono
  is_published  boolean default false,
  view_count    integer default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Letters inside a collection
create table if not exists letters (
  id            uuid primary key default gen_random_uuid(),
  collection_id uuid references collections(id) on delete cascade,
  position      integer not null default 0,    -- ordering
  trigger_label text not null,                 -- "you're stressed"
  card_color    text default 'default',        -- default|pink|yellow|purple|sage|custom
  card_bg_hex   text,                          -- custom hex if card_color=custom
  card_emoji    text default '💌',
  content_html  text not null default '',      -- TipTap rich HTML (encrypted at rest)
  sticker_set   text[] default '{}',           -- emoji stickers
  bg_pattern    text default 'none',           -- none|dots|lines|hearts
  text_color    text default '#3d2c1e',
  font_override text,                          -- per-letter font override
  is_locked     boolean default false,         -- optional: lock until date
  unlock_date   timestamptz,
  opened_at     timestamptz,                   -- when recipient opened it
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Row Level Security
alter table admin_config  enable row level security;
alter table collections   enable row level security;
alter table letters       enable row level security;

-- Only service role (server-side API) can touch admin_config
create policy "service only" on admin_config
  using (false);   -- blocked from client; only service_role bypasses RLS

-- Collections: public can read published ones (for share link)
create policy "public read published collections"
  on collections for select
  using (is_published = true);

-- Letters: public can read letters of published collections
create policy "public read letters of published collections"
  on letters for select
  using (
    exists (
      select 1 from collections c
      where c.id = letters.collection_id
      and c.is_published = true
    )
  );

-- Function to auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger collections_updated_at
  before update on collections
  for each row execute function update_updated_at();

create trigger letters_updated_at
  before update on letters
  for each row execute function update_updated_at();

-- Increment view count safely
create or replace function increment_view_count(collection_slug text)
returns void language plpgsql security definer as $$
begin
  update collections
  set view_count = view_count + 1
  where slug = collection_slug and is_published = true;
end;
$$;
