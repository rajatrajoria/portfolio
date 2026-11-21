-- ============================================================
-- Portfolio CMS schema. Paste into Supabase → SQL Editor → Run.
-- Safe to re-run.
-- ============================================================

-- Who may edit. Add your auth user id here after creating your account (see README).
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- The whole structured site (profile, sections, experience, projects, pages...) as one JSON document.
create table if not exists public.site (
  id int primary key default 1 check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Every save keeps the previous version here (last 100), so nothing is ever lost.
create table if not exists public.site_history (
  id bigint generated always as identity primary key,
  data jsonb not null,
  saved_at timestamptz not null default now()
);

create or replace function public.site_keep_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.site_history (data) values (old.data);
  delete from public.site_history
   where id not in (select id from public.site_history order by id desc limit 100);
  return new;
end;
$$;

drop trigger if exists site_history_trg on public.site;
create trigger site_history_trg before update on public.site
  for each row execute function public.site_keep_history();

-- Posts / albums / poems / stories, belonging to a page defined in site.data.pages
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  page_id text not null,
  slug text not null,
  title text not null default '',
  excerpt text not null default '',
  cover text not null default '',
  date date not null default current_date,
  tags text[] not null default '{}',
  published boolean not null default false,
  body text not null default '',
  extra jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_id, slug)
);
create index if not exists entries_page_date on public.entries (page_id, date desc);

-- ---------- Row level security ----------
alter table public.admins enable row level security;
alter table public.site enable row level security;
alter table public.site_history enable row level security;
alter table public.entries enable row level security;

drop policy if exists "admins read self" on public.admins;
create policy "admins read self" on public.admins for select using (user_id = auth.uid());

drop policy if exists "site public read" on public.site;
create policy "site public read" on public.site for select using (true);
drop policy if exists "site admin insert" on public.site;
create policy "site admin insert" on public.site for insert with check (public.is_admin());
drop policy if exists "site admin update" on public.site;
create policy "site admin update" on public.site for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "history admin read" on public.site_history;
create policy "history admin read" on public.site_history for select using (public.is_admin());

drop policy if exists "entries read" on public.entries;
create policy "entries read" on public.entries for select using (published or public.is_admin());
drop policy if exists "entries admin write" on public.entries;
create policy "entries admin write" on public.entries for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Storage (images, certificates, PDFs) ----------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());
