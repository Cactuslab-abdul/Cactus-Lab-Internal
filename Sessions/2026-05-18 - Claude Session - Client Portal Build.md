# Session — Client Portal Build
_Date: 2026-05-18 | Project: Cactus Lab Agency OS_

## What Was Worked On
Full client portal system built from scratch — two separate views: internal admin (account managers) and client-facing (login-gated per client email). Also fixed broken sidebar images and wired cross-device sync for todos and clients.

---

## Completed This Session

### 1. Sidebar Image Fixes
- **Logo:** Replaced dead Supabase URL with `/logo-cactus.png` (file already in `/public/`)
- **User avatar:** Fixed `onError` handler so broken avatar falls back to initials instead of broken image icon
- File: `components/sidebar.tsx`

### 2. Cross-Device Sync (Todos + Clients)
- Problem: Awab's changes weren't visible on Abdul's device (localStorage is per-browser)
- Solution: Created `lib/sync.ts` — Supabase Storage `app-data` bucket as shared source of truth
- `syncLoad<T>(key, localFallback)` — downloads from Supabase, falls back to localStorage if unavailable
- `syncSave<T>(key, value)` — uploads to Supabase silently (localStorage already saved, so no data loss on failure)
- Applied to: `app/todos/page.tsx` and `app/clients/page.tsx`

**⚠️ PENDING — One manual step required:**
The `app-data` bucket has 0 RLS policies (private, default deny). Run this SQL in Supabase SQL Editor:
```sql
CREATE POLICY "Authenticated read app-data"
ON storage.objects FOR SELECT
USING (bucket_id = 'app-data' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated insert app-data"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'app-data' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated update app-data"
ON storage.objects FOR UPDATE
USING (bucket_id = 'app-data' AND auth.role() = 'authenticated');
```
→ Dashboard: https://tpxyegbeluspgashouzb.supabase.co → SQL Editor → paste → Run

### 3. Client Portal System (Full Build)

#### New Files Created
| File | Purpose |
|------|---------|
| `lib/portal-types.ts` | All TypeScript interfaces (ContentItem, AnalyticsWeek, PortalInvoice, PortalData, etc.) |
| `lib/portal-seed.ts` | Seed data for pets-delight (12 content items, 3 analytics weeks, 3 invoices) + crystalline (3 items, 1 invoice) |
| `lib/portal-auth.ts` | Email-to-slug mapping. `raveena@petsdelight.com → "pets-delight"` |
| `app/portal/login/page.tsx` | Client login page at `/portal/login` — standalone, no sidebar |
| `app/portal/[slug]/page.tsx` | Client-facing portal (4 tabs: Content, Analytics, Invoices, Package) |
| `app/clients/portal/[id]/page.tsx` | Internal admin view (4 tabs: Content, Analytics, Invoices, Settings) |
| `app/api/portal/[slug]/route.ts` | Public GET — serves portal data to client (Supabase Storage → seed fallback) |
| `app/api/portal/admin/[slug]/route.ts` | Auth-protected GET + PUT — internal read/write for admin view |

#### How It Works
1. **Client login:** Client goes to `/portal/login` → enters `raveena@petsdelight.com` → Supabase auth → redirected to `/portal/pets-delight`
2. **Auth gate:** Portal page checks Supabase session on mount, verifies `slugForEmail(email) === slug` — wrong email gets redirected
3. **Client view (read-only):** Content cards (expand/collapse, approve via WhatsApp, request revision via WhatsApp), Analytics stats, Invoices, Package info
4. **Admin view:** `/clients/portal/[id]` — full CRUD on content items, analytics, invoices, settings. Auto-saves to Supabase Storage via PUT API. "Preview Portal" link included.
5. **Data storage:** `portal/pets-delight.json` and `portal/crystalline.json` in `app-data` Supabase Storage bucket
6. **Approve/Revision flow:** No backend write — opens WhatsApp pre-filled to Awab's number with the content title + action

#### Auth Architecture
- Internal team: `/login` → Supabase auth → redirected to `/` (Agency OS)
- Clients: `/portal/login` → Supabase auth → `slugForEmail()` check → `/portal/[slug]`
- Middleware updated: `/portal/*` and `/api/portal/*` are public routes (auth handled client-side)
- `components/conditional-layout.tsx` updated: portal routes skip the sidebar entirely

#### Content Statuses (full pipeline)
`idea_pending` → `idea_approved` → `idea_revision` → `in_production` → `ready_for_review` → `client_approved` → `posted`

#### Crystalline Added as Second Client
- Added to `app/clients/page.tsx` as default client (starts May 18)
- Retainer AED 5,500 (discounted to AED 2,500 until June 18)
- Portal slug: `crystalline`
- Seed data: 3 content items (idea_pending), 1 invoice AED 2,500 pending

---

## Pending / Tomorrow's Tasks

| # | Task | Who | Notes |
|---|------|-----|-------|
| 1 | **🔴 FIX: Cross-device task sync broken** | Claude | Abdul adds task → Awab can't see it. Verbose logging added to `lib/sync.ts`. Need to diagnose in morning — check console logs on both devices, confirm file actually lands in Supabase Storage `app-data` bucket. |
| 2 | Invite `raveena@petsdelight.com` via Supabase Auth | Awab | Dashboard → Auth → Users → Invite User |
| 3 | Add Crystalline portal email to `lib/portal-auth.ts` | Claude (need email from Awab) | Uncomment line + add real email |
| 4 | Replace `agencyWhatsApp: "+971501234567"` in `lib/portal-seed.ts` | Abdul | Use Awab's real WhatsApp number |
| 5 | Add client logos (Pets Delight + Crystalline) | Abdul | Update `logoUrl` in seed data or admin Settings tab |
| 6 | Video upload feature | Claude next session | Upload to Supabase `videos` bucket, client sees "Watch Video" button |
| 7 | Strip verbose `[sync]` console logs once sync is confirmed working | Claude | Replace with silent error-only logging |

---

## Git Commits This Session
```
1004f70 Sync todos and clients to Supabase Storage for cross-device consistency
ae33de1 Add client portal auth — email-gated login per client
48a4ab1 Add client portal system (Pets Delight + Crystalline)
4ad32ff Fix broken images in sidebar (logo + user avatar)
```

---

## Live URLs
- Agency OS: https://cactuslabos.netlify.app
- Pets Delight portal (after invite): https://cactuslabos.netlify.app/portal/pets-delight
- Crystalline portal: https://cactuslabos.netlify.app/portal/crystalline
- Client login page: https://cactuslabos.netlify.app/portal/login
- Admin portal view: https://cactuslabos.netlify.app/clients/portal/[client-id]
- Supabase dashboard: https://tpxyegbeluspgashouzb.supabase.co
