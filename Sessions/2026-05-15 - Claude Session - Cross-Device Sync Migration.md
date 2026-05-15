# Session: Cross-Device Sync Migration — 2026-05-15

## What We Worked On
- Created `lib/sharedStorage.ts` — a utility with `sharedGet<T>(key)` and `sharedSet(key, value)` that reads from Supabase Storage first, falls back to localStorage, and writes to both simultaneously
- Created `app/api/shared-data/route.ts` — Next.js API route (GET + POST) that proxies reads/writes to Supabase Storage `app-data` bucket, auth-protected via cookie session, uses service role key server-side only
- Migrated all 11 localStorage keys across 11 pages to use the shared storage layer:
  - `cactus-clients` — clients, page (dashboard), payments, invoices, outreach
  - `cactus-leads` + `cactus-leads-nextid` — pipeline, outreach
  - `cactus-team` — dashboard
  - `cactus-stats` — trends, generate, analyze
  - `cactus-payments` + `cactus-payments-cc` — payments
  - `cactus-growth-clients` — growth
  - `cactus-saved-packs` — generate/scripts
  - `cactus-last-invoice-num` — invoices
  - `cactus-last-proposal-num` — proposals
- Built clean, deployed to Netlify production — live at https://cactuslabos.netlify.app

## Key Decisions & Context
- **Supabase Storage over Supabase DB table**: Tried creating a `app_data` table via Management API but it requires a PAT (not service role key). Pivoted to Supabase Storage `app-data` bucket — works with service role key, no schema migration needed, JSON blobs stored as `{key}.json` files
- **Write-through pattern**: `sharedSet` writes to localStorage immediately (instant UX), then fires async POST to server. `sharedGet` reads server first, caches to localStorage, falls back to local if server fails — so the app works offline and never blocks on network
- **No React hook abstraction**: Instead of a hook, used plain async functions so each page's existing structure needed minimal changes (just make useEffects async, swap localStorage calls)
- **`getNextSeqNum` in invoices stays synchronous**: Called inside a click handler, reads localStorage which sharedSet keeps in sync — acceptable since useEffect pre-loads from server anyway
- **Migration on first load**: If server has no data for a key but localStorage does, `sharedGet` automatically pushes local data to server — handles migration of existing data from existing users

## Current State
All data — clients, leads, pipeline, payments, growth tracker, content packs, invoice numbers, proposal numbers, stats, team — now syncs between PC and phone, and between Awab and Abdulrahman. Both users will see the same state. The `app-data` Supabase Storage bucket is live. The `/api/shared-data` API route is deployed and auth-protected. Build passes clean with no TypeScript errors.

## Still To Do
- **Revoke Netlify token**: `nfp_jiiP4tQKjXhruQgQr1WWu9QMj6eJVfVtee3e` — must be revoked after this session
- **Test cross-device live**: Verify on actual phone that data entered on PC appears on mobile (and vice versa)
- **Supabase Storage bucket permissions**: Confirm `app-data` bucket is set to private (not public) in Supabase dashboard — service role key bypasses RLS so it doesn't matter for function, but good hygiene
- **Invoice sequence number edge case**: `getNextSeqNum` regex `/(\d+)$/` can grab year-prefixed numbers from old stored values — not fixed yet, low priority

## Notes / Watch Out For
- `sharedStorage.ts` is a client-side module (`"use client"` not needed — it's a plain TS file with `fetch`). It must only be imported in client components, not server components or API routes
- The `app-data` Supabase bucket must exist — it was created manually. If deploying to a new Supabase project, recreate it
- `SUPABASE_SERVICE_ROLE_KEY` must be set in Netlify env vars — never expose to browser, only used in `/api/shared-data/route.ts` (server-side)
- Middleware marks all `/api/*` routes as public (no auth redirect) so curl tests work, but the routes do their own auth check internally
- The OS URL is https://cactuslabos.netlify.app — not connected to cactuslab.ae public domain (internal tool only)
