# Cactus Lab

## Status
_Last updated: 2026-05-18_
2 active clients. MRR: AED 8,500/month. Crystalline started May 18. Client portal system fully built and live — each client gets their own login-gated portal. Cross-device sync wired (⚠️ needs 1 Supabase SQL step to activate).

## Active Projects
- **Agency OS** — live at https://cactuslabos.netlify.app. Client portals built. Sync built (pending Supabase RLS).
- **Client Portals** — Pets Delight portal live (invite pending). Crystalline portal built (email needed). See [[Clients/Client Portal/]].
- **Vault Sync** — fully operational; Awab's machine auto-pulls every 5 min, wrapup pushes session notes automatically
- **Crystalline** — started May 18. Invoice 1 AED 2,500. First content items in portal.

## This Week (May 18)
- Built full client portal system: admin view (internal) + client view (login-gated per email)
- Client login at `/portal/login` — `raveena@petsdelight.com` maps to `/portal/pets-delight`
- Fixed sidebar broken logo + user avatar initials fallback
- Cross-device sync for todos + clients via Supabase Storage (`lib/sync.ts`)
- Crystalline added as second client with seed data and portal

## ⚠️ Action Required Tomorrow
1. **Supabase SQL** → run 3 RLS policies for `app-data` bucket → see session notes for SQL
2. **Invite Raveena** → Supabase Auth → Users → Invite → `raveena@petsdelight.com`
3. **Crystalline email** → get from client → add to `lib/portal-auth.ts` → redeploy
4. **WhatsApp number** → replace `+971501234567` in `lib/portal-seed.ts` with Awab's real number

## Decisions Log
| Date | Decision | Made by |
|------|----------|---------|
| 2026-05-18 | Client portals use Supabase Auth — client email maps to portal slug via `CLIENT_EMAIL_MAP`. No separate auth system needed. | Abdulrahman |
| 2026-05-18 | Approve/revision flow via WhatsApp pre-fill — no backend write, zero infrastructure cost | Abdulrahman |
| 2026-05-18 | Cross-device sync via Supabase Storage `app-data` bucket — localStorage stays as offline fallback | Abdulrahman |
| 2026-05-13 | No changes this session — orientation only | Abdulrahman |
| 2026-05-13 | Vault cleanup — merged Sessions 1 into Sessions, removed Meetings/Projects/Resources, consolidated Pets Delight notes into Clients/ | Abdulrahman |
| 2026-05-13 | Videos excluded from git (too large); use Google Drive for video sharing | Awab |
| 2026-05-13 | Notes/ in git repo is a copy — source of truth stays in Obsidian vault | Awab |

## Quick Links
- [[Roadmap]]
- [[Sessions/]]
- [[Notes/00 - Hub]]
