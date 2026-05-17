# Session: cactuslab.ae Favicon & SEO — 2026-05-17

## What Was Done
- Added cactus logo favicon to cactuslab.ae (favicon.ico, favicon-32x32.png, apple-touch-icon.png)
- Rewrote SEO meta tags: title, description, robots, canonical
- Added Open Graph + Twitter Card tags
- Deployed live to cactuslab.ae via Netlify CLI (site ID: `86171701-c7cc-475a-aa37-ca7efd98be36`)
- Patched Agency OS (separate site) with favicon + noindex

## Decisions
- Marketing site source: `/Users/awab/Desktop/cactuslab-website/` — deploy from here only
- Three Netlify sites exist; `cactuslabae` is the one mapped to cactuslab.ae
- OG image is currently just favicon.png — needs a proper 1200×630 card

## Next Steps
- Google Search Console → request re-indexing for cactuslab.ae
- Create proper OG image (1200×630px) for social link previews
- Add sitemap.xml + robots.txt
