# Session: Agency OS UI & Outreach Polish — 2026-05-15

## What We Worked On
- **Cross-device sync confirmed working** — all 11 data keys now sync via Supabase Storage `app-data` bucket between PC, phone, Awab and Abdul
- **Batch API added** — `/api/shared-data-batch` GET/POST replaces 11 individual calls; `pushAllLocalToServer()` fires a single batch POST on dashboard load
- **Speed improvement** — dashboard `useEffect` now uses `sharedGetMany` (1 round-trip instead of 4 sequential calls)
- **Profile photos in sidebar** — sidebar reads `meta.avatar_url` first, falls back to `cactus-team` shared storage; photo upload also writes back to `cactus-team` so the other user's dashboard updates
- **Avatar URLs hardcoded in DEFAULT_TEAM** — Awab and Abdul's Supabase Storage URLs set in `app/page.tsx`
- **Login page logo** — replaced SVG plant icon with `/public/logo-cactus.png` (Cactus Lab cactus image)
- **Online presence** — Supabase Realtime presence channel updated with explicit join/leave handlers and `config: { presence: { key: user.email } }` for bidirectional indicator
- **Outreach instructions field** — added `instructions` textarea (col-span-2, 3 rows) to outreach form; supports targeting specific company variant, finding email, custom research direction
- **Email leads feature** — when instructions mention finding an email, API returns `emailLeads[]` array; UI shows clickable buttons to auto-fill recipient email field
- **Humanized email system prompt** — rewrote `outreachResearcher` in `lib/anthropic.ts`: banned em dashes, banned AI phrases ("leverage", "synergy", "game-changer", etc.), tone rules, max 120 words, structured human-sounding format
- **Build completed successfully** — `npm run build` passed; all routes clean

## Key Decisions & Context
- Write-through cache pattern: `sharedSet` writes localStorage immediately, server push is fire-and-forget background (keeps UI snappy)
- `SUPABASE_SERVICE_ROLE_KEY` stays server-side only — never in browser
- Netlify personal access tokens are single-use — must be revoked after each deploy session
- Outreach email format: opener (specific brand observation) → Cactus Lab intro → Pets Delight proof → content ideas offer → low-commitment CTA
- Profile sync is two-way: sidebar upload writes to `cactus-team` storage so other user sees update without re-uploading

## Current State
Agency OS is live at `cactuslabos.netlify.app`. Cross-device sync works. Profile photos show in sidebar for both users. Outreach tool has instructions field and email leads feature. The humanized email system prompt has been updated in `lib/anthropic.ts` and built successfully — but NOT yet deployed to Netlify. The deploy is blocked waiting for a new Netlify auth token (old token from previous session should be revoked). Meeting notes for Awab/Abdul were also generated.

## Still To Do
- [ ] Provide new Netlify token and run `npx netlify deploy --prod --dir .next` to ship the humanized email changes
- [ ] Revoke previous Netlify token `nfp_jiiP4tQKjXhruQgQr1WWu9QMj6eJVfVtee3e` if not already done
- [ ] Test online presence indicator bidirectionally (both users active at same time)
- [ ] Test outreach email output after deploy — check no em dashes, human tone
- [ ] Ask Pets Delight for 3 referrals + written testimonial (from CLAUDE.md priorities)
- [ ] Configure WhatsApp Business (Cactus Lab name, logo, hours)
- [ ] Set up Wave or Zoho Invoice

## Notes / Watch Out For
- The `pushAllLocalToServer()` call fires on every dashboard load — this is intentional to keep server in sync, but watch for rate limits if there are many concurrent users
- `cactus-team.json` in Supabase Storage is the source of truth for profile photos between devices — if photos stop showing, check this key in the `app-data` bucket
- When re-deploying, always generate a new Netlify token — never reuse from a previous session
- `sharedGet` reads server first, falls back to localStorage — so on first load after a long gap, it may be slightly slower than a pure localStorage read
- Outreach email leads feature only activates when the `instructions` field contains email-finding language (regex: `/find.*(email|contact)|email.*(find|search|look)/i`)
