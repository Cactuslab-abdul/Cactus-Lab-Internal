# Cactus Lab — New Team Member Onboarding

> This is the single document you need to understand Cactus Lab, what we do, how we operate, and what you're stepping into. Read this first. Then read the sub-notes in this vault for depth.

---

## What Is Cactus Lab?

**Cactus Lab FZ LLC** is a short-form video and social media agency serving UAE businesses.

**The core promise to clients:** You never need to appear on camera or manage your own posting. We handle everything — scripting, filming, editing, scheduling, and reporting.

**Legal entity:** RAKEZ Free Zone LLC (Ras Al Khaimah Economic Zone)  
**Owner:** Awab Sirelkhatim  
**Location:** UAE (clients in Dubai + Sharjah)

---

## The Business Model

**What we sell:**  
- 15 short-form videos per month (Reels, TikToks, Shorts)
- Full social media scheduling (Later or Buffer)
- Daily story reposts (max 15 min/client/day)
- Bi-weekly performance updates
- Monthly performance report (sent by day 3 of the following month)

**Pricing:**
- Anchor price: **AED 5,500/month** — never open below this
- Minimum (closing concession only): AED 4,500
- New clients: 50% upfront before work starts, 50% on completion
- Retainer clients: paid in advance — no work starts without payment

**Target niches (UAE):**  
Perfume/watches, cars, recruitment agencies, spice/food, pet businesses

**Current status (May 2026):**
- 1 active client: **Pets Delight** (pet products, Dubai) — paying AED 5,500/month since March 2026
- 90-day goal: 4 clients = AED 22,000/month
- Cactus Lab's own Instagram: building from 15 → 10,000 followers

---

## The Vault — Where Everything Lives

This Obsidian vault at `~/AwabHQ/AwabHQ/` is the source of truth. Every note is written so a new Claude session can be given full context instantly.

| Note | What's in it |
|------|-------------|
| `01 - Business Overview` | Full positioning, legal entity, service agreement terms, branding |
| `02 - Sales System` | Lead gen, outreach scripts, follow-up cadence, closing playbook |
| `03 - Operations` | Monthly workflow, QC checklist, onboarding SOPs, file management |
| `04 - Admin & Finance` | Pricing, invoicing, contracts, banking, legal docs |
| `05 - Team & Hiring` | Editor SLA, scaling triggers, hiring principles |
| `06 - Business Pipeline & Dashboard` | Current metrics, checklist, sales pipeline, 90-day roadmap |
| `07 - Content Studio` | 30 organic videos + 2 ad campaigns to grow Cactus Lab IG to 10K |
| `Clients/Pets Delight` | Client profile, content history, invoices, May 2026 tracker |

**Disk files** (actual assets, not notes) live at: `~/AwabHQ/Cactus Lab/`
```
Cactus Lab/
├── Legal & Admin/     ← E-License, Tax cert, MOA, Company description
├── Branding/          ← Logo files (4 variants + icon assets)
├── Operations/        ← Ops checklist (HTML), Pipeline tracker (HTML), Service agreement
└── Clients/
    └── Pets Delight/
        ├── Content/   ← All delivered videos
        ├── Invoices/  ← March + April 2026
        └── Screenshots/ ← Performance data for sales pitches
```

---

## Key Rules — Non-Negotiable

**Sales:**
- Never open a conversation below AED 5,500
- Never DM from an Instagram profile with fewer than 12 posts
- Block 9–10:30am every day for outreach only — no client work in this window
- Close via WhatsApp voice note or call, never a text thread
- Set a 48-hour decision deadline on every verbal agreement

**Operations:**
- Never start work without a signed contract AND first payment received
- Every video gets exactly 1 revision round — it's in the contract
- Deliverables are accepted if a client doesn't respond within 3 business days
- Editor access via Google Drive only — no WhatsApp file transfers
- Post via scheduling tool (Later/Buffer) — never post manually

**Finance:**
- Invoice on the 1st. Payment due by the 5th. Follow up day 6. Suspend day 15.
- All client payments received and operating costs paid from the business account only
- Keep operating costs under AED 3,000/month until 5 clients

**Team:**
- No full-time hires until 5 paying clients
- Editors paid per video delivered, not a monthly salary
- Trial project before any retainer commitment

---

## Current Client: Pets Delight

Our first and only client — and our proof point in every pitch.

- **Active since:** March 2026
- **Invoices paid:** March ✅ April ✅
- **Content delivered:** Animal Heaven, Cat Under 100, Cat Owner Advice, How Much Do You Spend, Im Confused, 0417, Cheapest vs Expensive
- **May 2026 content:** 5 videos in progress (see `Clients/Pets Delight/Content - May 2026`)
- **Pending from Pets Delight:** 3 warm referrals, written testimonial, video testimonial
- **Renewal:** Start conversation now if not already done (3-month contract)

