# Cactus Lab

## Status
_Last updated: 2026-05-15_
Agency OS live at https://cactuslabos.netlify.app — cross-device sync fully working. All data (clients, leads, payments, invoices, growth, content packs) now syncs between PC and phone, and between Awab and Abdulrahman.
Shared git repo fully synced — both Awab and AbouZaid connected. Auto-sync runs every 5 min on Awab's machine.

## Active Projects
- **Agency OS** — live + cross-device sync complete. Data syncs via Supabase Storage `app-data` bucket.
- **Vault Sync** — fully operational; Awab's machine auto-pulls every 5 min, wrapup pushes session notes automatically

## This Week
- Migrated all localStorage → Supabase Storage for cross-device data sync
- Created `/api/shared-data` API route (auth-protected, service role key server-side only)
- Created `lib/sharedStorage.ts` — write-through cache (localStorage + Supabase) with server-first reads
- Updated 11 pages × 11 storage keys — zero breaking changes, all existing data auto-migrates on first load

## Decisions Log
| Date | Decision | Made by |
|------|----------|---------|
| 2026-05-13 | No changes this session — orientation only | Abdulrahman |
| 2026-05-13 | Vault cleanup — merged Sessions 1 into Sessions, removed Meetings/Projects/Resources, consolidated Pets Delight notes into Clients/ | Abdulrahman |
| 2026-05-13 | Videos excluded from git (too large); use Google Drive for video sharing | Awab |
| 2026-05-13 | Notes/ in git repo is a copy — source of truth stays in Obsidian vault | Awab |

## Quick Links
- [[Roadmap]]
- [[Sessions/]]
- [[Notes/00 - Hub]]
