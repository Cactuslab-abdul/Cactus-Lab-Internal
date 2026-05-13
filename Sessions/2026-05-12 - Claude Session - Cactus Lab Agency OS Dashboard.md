# Session: Cactus Lab Agency OS Dashboard — 2026-05-12

## What We Worked On
- Spliced the new humanized 30-video content library into `dashboard.html` (continued from previous session) and updated easyIds so all 30 are marked "easy"
- Transformed the static Content Studio into a full **Cactus Lab Agency OS** — a multi-tab dashboard to run the whole agency
- Built and added **Overview tab**: revenue KPIs, paid vs pending invoices, content quota progress across all clients
- Built and added **Clients tab**: add/manage clients, expand to see quota tracker, log posts, view/print per-client invoice
- Built and added **Reports tab**: month selector, per-client metrics (followers, reach, impressions) with inline edit
- Built and added **Invoices tab**: auto-generated monthly invoices, mark-as-paid, printable HTML invoice generator (opens in new tab)
- Added **multi-brand content switcher** in the Content tab — Cactus Lab (30 videos) and Pets Delight (placeholder)
- Created `index.html` — clean Supabase-powered login page with email/password auth
- Created `schema.sql` — full Postgres schema: clients, monthly_posts, monthly_metrics, payments, post_log tables with RLS
- Created `netlify.toml` — static deploy config for Netlify
- Created `SETUP.md` — step-by-step guide: Supabase → schema → API keys → user accounts → Netlify deploy
- UI fixes: brand handles updated to `@cactuslab.ae` and `@petsdelight`, removed 21-Day Plan nav item, replaced follower count sidebar widget with logged-in user account display (avatar + email + sign-out)

## Key Decisions & Context
- **Stack**: Alpine.js + Supabase JS SDK v2 (CDN) + Tailwind — no build step, fully static, deploys with drag-and-drop
- **Hosting cost**: $0/month — Supabase free tier (500MB DB, 50K MAU) + Netlify free tier
- **Instagram post tracking**: manual "Log Post" button per client (no scraping/API) — auto-resets context by month
- **Invoice auto-generation**: triggered on `ensureCurrentMonthInvoices()` when any agency tab is opened — creates payment records for active clients if missing for current month; marks overdue automatically
- **Auth**: Supabase email/password — dashboard redirects to login if no session, login redirects to dashboard if already authenticated
- **Multi-user**: both Awab and ops manager get Supabase Auth accounts — same data, same access level (no roles yet)
- **Supabase config**: two placeholder strings `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` exist in both `index.html` and `dashboard.html` — must be filled before going online
- **`window._sb`**: Supabase client stored globally; if URL not set it's null and auth check is skipped (safe for local dev)
- **Invoice print**: uses `window.open()` + `document.write()` to generate a styled HTML invoice in a new tab with print button — bank details are placeholder `[Your Bank Name]` / `[Your IBAN]`

## Current State
Dashboard is fully built and opens locally at `/Users/awab/cactus-content-studio/dashboard.html`. All five new tabs (Overview, Clients, Content, Reports, Invoices) are functional in the UI. The Content tab has Cactus Lab's 30 humanized videos and a Pets Delight placeholder. Supabase is not yet connected — the two config strings are still placeholder values, so Clients/Reports/Invoices tabs show empty states locally. The login page (`index.html`) is built but only works once Supabase credentials are added. Everything is ready to go live — just needs the 7-step Supabase + Netlify setup from `SETUP.md`.

## Still To Do
- **Go live**: follow SETUP.md — create Supabase project, run schema.sql, paste URL + anon key into both HTML files, create user accounts, deploy to Netlify
- Add real bank details to invoice template in `dashboard.html` (search `[Your Bank Name]` and `[Your IBAN]`)
- Add Pets Delight content ideas to the Content tab (currently shows "coming soon" placeholder)
- Consider adding role-based access (Awab vs ops manager) — e.g. ops manager can log posts but not delete clients
- Consider adding a "post history" view per client showing the post log entries
- Consider connecting Instagram Graph API later (once client permissions sorted) to pull follower counts automatically
- Custom domain setup on Netlify (e.g. `dashboard.cactuslab.ae`)
- Seed initial client data: add Pets Delight with real retainer, quota, and contract start date

## Notes / Watch Out For
- `dashboard.html` is ~228KB — the Edit tool works but use Python splice method for any large JS data replacements
- The `ensureCurrentMonthInvoices()` function only creates invoices for clients where `monthly_retainer > 0` — Cactus Lab (internal brand with retainer = 0) won't get an invoice
- Supabase RLS policies require `auth.role() = 'authenticated'` — data is invisible to anyone not logged in, which is correct
- The `overviewStats` getter is a computed property — it recalculates on every reactive update, which is fine at this scale
- `window._sb = null` when Supabase URL is not set — all `if (window._sb)` guards prevent errors in local dev mode
- The 21-Day Playbook view HTML is still in the file (line ~263) even though the nav item was removed — it's harmless but could be cleaned up later
- Netlify `netlify.toml` publish dir is `.` (root) — all HTML files at root are served directly by path
