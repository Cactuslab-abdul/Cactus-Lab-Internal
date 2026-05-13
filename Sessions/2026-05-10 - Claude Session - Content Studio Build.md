# Session: Cactus Lab Content Studio Build — 2026-05-10

## What We Worked On

- Read the full AwabHQ vault to understand Cactus Lab's brand, niches, clients, and goals before building anything
- Built a **Next.js content studio app** at `~/cactus-content-studio` with 5 pages and API routes (Trend Scout, Content Generator, URL Analyzer, 21-Day Playbook, Dashboard) — using Anthropic API + web search tool
- User declined the API-based approach to avoid paying for tokens separately (already on Claude Code subscription)
- **Rebuilt entirely** as a zero-cost system using Claude Code's existing subscription:
  - **4 new slash commands** in `~/.claude/commands/`:
    - `/cactus-trends` — searches UAE social media for trending hashtags, audio, viral formats, and 5 content ideas per niche
    - `/cactus-generate` — generates full content packs (hook, shot-by-shot script, caption, 30 hashtags, audio suggestion, best post time, viral factor)
    - `/cactus-analyze` — paste 1-5 URLs, Claude reverse-engineers why they work and generates UAE-adapted content ideas
    - `/cactus-playbook` — full 21-day growth plan (May 10-31) with today's exact tasks calculated dynamically
  - **Static HTML dashboard** at `~/cactus-content-studio/dashboard.html` — opens directly in browser, no server needed for core features
  - **Local AI server** at `~/cactus-content-studio/server.js` — Node.js HTTP server (no dependencies) that proxies chat messages to the `claude` CLI
- Added **AI Chat** to the Content Library (user's second request):
  - Split-screen layout: chat panel left, saved content right
  - Chat uses the local server to call `claude` CLI with web search enabled
  - System prompt hard-coded to focus exclusively on VIRAL content for UAE market
  - Auto-detects when AI returns a content pack and shows "+ Save to Library" button
  - 4 starter prompts shown when chat is empty
  - Server online/offline indicator with instructions to start it

## Key Decisions & Context

- **No Anthropic API key required** — all AI runs through `claude` CLI (Claude Code subscription), zero additional cost
- **`server.js` uses Node built-in `http` module only** — no npm install needed, just `node server.js`
- The `claude` CLI is spawned with `--allowedTools WebSearch,WebFetch` so every chat message automatically searches the internet before responding
- **Dashboard is fully static HTML** (Alpine.js + Tailwind via CDN) — all data persists in `localStorage`, open with `open ~/cactus-content-studio/dashboard.html`
- The system prompt in `server.js` is laser-focused on VIRAL content: first 1.5 second hooks, trending audio, UAE culture, share/save triggers — nothing safe or generic
- Slash commands use the same format as the existing `/cactus-outreach` command — they show up automatically in Claude Code
- The Next.js app files are still at `~/cactus-content-studio/` but the API routes are dead (no API key); the only file that matters now is `dashboard.html` and `server.js`

## Current State

Everything is built and working. The `server.js` was tested — it starts cleanly and responds to `/ping`. The 4 slash commands are live in `~/.claude/commands/` and visible in Claude Code alongside the existing `/cactus-outreach` command. The dashboard has 4 sections: Dashboard (growth tracker + May calendar), 21-Day Playbook (105 checkboxes, saves to localStorage), Content Library (AI chat + saved items), and Commands (reference for all slash commands). To use the AI chat, the user needs to run `node server.js` in one terminal and open the dashboard in a browser. Everything else (slash commands, dashboard tracking) works without running anything extra.

## Still To Do

- Test the full chat flow end-to-end (server running → send message → get content pack → save to library)
- The Next.js app (`npm run dev`) is dead weight now — could delete `app/`, `components/`, `lib/` folders and keep only `dashboard.html` and `server.js` to clean up
- Consider adding a `/cactus-caption` command for quick caption-only generation (without full script)
- The 21-day playbook assumes starting May 10 — if Awab picks this up after May 10, the "today" logic will still work correctly (it calculates based on current date vs May 10 start)
- Follower count on dashboard must be updated manually by Awab each day — no automatic pull from Instagram
- Could add a shell script `start.sh` that opens the dashboard and starts the server in one command

## Notes / Watch Out For

- **To start the AI chat server**: `cd ~/cactus-content-studio && node server.js` — must be running in a terminal whenever the chat is used
- **Slash commands** work in any Claude Code session immediately — no server needed for those
- The dashboard `localStorage` key is `cactus_studio_v1` — clearing browser storage will wipe saved content and playbook progress
- The `claude` CLI must be in PATH for `server.js` to work — if it errors, check that `which claude` returns a path
- The 10K in 21 days target is extremely aggressive organically — the playbook is realistic but requires posting 2-3x/day, engaging 150+ accounts/day, and at least one viral moment in Week 2-3
- The Next.js `node_modules` folder is still there (~200MB) — if disk space is an issue, `rm -rf ~/cactus-content-studio/node_modules` is safe since the Next.js app isn't being used
