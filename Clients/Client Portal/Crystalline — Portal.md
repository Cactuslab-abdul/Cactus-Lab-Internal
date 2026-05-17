# Crystalline Aluminium & Glass — Client Portal
_Last updated: 2026-05-18_

## Overview
- **Portal URL:** https://cactuslabos.netlify.app/portal/crystalline
- **Login page:** https://cactuslabos.netlify.app/portal/login
- **Client email:** ⚠️ NOT YET SET — get email from Awab/client then add to `lib/portal-auth.ts`
- **Portal slug:** `crystalline`
- **Admin view:** https://cactuslabos.netlify.app/clients/portal/[client-id-in-OS]
- **Data file:** `portal/crystalline.json` in Supabase Storage `app-data` bucket

## Status
- [ ] Get Crystalline's main contact email from Awab
- [ ] Add email to `lib/portal-auth.ts` CLIENT_EMAIL_MAP
- [ ] Send Supabase invite to client email
- [ ] Add logo URL
- [ ] Add real WhatsApp number (replace placeholder)
- [x] Seed data pre-loaded (3 content items, 1 invoice)
- [x] Portal built and deployed

## How to Activate This Portal

### Step 1 — Add email to auth map
In `lib/portal-auth.ts`:
```typescript
export const CLIENT_EMAIL_MAP: Record<string, string> = {
  "raveena@petsdelight.com": "pets-delight",
  "THEIR_EMAIL@crystalline.ae": "crystalline",  // ← add this line
};
```

### Step 2 — Invite client via Supabase
1. Go to https://tpxyegbeluspgashouzb.supabase.co
2. Authentication → Users → Invite User
3. Enter client's email → they set their password via magic link

### Step 3 — Redeploy
```bash
cd ~/Library/Mobile\ Documents/com~apple~CloudDocs/Cactus-Lab
netlify deploy --prod --dir .next
```

## Seed Data (Pre-Loaded)
- 3 content items (all `idea_pending`) for May 2026
  1. "Aluminium Facade Showcase" — Reel
  2. "Glass Partition Installation" — Story  
  3. "Project Reveal: Dubai Office" — Reel
- 1 invoice: AED 2,500 (May 2026, pending) — Invoice 1 half-month SMM + website

## Client & Billing Details
- **Starts:** May 18, 2026
- **Invoice 1:** AED 2,500 (AED 1,500 half-month SMM + AED 1,000 website)
- **Billing escalation:**
  - M2 (June): AED 3,500
  - M3 (July): AED 3,500
  - M4+ (August onward): AED 6,000/month (full retainer)
- Monthly video quota: 15 videos/month

## Next Steps for This Portal
1. Get and add client email → activate auth
2. Build out content plan for May in admin view
3. Add video upload feature (next session with Claude)
