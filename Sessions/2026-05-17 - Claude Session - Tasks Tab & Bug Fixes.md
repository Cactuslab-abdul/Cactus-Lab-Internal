# Session: Tasks Tab & Bug Fixes — 2026-05-17

## What We Worked On

- **Added Tasks tab** (`app/todos/page.tsx`) — full task board with add/edit/delete, status workflow, assignee/priority/client tagging, due dates with overdue detection, live stats, grouped view, localStorage persistence
- **Added Tasks to sidebar** (`components/sidebar.tsx`) — under OVERVIEW section, visible to all roles
- **Fixed Generator API** (`app/api/generate/route.ts`):
  - Added LinkedIn content type labels (thought_leadership, case_study, tips_value, company_update were being sent as raw IDs to the AI prompt)
  - LinkedIn posts no longer include "Video Duration" in the prompt (was always defaulting to "30 seconds" even for written posts)
- **Fixed Analyzer UI** (`app/analyze/page.tsx`):
  - `estimatedPerformance` field was in the API response and the TypeScript interface, but was never rendered in the UI — now shows with a teal badge
- **Fixed JSON extraction in all 3 AI routes** (generate, analyze, trends):
  - Replaced greedy regex `\{[\s\S]*\}` with a robust character-walk extractor that correctly handles markdown code fences, mixed prose+JSON text (common when web_search tool is active), and multiple JSON objects in the response
  - Analyze route: bumped `max_tokens` 3000 → 4000 to prevent mid-JSON truncation when web search adds extra context
- **Fixed .gitignore** — added `.next/`, `node_modules/`, `next-env.d.ts`, `.env.local` entries

## Key Decisions & Context

- **Tasks use localStorage only** (not Supabase) — consistent with the existing localStorage-first pattern in the app. Data is per-browser. If cross-device sync is needed later, wire it through the shared-data API pattern like the other dashboard data.
- **Tasks tab is visible to all roles** (not adminOnly) — both Awab and Abdul need to see/manage tasks
- **JSON extraction fix** — the root cause was that when Claude uses `web_search_20250305` (a built-in Anthropic server tool), the response content array includes `server_tool_use` and `web_search_tool_result` blocks in addition to `text` blocks. The text block sometimes starts with explanation prose before the JSON object, causing the greedy regex to match prose characters between `{` and `}` resulting in invalid JSON. The new extractor uses a depth-counter character walk and tries the longest valid JSON candidate first.
- **`web_search_20250305` confirmed working** with `claude-sonnet-4-6` via `anthropic.messages.create()` (not beta) — response comes back with `stop_reason: end_turn` (server handles the search automatically), content types: `server_tool_use`, `web_search_tool_result`, `text`

## Current State

All changes pushed to `main` on GitHub. Ready to deploy on Netlify via drag-drop of `.next` output or by setting up auto-deploy from the GitHub repo.

## Still To Do

- [ ] Deploy to Netlify — drag `.next/` folder or connect GitHub auto-deploy
- [ ] Wire Tasks to Supabase for cross-device sync between Awab and Abdul
- [ ] Add Crystalline as a client in the Clients tab
- [ ] Update bank details in invoice template (`[Your Bank Name]`, `[Your IBAN]`)
- [ ] Create ops manager Supabase auth account

## Notes / Watch Out For

- **Tasks are localStorage only** — data doesn't sync between Awab's and Abdul's browsers until Supabase is wired up
- **`.env.local` is gitignored** — when pulling the repo on a new machine, create `.env.local` with `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Netlify deploy** — deploy folder is still the `.next/` output from `npm run build`. Do NOT drag the full project folder (has Next.js files that confuse Netlify).
