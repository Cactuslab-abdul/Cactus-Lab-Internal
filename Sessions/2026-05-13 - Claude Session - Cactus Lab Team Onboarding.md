# Session: Cactus Lab Team Onboarding — 2026-05-13

## What We Worked On
- Read and synthesised all 9 Cactus Lab vault notes (00–07, Clients/Pets Delight, Clients/Pets Delight/Content - May 2026)
- Created `ONBOARDING.md` in the vault at `~/AwabHQ/AwabHQ/Cactus Lab/` — a single human-readable document condensing the entire business for a new team member joining Cactus Lab
- Created `CLAUDE.md` in the disk files directory at `~/AwabHQ/Cactus Lab/` — a Claude Code context file that auto-loads when the new team member runs `claude` from that directory
- Opened both files in the default markdown viewer and revealed `CLAUDE.md` in Finder

## Key Decisions & Context
- A second person is joining Cactus Lab and will also be using Claude Code to work on the business
- `ONBOARDING.md` is the human doc — covers what Cactus Lab is, the business model, all non-negotiable rules, current state, Pets Delight, the own-IG growth plan, the weekly rhythm, tools, and what needs doing right now
- `CLAUDE.md` is the machine doc — gives Claude automatic full business context (pricing rules, non-negotiables, file structure, current priorities, available `/cactus-*` skills) without needing to paste context manually each session
- Both files are the new team member's starting point — read ONBOARDING.md first, then `cd ~/AwabHQ/Cactus\ Lab && claude`
- `CLAUDE.md` notes that vault edits should use Read/Edit/Write on the filesystem directly (not Obsidian MCP), consistent with existing workflow

## Current State
Two onboarding files now exist. `ONBOARDING.md` in the Obsidian vault condenses all business context into one readable document. `CLAUDE.md` in `~/AwabHQ/Cactus Lab/` gives Claude Code full context automatically when run from that directory. The new team member needs the `~/AwabHQ/` folder on their machine, a read of `ONBOARDING.md`, and Claude Code installed.

## Still To Do
- [ ] Share the `~/AwabHQ/` folder structure with the new team member (or walk them through setup)
- [ ] Confirm new team member has Claude Code installed
- [ ] Decide which tasks/areas the new team member will own vs. Awab
- [ ] All open items from `06 - Business Pipeline & Dashboard` remain active:
  - WhatsApp Business fully configured
  - Wave or Zoho Invoice set up
  - Ask Pets Delight for 3 referrals + written testimonial
  - Daily outreach running (30+ leads/day, logged)
  - Cactus Lab IG to 12+ posts
  - Close 1 new client

## Notes / Watch Out For
- `CLAUDE.md` is in `~/AwabHQ/Cactus Lab/` (disk files) — `claude` must be run from that directory for it to auto-load
- If the new team member has a different home directory path, the absolute paths in both files will need updating
- `ONBOARDING.md` is a condensed read, not a replacement for the authoritative vault notes (00–07)
- Both files reference each other's locations — keep them in sync if either is moved
