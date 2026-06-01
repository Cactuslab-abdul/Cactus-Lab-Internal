-- ─────────────────────────────────────────────────────────────────────────────
-- Cactus Lab Portal — Seed: Pets Delight
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql/new
--
-- Prereq: run supabase/migrations/001_portal_v2.sql first.
--
-- If you've already seeded with old data, run TRUNCATE below to reset:
--   TRUNCATE videos, metrics, invoices, video_comments, companies RESTART IDENTITY CASCADE;
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Pets Delight company
INSERT INTO companies (slug, name, package_name, retainer_aed, video_quota, start_date, instagram, email, is_active)
VALUES (
  'pets-delight',
  'Pets Delight',
  'Growth Package — 15 Reels/month',
  5500,
  15,
  '2026-03-01',
  '@petsdelightdubai',
  'hello@petsdelight.ae',
  true
) ON CONFLICT (slug) DO NOTHING;

-- 2. Videos (note: month is stored as 'YYYY-MM' text, NOT a full date)
DO $$
DECLARE
  cid uuid;
BEGIN
  SELECT id INTO cid FROM companies WHERE slug = 'pets-delight';

  INSERT INTO videos (company_id, title, type, month, number, stream_url, caption, status, internal_notes) VALUES
  (cid, 'Golden Retriever Bath Day — slow-mo drop in',        'Reel', '2026-05', 1, NULL, E'It''s bath time! 🐾 Our Golden loves the attention — do yours? Tell us in the comments!', 'posted',           NULL),
  (cid, 'Cat vs. Automatic Feeder — First Reaction',           'Reel', '2026-05', 2, NULL, E'Watch Luna meet her new best friend 😂🐱 Would your cat pass the test?',                  'posted',           NULL),
  (cid, 'Behind the shelves — new arrivals tour',              'Reel', '2026-05', 3, NULL, E'New stock just landed! 🛒 Premium pet food, toys, and accessories in-store and online.', 'client_approved',  NULL),
  (cid, 'Dog training tip — sit in 3 steps',                   'Reel', '2026-05', 4, NULL, E'Every dog can learn this in one session. Try it tonight! 🐶',                            'in_production',    'Need B-roll from store, waiting on editor'),
  (cid, 'Persian cat grooming routine — step by step',         'Reel', '2026-06', 1, NULL, E'Keep your Persian looking runway-ready with this grooming routine ✨🐾',                'ready_for_review', NULL),
  (cid, 'Rabbit care 101 — what nobody tells you',             'Reel', '2026-06', 2, NULL, E'Thinking of getting a rabbit? Watch this first 🐰',                                       'idea_approved',    NULL),
  (cid, 'Summer heat & pets — safety guide',                   'Reel', '2026-06', 3, NULL, E'Dubai summers hit different for pets. Here''s how to keep them safe 🌡️❤️',              'idea_pending',     NULL);

END $$;

-- 3. Metrics (month also 'YYYY-MM' text)
DO $$
DECLARE
  cid uuid;
BEGIN
  SELECT id INTO cid FROM companies WHERE slug = 'pets-delight';

  INSERT INTO metrics (company_id, month, followers, followers_change, views, reach, engagement_rate, notes)
  VALUES
  (cid, '2026-05', 4820, 312, 84200, 61300, 4.7, 'Best month so far. The Golden Retriever bath reel hit 28K views on its own.'),
  (cid, '2026-04', 4508, 241, 67100, 49800, 3.9, NULL),
  (cid, '2026-03', 4267, 190, 52300, 39100, 3.4, NULL)
  ON CONFLICT (company_id, month) DO NOTHING;
END $$;

-- 4. Invoices (month is text display label like 'June 2026')
DO $$
DECLARE
  cid uuid;
BEGIN
  SELECT id INTO cid FROM companies WHERE slug = 'pets-delight';

  INSERT INTO invoices (company_id, invoice_number, month, invoice_date, due_date, amount_aed, discount_aed, total_aed, status, paid_date, line_items)
  VALUES
  (cid, 'PD-APR-002', 'April 2026', '2026-04-01', '2026-04-05', 5500, 0, 5500, 'paid',    '2026-04-03',
   '[{"desc": "Social Media Management — April 2026 (15 Reels)", "qty": 1, "rate": 5500, "type": "retainer"}]'::jsonb),
  (cid, 'PD-MAY-003', 'May 2026',   '2026-05-01', '2026-05-05', 5500, 0, 5500, 'paid',    '2026-05-04',
   '[{"desc": "Social Media Management — May 2026 (15 Reels)", "qty": 1, "rate": 5500, "type": "retainer"}]'::jsonb),
  (cid, 'PD-JUN-004', 'June 2026',  '2026-06-01', '2026-06-05', 5500, 0, 5500, 'pending', NULL,
   '[{"desc": "Social Media Management — June 2026 (15 Reels)", "qty": 1, "rate": 5500, "type": "retainer"}]'::jsonb)
  ON CONFLICT DO NOTHING;
END $$;
