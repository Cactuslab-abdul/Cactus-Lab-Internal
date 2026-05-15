# 2026-05-15 — Cross-Device Sync Migration

## What Was Done
- Built `lib/sharedStorage.ts` with `sharedGet<T>` and `sharedSet` — server-first read, write-through to localStorage + Supabase Storage simultaneously
- Built `/api/shared-data` GET/POST route — proxies to Supabase Storage `app-data` bucket, auth via cookie session, service role key stays server-side
- Migrated 11 localStorage keys across 11 pages (clients, pipeline, payments, invoices, growth, generate, trends, analyze, outreach, proposals, dashboard)
- Auto-migration: on first load, if server is empty but localStorage has data, it's pushed to server — no manual migration needed
- Build clean, deployed to https://cactuslabos.netlify.app

## Key Decisions
- Used Supabase Storage (not a DB table) — Management API for table creation requires a PAT, not the service role key we have
- Write-through pattern: localStorage writes are instant, server push is fire-and-forget background — app never blocks on network
- No React hook abstraction — kept it as plain async utility functions to minimise changes to each page

## Next Steps
- Revoke Netlify token `nfp_jiiP4tQKjXhruQgQr1WWu9QMj6eJVfVtee3e`
- Test cross-device live: add something on PC, check it appears on phone
- Verify `app-data` bucket is set to private in Supabase dashboard
