# Cactus Lab

## Status
_Last updated: 2026-05-18 (end of day)_
2 active clients. MRR: AED 8,500/month. Crystalline started May 18. Client portal system fully built and live. Cross-device sync wired but **intermittent — needs investigation tomorrow morning**.

## Active Projects
- **Agency OS** — live at https://cactuslabos.netlify.app. Client portals built. Sync deployed but unreliable.
- **Client Portals** — Pets Delight portal live (invite pending). Crystalline portal built (email needed). See [[Clients/Client Portal/]].
- **Vault Sync** — fully operational; Awab's machine auto-pulls every 5 min
- **Crystalline** — started May 18. Invoice 1 AED 2,500. First content items in portal.

## This Week (May 18)
- Built full client portal system: admin view (internal) + client view (login-gated per email)
- Client login at `/portal/login` — `raveena@petsdelight.com` maps to `/portal/pets-delight`
- Fixed sidebar broken logo + user avatar initials fallback
- Cross-device sync for todos + clients via Supabase Storage (`lib/sync.ts`) — deployed, debugging in progress
- Crystalline added as second client with seed data and portal
- Verbose sync logging added to `lib/sync.ts` to diagnose tomorrow

## 🔴 Fix First Thing Tomorrow
1. **Cross-device task sync** — Awab can't see Abdul's tasks. Verbose `[sync]` logs now in console. Open Tasks page on both devices, check console for auth state + success/fail. Fix whatever's blocking.
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
