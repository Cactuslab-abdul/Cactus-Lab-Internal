# Cactus Lab Agency OS — Setup Guide

## What you're deploying
- **login page** (index.html) — email/password auth
- **dashboard** (dashboard.html) — full agency OS with Overview, Clients, Content, Reports, Invoices
- **Backend** — Supabase (free): Postgres database + Auth
- **Hosting** — Netlify (free): accessible from anywhere with your domain

Total cost: **$0/month** to start

---

## Step 1 — Create Supabase project

1. Go to [supabase.com](https://supabase.com) → Sign up (free)
2. Click **New Project**
3. Name it: `cactus-lab`
4. Choose region: **Middle East (Bahrain)** for lowest latency
5. Set a database password (save it somewhere)
6. Wait ~2 minutes for it to provision

---

## Step 2 — Run the database schema

1. In your Supabase project → click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file `schema.sql` from this folder
4. Copy all the SQL and paste it into the editor
5. Click **Run**
6. You should see: "Success. No rows returned"

---

## Step 3 — Get your API keys

1. In Supabase → **Settings** (gear icon) → **API**
2. Copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

---

## Step 4 — Add your keys to the dashboard files

Open **both** files and replace the placeholder values:

**In `index.html`** (around line 70):
```
const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'eyJ...your-anon-key...';
```

**In `dashboard.html`** (around line 920):
```
const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'eyJ...your-anon-key...';
```

---

## Step 5 — Create user accounts

1. In Supabase → **Authentication** → **Users**
2. Click **Invite user**
3. Enter your email: `awab.sirelkhatim@gmail.com` → Invite
4. Repeat for your operations manager's email
5. Each person will get an email to set their password
   - If invite email doesn't work: use **Add user** → set email + password manually

---

## Step 6 — Deploy to Netlify

**Option A: Drag and drop (fastest)**
1. Go to [netlify.com](https://netlify.com) → Sign up (free)
2. From the dashboard → click **Add new site** → **Deploy manually**
3. Drag the entire `cactus-content-studio` folder into the upload zone
4. Done — Netlify gives you a URL like `cactus-lab-xyz.netlify.app`

**Option B: GitHub (recommended — auto-deploys when you update files)**
1. Push this folder to a private GitHub repo
2. In Netlify → **Add new site** → **Import from Git**
3. Connect GitHub → select the repo
4. Build settings: leave blank (no build command needed)
5. Publish directory: `.` (just a dot)
6. Deploy

---

## Step 7 — Custom domain (optional)

In Netlify → **Domain management** → **Add custom domain**
- Connect `dashboard.cactuslab.co` or similar
- Netlify provides free SSL automatically

---

## How to update the invoice bank details

In `dashboard.html`, search for `[Your Bank Name]` — there are 2 placeholders:
- `Bank: [Your Bank Name]`
- `Account Name: Cactus Lab`
- `IBAN: [Your IBAN]`

Replace these with your real banking details.

---

## Adding a new client

1. Go to **Clients** tab
2. Click **+ Add Client**
3. Fill in: name, Instagram, package, monthly retainer, posts/month quota, contract start date
4. Click **Add Client**
5. An invoice is auto-created on the 1st of each month for the retainer amount

---

## Logging a post (quota tracking)

1. Go to **Clients** tab → click on a client to expand
2. Click **+ Log Post**
3. Select format (Reel, Carousel, etc.) → confirm
4. The quota counter updates immediately

---

## Monthly workflow

| When | What |
|------|------|
| 1st of month | Invoices auto-generate for all active clients |
| After posting | Click "+ Log Post" on the client to update quota |
| End of month | Go to Reports → enter followers/reach/impressions |
| When paid | Click "Mark Paid" on the invoice |

---

## Troubleshooting

**Dashboard redirects to login but I'm already logged in**
- Make sure you set the correct Supabase URL and anon key in BOTH files

**"Invalid login credentials" error**
- Check that you created the user account in Supabase Auth → Users

**Data not loading after login**
- Open browser DevTools (F12) → Console tab → look for red errors
- Most likely cause: wrong Supabase URL or anon key
