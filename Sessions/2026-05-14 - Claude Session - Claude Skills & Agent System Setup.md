# Session: Claude Skills & Agent System Setup — 2026-05-14

## What We Worked On
- Cloned the open-source repo `alirezarezvani/claude-skills` to explore what could be incorporated
- Read all key Cactus Lab vault files (00 Hub, 01 Business Overview, 02 Sales System) to understand brand context before installing anything
- Evaluated every skill, agent, and command in the repo for Cactus Lab relevance
- Installed 5 specialist advisor agents into `~/.claude/agents/`
- Installed git workflow commands + focused-fix into `~/.claude/commands/`
- Created a new `/proposal` command tailored to UAE law and Cactus Lab's exact contract terms
- Created a global `~/.claude/CLAUDE.md` with automatic agent routing rules — no manual invocation needed

## Key Decisions & Context
- **Skipped SaaS-heavy skills** (Revenue Operations, Customer Success scoring, Sales Engineer) — those are built for enterprise SaaS, not a content agency
- **Skipped `/review` and `/seo-auditor`** — they reference Python scripts and local file paths that only exist inside the repo itself and won't work portably
- **Skipped compliance/regulatory skills** (GDPR, FDA, ISO, EU AI Act) — not relevant to Cactus Lab
- **Personas over cs-* agents** — the persona files (solo-founder, growth-marketer, etc.) are self-contained and work without external file dependencies; the cs-* agents reference skill paths that don't exist locally
- **CLAUDE.md as the automation layer** — rather than manually calling agents, the global CLAUDE.md instructs Claude to automatically channel the right advisor based on topic triggers
- **UAE-specific `/proposal`** — built from scratch adapting the repo's contract-and-proposal-writer to UAE Civil Transactions Law, RAKEZ jurisdiction, AED currency, and Cactus Lab's exact payment terms (50/50, AED 5,500 anchor, 1 revision round, 3-day approval window)

## Current State
Claude Code is now running with a full advisor system. Five specialist agents are installed globally and will be auto-routed based on conversation context — Growth Marketer for Instagram/content distribution, Content Strategist for planning/scripts/calendars, Finance Lead for pricing and invoicing, Solo Founder for strategic decisions, and Product Manager for client delivery workflows. The global CLAUDE.md is active and loads Cactus Lab context at the start of every session. All existing Cactus Lab skills (cactus-generate, cactus-outreach, cactus-trends, cactus-analyze, cactus-playbook) remain intact and are now listed in the CLAUDE.md for easy reference.

## Still To Do
- [ ] Test each agent in a real session to confirm routing triggers work as expected (e.g. ask a growth question and see if Growth Marketer kicks in automatically)
- [ ] Potentially add Cactus Lab-specific context to individual agent files (e.g. mention UAE, AED, short-form video in their descriptions so auto-selection is more precise)
- [ ] Consider creating a `/client-report` command that generates the monthly performance report template for Pets Delight
- [ ] Consider creating a `/pipeline` command that logs and reviews the sales pipeline (40–50 leads/day target, WhatsApp label stages)
- [ ] The `/proposal` command could be further refined once tested against a real client deal

## Notes / Watch Out For
- The agents in `~/.claude/agents/` are **subagents** — they get spawned when Claude delegates a parallel task. The automatic behavior for everyday conversation comes from `~/.claude/CLAUDE.md`, not the agent files themselves.
- `~/.claude/CLAUDE.md` is global — it applies to every Claude Code session on this machine, not just Cactus Lab work. If you start working on unrelated projects, the AED/UAE defaults and routing rules will still be active. You can override per-project with a local `CLAUDE.md` in that project's directory.
- The `/focused-fix` command references `engineering/focused-fix/SKILL.md` internally — this won't exist unless you're inside the claude-skills repo. The command still works as a reasoning framework even without the file.
- The cloned repo lives at `/tmp/claude-skills` — it will be deleted on next system restart. If you want it permanently, move it: `mv /tmp/claude-skills ~/Development/claude-skills`