Screenshots at `Clients/Pets Delight/Screenshots/` — 12 performance screenshots. Use these in every pitch as social proof.

---

## Cactus Lab's Own Instagram

We're growing our own account from 15 → 10,000 followers by May 31, 2026.

- **30 organic videos** planned across 6 content pillars (see `07 - Content Studio`)
- **2 paid ad campaigns** (AED 250 each) to run in Weeks 2–3
- **Posting schedule:** 1 Reel/day for 30 days, Thursday 6–9 PM is highest-reach window
- **Top viral bets:** Videos 20, 2, 22, 26, 28, 29 — these are the ones with 50K+ view potential

**What works in UAE (May 2026):**
- 30–45 sec Reels with hard cut at 0.5 seconds
- Arabic text overlays on English videos (doubles reach)
- Result-proof content: before/after, stats, screenshots = 3x more saves
- Premium Dubai location tags (Marina, DIFC, Downtown)
- Agency accountability content = total blue ocean — no one shows real metrics

**What to avoid:**
- Generic "5 tips" carousels
- Logo intros / music fade-ins at the start
- "Follow us for more" as the only CTA

---

## The Weekly Rhythm

| Time | What |
|------|------|
| Mon–Sat 9–10:30am | Outreach only — 30+ leads messaged, all logged in pipeline tracker |
| Every Friday | Review all "Replied" leads, push every open conversation forward |
| Week 1 of month | Content planning call per client, script all 15 videos |
| Week 1–2 | Shoot days (batch per client) |
| Day 3 of month | Performance report sent to client |
| Day 1 of month | Invoice sent |
| Day 5 of month | Payment due |

---

## Tools We Use

| Category | Tool |
|----------|------|
| Scheduling | Later or Buffer |
| Design | Canva Pro |
| Video editing | CapCut (or Premiere Pro for editor) |
| Storage | Google Drive |
| CRM | `Operations/cactus_lab_pipeline_tracker.html` |
| Invoicing | Wave (free) or Zoho Invoice |
| Communication | WhatsApp Business |
| Notes/OS | Obsidian (this vault) |

---

## Working With Claude Code

Both Awab and you will use **Claude Code** (the CLI) to work with this vault and business.

Every task should be started with something like:
> "I'm working on Cactus Lab, a UAE short-form video agency. Here's the context note: [paste the relevant note]. My task today is: [your task]."

A `CLAUDE.md` file lives at `~/AwabHQ/Cactus Lab/CLAUDE.md` — this gives Claude full business context automatically when you run Claude Code from that directory.

**Which note to paste for which task:**
- Sales / outreach → `02 - Sales System`
- Client work → `Clients/Pets Delight`
- Contracts / invoicing → `04 - Admin & Finance`
- Operations / workflow → `03 - Operations`
- Content planning → `07 - Content Studio`
- Business overview → `00 - Hub` + `01 - Business Overview`

**Useful Claude Code skills available (type `/` to invoke):**
- `/cactus-generate` — generate a full content pack (hook, script, caption, hashtags)
- `/cactus-analyze` — reverse-engineer why content works, adapt for UAE
- `/cactus-trends` — scout what's trending on UAE social media
- `/cactus-outreach` — research a UAE business and write personalised outreach
- `/cactus-playbook` — view the 21-day growth playbook

---

## What Needs Doing Right Now (May 2026)

### Immediate (this week)
- [ ] WhatsApp Business fully set up (Cactus Lab name, logo, business hours, away message)
- [ ] Invoice tool live (Wave or Zoho Invoice)
- [ ] Ask Pets Delight for 3 referrals + written testimonial
- [ ] Daily outreach running: 9–10:30am, 30 leads/day, all logged

### This month
- [ ] Cactus Lab IG at 12+ posts live
- [ ] Google Drive proof folder created (Pets Delight content + metrics)
- [ ] 3 DM opener scripts written (perfume/watch niche, car niche, recruitment niche)
- [ ] Day 3 + Day 7 follow-up messages saved
- [ ] Google Drive folder structure created for Pets Delight
- [ ] Close 1 new client

### 90-day targets
- 4 clients = AED 22,000/month
- 1,000 followers on Cactus Lab IG
- Video testimonial from Pets Delight
- Consider part-time content coordinator at 4 clients

---

*Last updated: 2026-05-13 — compiled from all Cactus Lab vault notes*
