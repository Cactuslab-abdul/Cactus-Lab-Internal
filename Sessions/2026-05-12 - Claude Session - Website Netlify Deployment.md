# Session: Cactus Lab Website — Netlify Deployment — 2026-05-12

## What We Worked On
- Checked the Obsidian vault for website context and confirmed current site state
- Verified all 14 video files and image assets are under 100MB (largest: `cat owner advice.mp4` at 30MB) — safe for Netlify
- Installed Netlify CLI via npm (`/Users/awab/.nvm/versions/node/v22.22.2/bin/netlify`)
- Authenticated with Netlify using a personal access token
- Deployed `/Users/awab/AwabHQ/Cactus Lab/Website/` to Netlify production — site ID `86171701-c7cc-475a-aa37-ca7efd98be36`
- Confirmed all videos and images accessible at `https://cactuslabae.netlify.app`
- Diagnosed that `cactuslab.ae` was pointing to old hosting (`212.95.51.38`, nameservers: `ns150/ns151.aeserver.com`)
- Netlify DNS zone was already configured with correct records pointing to `cactuslabae.netlify.app`
- User updated nameservers at their registrar to Netlify's 4 nameservers
- Confirmed DNS propagation complete — `cactuslab.ae` now resolves to Netlify nameservers

## Key Decisions & Context
- **Netlify CLI path**: `/Users/awab/.nvm/versions/node/v22.22.2/bin/netlify` — nvm manages Node, so plain `netlify` won't work in a fresh shell without sourcing nvm first
- **Auth method**: personal access token (not browser login — Netlify's OAuth was temporarily down during session). Token was exposed in chat and must be revoked
- **Only 1 file uploaded on deploy**: Netlify CDN already had the videos/images from a prior deploy; only `index.html` was new — this is normal and expected
- **Netlify DNS zone**: already existed and had correct NETLIFY-type records for both `cactuslab.ae` and `www.cactuslab.ae` — no manual DNS record changes needed, just nameserver swap
- **Netlify nameservers**: `dns1.p08.nsone.net`, `dns2.p08.nsone.net`, `dns3.p08.nsone.net`, `dns4.p08.nsone.net`

## Current State
The website is deployed to Netlify at `https://cactuslabae.netlify.app` and the domain `cactuslab.ae` now points to Netlify's nameservers. DNS has propagated. The site should be fully live at `https://cactuslab.ae` with all 14 videos and images loading correctly. Netlify will auto-provision an SSL certificate shortly if not already done.

## Still To Do
- [ ] **Revoke the Netlify personal access token** used this session — create a new one if needed (`app.netlify.com → User Settings → Applications → Personal access tokens`)
- [ ] Verify `https://cactuslab.ae` fully loads with videos and images in browser
- [ ] Confirm SSL certificate is active (green padlock)
- [ ] Replace Pets Delight placeholder testimonial with a real quote from the owner
- [ ] Add more client testimonials (only 1 currently)
- [ ] Add analytics tracking (Plausible or Google Analytics) before promoting the site
- [ ] Verify Facebook page URL is publicly visible
- [ ] Add real case study results to the proof section metrics
- [ ] Decide on background motion graphics — canvas particles, SVG shapes, or stay clean

## Notes / Watch Out For
- **To redeploy after edits**: `NETLIFY_AUTH_TOKEN=<new-token> /Users/awab/.nvm/versions/node/v22.22.2/bin/netlify deploy --site 86171701-c7cc-475a-aa37-ca7efd98be36 --dir "/Users/awab/AwabHQ/Cactus Lab/Website" --prod`
- **Video & image paths are relative** — `videos/` and `Pics/` must stay alongside `index.html` or everything breaks on the server
- **Old token was exposed in chat** — revoke it immediately at app.netlify.com, do not reuse
- **Netlify free plan limits**: 100MB per file, 100GB bandwidth/month — current site is ~115MB total, well within limits
