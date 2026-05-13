# Session: Vault Sync Setup — 2026-05-13

## What We Worked On
- Cloned the CactusLab GitHub repo to Awab's Mac at ~/AwabHQ/Development/Cactus-Lab
- Generated SSH key and added it to GitHub for repo access
- Set up a LaunchAgent (auto-pull.sh) that pulls from GitHub every 5 minutes automatically
- Moved all project folders (Development, cactus-content-studio, cactus-lab-deploy) into ~/AwabHQ/ to keep the home directory clean
- Updated all paths in the auto-pull script and LaunchAgent after the move
- Opened Cactus-Lab as a vault in Obsidian

## Key Decisions & Context
- Auto-sync runs every 5 minutes via macOS LaunchAgent — no manual git pull needed
- Vault lives at ~/AwabHQ/Development/Cactus-Lab on Awab's machine
- Wrapup skill updated to commit and push session notes to this repo after every Cactus Lab session

## Current State
Awab's machine is fully synced with the shared CactusLab repo. Every time AbouZaid pushes a wrapup, Awab's Obsidian vault picks it up within 5 minutes. Every time Awab wraps up a Cactus Lab session, the session note gets committed and pushed to the repo for AbouZaid to see.

## Still To Do
- Confirm AbouZaid has Obsidian Git plugin set to auto-pull on his end
- Test full end-to-end: Awab pushes → AbouZaid sees it in Obsidian

## Notes / Watch Out For
- If auto-pull ever breaks, check ~/.cactus-lab-sync.log for errors
- Obsidian may need a manual reload (Cmd+P → Reload app) to show new files
