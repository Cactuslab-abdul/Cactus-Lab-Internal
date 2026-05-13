# Session: Obsidian Sharing & Git Sync — 2026-05-13

## What Was Done
- Discussed Obsidian vault sharing options for operations manager (Sync paid, cloud folder free, Git free)
- Covered simultaneous collaboration approaches (LiveSync, folder ownership, Notion fallback)
- Audited local folders vs shared git repo — found Notes, Legal & Admin, Operations, Branding, Clients all missing
- Copied all missing content into git repo and pushed 41 files to GitHub (AbouZaid1802/CactusLab)
- Updated .gitignore to block .mp4/.mov files

## Decisions
- Videos stay out of git — too large. Google Drive for video sharing if needed.
- Notes/ in git is a copy of the Obsidian vault. Source of truth = `~/AwabHQ/AwabHQ/Cactus Lab/`
- Obsidian not suited for real-time simultaneous editing — use folder ownership or Notion for that

## Next Steps
- Abouzaid: `git pull` to receive all new files
- Set up Google Drive shared folder for video files
- Add Pets Delight to Agency OS database
- Create ops manager account in Agency OS
