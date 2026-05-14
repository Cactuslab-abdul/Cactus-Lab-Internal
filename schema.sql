-- Cactus Lab Agency OS — Supabase Schema
-- Run this once in the Supabase SQL Editor

create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- CLIENTS
-- ─────────────────────────────────────────
create table clients (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  instagram_handle text,
  email text,
  package_name text,
  monthly_retainer numeric(10,2) not null default 0,
  content_quota integer not null default 12,
  deliverables jsonb default '[]'::jsonb,
  contract_start_date date,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- MONTHLY POST TRACKING (quota vs published)
-- ─────────────────────────────────────────
create table monthly_posts (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references clients(id) on delete cascade not null,
  month date not null,          -- first day of month, e.g. 2026-05-01
  deliverable_id text not null default 'videos',
  posts_published integer not null default 0,
  quota integer not null,       -- snapshot of quota when record was created
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(client_id, month, deliverable_id)
);

-- ─────────────────────────────────────────
-- MONTHLY METRICS (followers, reach, etc.)
-- ─────────────────────────────────────────
create table monthly_metrics (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references clients(id) on delete cascade not null,
  month date not null,
  followers_start integer,
  followers_end integer,
  estimated_reach integer,
  impressions integer,
  profile_visits integer,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(client_id, month)
);

-- ─────────────────────────────────────────
-- PAYMENTS / INVOICES
-- ─────────────────────────────────────────
create table payments (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references clients(id) on delete cascade not null,
  month date not null,          -- invoice month (first day)
  amount numeric(10,2) not null,
  due_date date not null,
  paid_date date,
  invoice_number text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'overdue')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(client_id, month)
);

-- ─────────────────────────────────────────
-- POST LOG (individual post entries per client)
-- ─────────────────────────────────────────
create table post_log (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references clients(id) on delete cascade not null,
  posted_at timestamptz not null default now(),
  caption_preview text,
  format text,   -- reel, carousel, story, static
  notes text,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────
alter table clients enable row level security;
alter table monthly_posts enable row level security;
alter table monthly_metrics enable row level security;
alter table payments enable row level security;
alter table post_log enable row level security;

-- Only authenticated users (your team) can access data
create policy "Team access: clients" on clients for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Team access: monthly_posts" on monthly_posts for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Team access: monthly_metrics" on monthly_metrics for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Team access: payments" on payments for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Team access: post_log" on post_log for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ─────────────────────────────────────────
-- AUTO-UPDATE updated_at
-- ─────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger clients_updated_at before update on clients for each row execute function update_updated_at();
create trigger monthly_posts_updated_at before update on monthly_posts for each row execute function update_updated_at();
create trigger monthly_metrics_updated_at before update on monthly_metrics for each row execute function update_updated_at();
create trigger payments_updated_at before update on payments for each row execute function update_updated_at();

-- ─────────────────────────────────────────
-- SEED: Initial clients (edit to match real data)
-- ─────────────────────────────────────────
-- insert into clients (name, instagram_handle, package_name, monthly_retainer, content_quota, contract_start_date)
-- values
--   ('Pets Delight', '@petsdelight.uae', 'Content Management', 3500, 12, '2026-01-01'),
--   ('Cactus Lab', '@cactus.agency', 'Internal Brand', 0, 12, '2026-01-01');
