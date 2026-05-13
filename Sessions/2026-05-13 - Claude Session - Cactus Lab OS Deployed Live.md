# Session: Cactus Lab Agency OS Deployed Live — 2026-05-13

## What We Worked On
- **Theme overhaul**: tried light theme (Donezo-style), found it broke visibility, reverted to dark with "bubbly" inspired-by polish — gradient backgrounds, soft shadows, 20px rounded cards, glass-blur top bar, green accent halos
- **Removed all emojis from UI** and replaced with inline SVG icons (Lucide-style): sidebar nav, command icons, empty states, avatars, difficulty cards, cactus logo (gradient pill)
- **Added persistent top bar** that shows current section name, date, and user avatar — sticky with backdrop blur
- **Sidebar redesign**: gradient pill logo, rounded-xl nav items with active indicator line, cleaner spacing, user account block at bottom instead of follower count widget
- **Fixed Add Client bug**: implemented localStorage fallback layer (`_isOnline()`, `_lsGet`, `_lsSet`) so the dashboard works fully offline before Supabase is connected
- **Multi-deliverable support per client**: added `deliverables` JSONB structure (e.g. Pets Delight = 18 Videos + 8 LinkedIn Posts), each tracked separately with its own progress bar
- **Updated invoice timing**: now generates on the 25th of the month for the NEXT month, due on the 1st (was: 5th of current month). Sets `hello@cactuslab.ae` as from-address in invoice template
- **Added Email invoice button**: opens `mailto:` with pre-filled subject/body, CC'd to `hello@cactuslab.ae`
- **Built Welcome / Dive In screen**: full-screen overlay shown on every login with time-aware greeting ("Good morning/afternoon/evening"), first-name display, date + time, "Dive in" CTA with portal-style scale + blur + fade animation (~850ms)
- **Display name resolution**: reads from Supabase `user_metadata.display_name` first, falls back to email prefix (auto-capitalizes `awab.sirelkhatim` → "Awab")
- **Schema updated**: added `email`, `deliverables` (jsonb) to clients; added `deliverable_id` + composite unique constraint to monthly_posts
- **Deployed Supabase project** `cactus-lab` in Bahrain region; schema.sql executed successfully; Awab's auth user created
- **Deployed to Netlify**: live at `https://cactuslabos.netlify.app/` (started as `lovely-meringue-022722.netlify.app`, renamed); Supabase Site URL + Redirect URLs whitelisted; login confirmed working

## Key Decisions & Context
- **Theme**: light theme attempt was rejected — "mix" interpretation = dark cards but "bubbly" feel inspired by Donezo reference. Final = dark with gradient cards, soft shadows, more rounded corners
- **Localstorage-first architecture**: every data method checks `_isOnline()` and falls back to localStorage if Supabase isn't reachable. This means the dashboard is fully usable even before/without Supabase — but data won't sync between users until online
- **Deliverables structure**: stored as JSONB array on clients. Each item has `{id, label, quota}`. Falls back to legacy `content_quota` for old records via `getClientDeliverables()`. Tracking is per-deliverable via `monthly_posts.deliverable_id`
- **Invoice automation has no real email sending**: the "Email" button only opens the user's email client via `mailto:`. True automated send would require Supabase Edge Function + Resend API key (not done yet)
- **Welcome screen state lives in dashboard.html**: `showWelcome: true` by default, dismissed on user click. Resets every page load (= every login). No "skip forever" option
- **Deployment is manual drag-and-drop**: clean folder at `/Users/awab/cactus-lab-deploy/` contains only `index.html`, `dashboard.html`, `schema.sql`, `netlify.toml` — main project folder `/Users/awab/cactus-content-studio/` has Next.js leftovers that were breaking Netlify autodetection
- **Supabase credentials are publicly visible** in the deployed HTML (anon key in JS). This is fine because RLS policies in schema.sql restrict all tables to `auth.role() = 'authenticated'` only

## Current State
The Cactus Lab Agency OS is **live in production** at `https://cactuslabos.netlify.app/`. Awab has logged in successfully. The Supabase project (`tpxyegbeluspgashouzb.supabase.co`) is provisioned with all 5 tables (clients, monthly_posts, monthly_metrics, payments, post_log) and RLS policies. Authentication works. The welcome → dive-in → dashboard flow is functional. The dashboard supports adding clients with multi-type deliverables, logging posts per deliverable, monthly metrics tracking, and auto-generated invoices. No client records exist yet in the live database. Updates currently require manual re-drag of the deploy folder to Netlify — no auto-deploy pipeline set up.

## Still To Do
- **Add real client records**: Pets Delight (18 Videos + 8 LinkedIn Posts), Cactus Lab (internal, retainer = 0)
- **Update bank details in invoice template**: search `[Your Bank Name]` and `[Your IBAN]` in `dashboard.html`, replace with real banking info
- **Create ops manager auth account** in Supabase (user said "im doing one for now")
- **Optional: set up GitHub auto-deploy** so changes push automatically when Awab asks for edits (5-min one-time setup)
- **Optional: real email sending** via Supabase Edge Function + Resend API for true automated invoice delivery on the 25th
- **Optional: Pets Delight content ideas** — Content tab still shows "coming soon" for that brand
- **Optional: custom domain** like `dashboard.cactuslab.ae` (Netlify free SSL)

## Notes / Watch Out For
- **Two folder gotcha**: project lives in `/Users/awab/cactus-content-studio/` but Netlify deploys from `/Users/awab/cactus-lab-deploy/`. Edits to the main folder need to be **copied** to the deploy folder before re-uploading. Easy to forget.
- **Next.js leftovers in main folder** (`next.config.mjs`, `package.json`, `node_modules`) caused the initial Netlify deploy to fail — Netlify auto-detected Next.js and tried to build. The clean deploy folder sidesteps this. Don't drop the main folder into Netlify.
- **Netlify site renamed** from `lovely-meringue-022722` to `cactuslabos`. Supabase URL Configuration must match the current domain — if you ever change the Netlify domain again, update Supabase Auth → URL Configuration → Site URL and Redirect URLs.
- **Display name SQL update failed** for unclear reason — Awab couldn't set `raw_user_meta_data`. Current fallback uses email prefix (works fine — `awab.sirelkhatim` → "Awab"). If they want to set a custom display name later, try the Supabase Auth UI's user detail panel or re-attempt the SQL.
- **Supabase key format is new (`sb_publishable_...`)**, not the old JWT (`eyJ...`). Both work with supabase-js v2.
- **`netlify.toml` in deploy folder is minimal** — `publish = "."`, `command = ""`. The one in the main `cactus-content-studio` folder has redirects but that's not the one being deployed.
- **localStorage data is per-browser** — anything Awab adds locally without Supabase won't sync to ops manager's device. Once Supabase is the primary, this matters less, but be aware during testing.
- **`/index.html` route**: Netlify serves it as the root, login flow assumes Supabase redirects work. If session token issues arise, check that Site URL exactly matches the Netlify domain (no trailing slash).
- **Welcome screen z-index is 100** — sits above the sticky topbar (z-20) and modals (z-50). Don't change that without checking modal stacking.
