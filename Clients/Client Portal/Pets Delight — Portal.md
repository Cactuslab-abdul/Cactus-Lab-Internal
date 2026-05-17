# Pets Delight — Client Portal
_Last updated: 2026-05-18_

## Overview
- **Portal URL:** https://cactuslabos.netlify.app/portal/pets-delight
- **Login page:** https://cactuslabos.netlify.app/portal/login
- **Client email:** `raveena@petsdelight.com`
- **Portal slug:** `pets-delight`
- **Admin view:** https://cactuslabos.netlify.app/clients/portal/[client-id-in-OS]
- **Data file:** `portal/pets-delight.json` in Supabase Storage `app-data` bucket

## Status
- [ ] Supabase invite sent to `raveena@petsdelight.com` ← **DO THIS TOMORROW MORNING**
- [x] Portal built and deployed (seed data pre-loaded)
- [ ] Real WhatsApp number added (replace `+971501234567`)
- [ ] Logo URL added (Settings tab in admin view)

## How to Invite the Client
1. Go to https://tpxyegbeluspgashouzb.supabase.co
2. Authentication → Users → Invite User
3. Email: `raveena@petsdelight.com`
4. She receives a magic link → sets her password → can access portal

## What the Client Sees

### Content Tab
- Grid of all content items for the current month (May 2026 pre-seeded with 12 items)
- Each card shows: title, type (Reel/Story/Post), status badge, idea description
- Statuses: `idea_pending` → `idea_approved` → `idea_revision` → `in_production` → `ready_for_review` → `client_approved` → `posted`
- When status = `ready_for_review`: **Approve** and **Request Revision** buttons appear → open WhatsApp pre-filled to Awab's number
- When video URL is attached: **Watch Video** button appears

### Analytics Tab
- Latest week stats: Followers, Follower change, Views, Reach, Engagement Rate
- Weekly history table (all weeks logged by admin)

### Invoices Tab
- Invoice list: number, month, amount, VAT, total, status (paid/pending/overdue)
- PDF link when URL is provided

### Package Tab
- Package name, monthly video quota, services list, months active
- WhatsApp contact button

## Seed Data (Pre-Loaded)
12 content items for May 2026 in a mix of statuses:
- 2x `idea_pending`, 2x `idea_approved`, 1x `idea_revision`, 2x `in_production`, 2x `ready_for_review`, 2x `client_approved`, 1x `posted`

3 analytics weeks (Apr 28, May 5, May 12) — IG followers growing 14,200 → 14,890

3 invoices: March (AED 5,500 paid), April (AED 5,500 paid), May (AED 5,500 paid)

## Key Code Files

### `lib/portal-auth.ts`
```typescript
export const CLIENT_EMAIL_MAP: Record<string, string> = {
  "raveena@petsdelight.com": "pets-delight",
  // "contact@crystalline.ae": "crystalline",  ← uncomment + add email when ready
};
```

### `lib/portal-types.ts` — Core Types
```typescript
export type ContentStatus =
  | "idea_pending" | "idea_approved" | "idea_revision"
  | "in_production" | "ready_for_review" | "client_approved" | "posted";

export type ContentType = "Reel" | "Story" | "Post" | "TikTok" | "LinkedIn";

export interface ContentItem {
  id: string;
  month: string;           // "2026-05"
  number: number;          // e.g. 1
  title: string;
  type: ContentType;
  ideaDescription: string;
  status: ContentStatus;
  videoUrl?: string;
  thumbnailUrl?: string;
  postedUrl?: string;
  clientNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsWeek {
  id: string;
  weekDate: string;         // "2026-05-12"
  instagram: {
    followers: number;
    followersChange: number;
    views: number;
    reach: number;
    engagementRate: number;
    topPostUrl?: string;
  };
  tiktok?: { ... };
  notes?: string;
  enteredAt: string;
}

export interface PortalInvoice {
  id: string;
  number: string;          // "PD-001"
  month: string;           // "March 2026"
  date: string;
  dueDate: string;
  amountAED: number;
  vatAED: number;
  totalAED: number;
  status: "paid" | "pending" | "overdue";
  pdfUrl?: string;
  paidDate?: string;
}

export interface PortalData {
  clientId: string;
  clientName: string;
  logoUrl: string;
  agencyWhatsApp: string;   // ← UPDATE to Awab's real number
  monthlyVideoQuota: number;
  package: PortalPackage;
  contentItems: ContentItem[];
  analytics: AnalyticsWeek[];
  invoices: PortalInvoice[];
  updatedAt: string;
}
```

### API Routes
- **Public GET:** `GET /api/portal/pets-delight` → no auth, reads from Supabase Storage, falls back to seed
- **Admin GET:** `GET /api/portal/admin/pets-delight` → auth required
- **Admin PUT:** `PUT /api/portal/admin/pets-delight` → auth required, saves `PortalData` JSON to `portal/pets-delight.json` in Supabase Storage

### Auth Gate in Portal Page (`app/portal/[slug]/page.tsx`)
```typescript
useEffect(() => {
  const supabase = createClient();
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (!user) { router.replace("/portal/login"); return; }
    const userSlug = slugForEmail(user.email ?? "");
    if (!userSlug) { router.replace("/"); return; }
    if (userSlug !== slug) { router.replace(`/portal/${userSlug}`); return; }
    setAuthChecked(true);
  });
}, [slug, router]);
```

## Supabase Setup Required
The `app-data` bucket needs these 3 RLS policies before sync works:
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
→ Run in: https://tpxyegbeluspgashouzb.supabase.co → SQL Editor

## Upcoming: Video Upload Feature
Next session: build video upload in the admin view → file goes to Supabase Storage `videos` bucket → URL gets saved to `contentItem.videoUrl` → client sees "Watch Video" button.
