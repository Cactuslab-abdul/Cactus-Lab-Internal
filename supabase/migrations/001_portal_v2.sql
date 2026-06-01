-- Cactus Lab Portal v2 — Run in Supabase SQL Editor
-- Strict dual-view: ADMIN/EDITOR (internal) vs CLIENT (client-facing)

create extension if not exists "uuid-ossp";

-- ─── COMPANIES (replaces scattered client JSON) ─────────────────────────────
create table if not exists companies (
  id            uuid default uuid_generate_v4() primary key,
  slug          text not null unique,          -- e.g. "pets-delight"
  name          text not null,
  logo_url      text,
  instagram     text,
  email         text,
  whatsapp      text,
  package_name  text,
  retainer_aed  numeric(10,2) not null default 0,
  video_quota   integer not null default 15,
  start_date    date,
  is_active     boolean not null default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ─── PORTAL ROLES (maps Supabase auth user → role + company) ────────────────
create table if not exists portal_roles (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('ADMIN', 'EDITOR', 'CLIENT')),
  company_id  uuid references companies(id) on delete set null,
  created_at  timestamptz default now(),
  unique(user_id)
);

-- ─── VIDEOS ─────────────────────────────────────────────────────────────────
create table if not exists videos (
  id              uuid default uuid_generate_v4() primary key,
  company_id      uuid not null references companies(id) on delete cascade,
  title           text not null,
  type            text not null default 'Reel' check (type in ('Reel','Story','Post','TikTok','LinkedIn')),
  month           text not null,               -- "2026-06"
  number          integer not null default 1,  -- sequential within month
  stream_url      text,                        -- Google Drive or any URL
  thumbnail_url   text,
  caption         text,
  posted_url      text,
  status          text not null default 'idea_pending'
                    check (status in ('idea_pending','idea_approved','idea_revision','in_production','ready_for_review','client_approved','posted')),
  internal_notes  text,                        -- NEVER exposed to CLIENT role
  client_note     text,                        -- client's revision feedback
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── VIDEO COMMENTS (timestamped, Frame.io style) ───────────────────────────
create table if not exists video_comments (
  id                uuid default uuid_generate_v4() primary key,
  video_id          uuid not null references videos(id) on delete cascade,
  user_id           uuid,                      -- nullable (no auth required)
  user_email        text,                      -- display name / email
  timestamp_seconds integer,                   -- nullable = general comment
  comment_text      text not null,
  created_at        timestamptz default now()
);

-- ─── METRICS (monthly snapshots per company) ─────────────────────────────────
create table if not exists metrics (
  id               uuid default uuid_generate_v4() primary key,
  company_id       uuid not null references companies(id) on delete cascade,
  month            text not null,              -- "2026-06"
  followers        integer default 0,
  followers_change integer default 0,
  views            integer default 0,
  reach            integer default 0,
  engagement_rate  numeric(5,2) default 0,
  top_post_url     text,
  notes            text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  unique(company_id, month)
);

-- ─── INVOICES ────────────────────────────────────────────────────────────────
create table if not exists invoices (
  id              uuid default uuid_generate_v4() primary key,
  company_id      uuid not null references companies(id) on delete cascade,
  invoice_number  text not null,
  month           text not null,              -- "June 2026"
  invoice_date    date not null,
  due_date        date not null,
  amount_aed      numeric(10,2) not null,
  discount_aed    numeric(10,2) default 0,
  total_aed       numeric(10,2) not null,
  status          text not null default 'pending'
                    check (status in ('pending','paid','overdue')),
  paid_date       date,
  notes           text,
  line_items      jsonb default '[]'::jsonb,  -- array of {desc, qty, rate}
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── UPDATED_AT TRIGGERS ─────────────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger companies_updated_at    before update on companies    for each row execute function update_updated_at();
create trigger videos_updated_at       before update on videos       for each row execute function update_updated_at();
create trigger metrics_updated_at      before update on metrics      for each row execute function update_updated_at();
create trigger invoices_updated_at     before update on invoices     for each row execute function update_updated_at();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────
alter table companies      enable row level security;
alter table portal_roles   enable row level security;
alter table videos         enable row level security;
alter table video_comments enable row level security;
alter table metrics        enable row level security;
alter table invoices       enable row level security;

-- Helper: get calling user's role record
create or replace function get_my_portal_role()
returns portal_roles as $$
  select * from portal_roles where user_id = auth.uid() limit 1;
$$ language sql security definer;

-- Helper: get calling user's company_id (for CLIENT scoping)
create or replace function get_my_company_id()
returns uuid as $$
  select company_id from portal_roles where user_id = auth.uid() limit 1;
$$ language sql security definer;

-- COMPANIES: admins/editors see all; clients see only their own
create policy "companies_admin_editor" on companies for all
  using ((select role from portal_roles where user_id = auth.uid()) in ('ADMIN','EDITOR'));

create policy "companies_client_select" on companies for select
  using (id = get_my_company_id());

-- PORTAL_ROLES: users can read their own row; admins can manage all
create policy "portal_roles_own" on portal_roles for select
  using (user_id = auth.uid());

create policy "portal_roles_admin" on portal_roles for all
  using ((select role from portal_roles where user_id = auth.uid()) = 'ADMIN');

-- VIDEOS: admins/editors see all; clients see only their company's (minus internal_notes via API layer)
create policy "videos_admin_editor" on videos for all
  using ((select role from portal_roles where user_id = auth.uid()) in ('ADMIN','EDITOR'));

create policy "videos_client_select" on videos for select
  using (
    (select role from portal_roles where user_id = auth.uid()) = 'CLIENT'
    and company_id = get_my_company_id()
  );

-- VIDEO_COMMENTS: authenticated users can read comments on videos they can see
create policy "comments_read" on video_comments for select
  using (
    exists (
      select 1 from videos v
      where v.id = video_id
        and (
          (select role from portal_roles where user_id = auth.uid()) in ('ADMIN','EDITOR')
          or (
            (select role from portal_roles where user_id = auth.uid()) = 'CLIENT'
            and v.company_id = get_my_company_id()
          )
        )
    )
  );

create policy "comments_insert" on video_comments for insert
  with check (user_id = auth.uid());

-- METRICS: admins/editors full access; clients read-only their company
create policy "metrics_admin_editor" on metrics for all
  using ((select role from portal_roles where user_id = auth.uid()) in ('ADMIN','EDITOR'));

create policy "metrics_client_select" on metrics for select
  using (
    (select role from portal_roles where user_id = auth.uid()) = 'CLIENT'
    and company_id = get_my_company_id()
  );

-- INVOICES: admins/editors full access; clients read-only their company
create policy "invoices_admin_editor" on invoices for all
  using ((select role from portal_roles where user_id = auth.uid()) in ('ADMIN','EDITOR'));

create policy "invoices_client_select" on invoices for select
  using (
    (select role from portal_roles where user_id = auth.uid()) = 'CLIENT'
    and company_id = get_my_company_id()
  );

-- ─── SEED: Pets Delight ──────────────────────────────────────────────────────
-- Run manually after migration:
--
-- insert into companies (slug, name, logo_url, package_name, retainer_aed, video_quota, start_date)
-- values ('pets-delight', 'Pets Delight', null, 'Social Media Management', 5500, 15, '2026-03-01');
--
-- Then insert portal_role for raveena@petsdelight.com:
-- insert into portal_roles (user_id, role, company_id)
-- values ('<raveena-auth-uid>', 'CLIENT', '<pets-delight-company-id>');
--
-- And for awab + abdul:
-- insert into portal_roles (user_id, role) values ('<awab-uid>', 'ADMIN');
-- insert into portal_roles (user_id, role) values ('<abdul-uid>', 'ADMIN');
