# Session: Invoice Generator & Vault Cleanup — 2026-05-08

## What We Worked On
- Reviewed Cactus Lab vault context and open priorities at session start
- Removed the referral deal item ("1 free month per referred client") from the Pets Delight note — user decided to drop this strategy
- Built a full invoice generator HTML tool at `~/AwabHQ/Cactus Lab/Operations/invoice_generator.html`
- Fixed invoice generator print view: hidden edit/print buttons in `@media print` so they don't appear in the PDF
- Added auto-trigger of the print dialog when "Generate Invoice" is clicked — one-click to PDF
- Identified that Obsidian MCP calls are slow and token-heavy; switched to editing vault files directly via filesystem for all future edits

## Key Decisions & Context
- **Invoice generator is HTML → PDF** via browser print dialog (no backend/server needed); simple and portable
- **Pre-filled with Cactus Lab defaults**: AED 5,500 social media package line item, RAKEZ address, Awab's email, 5% UAE VAT toggle
- **Invoice naming convention** follows existing pattern: client prefix + month + sequence (e.g. PDmay003)
- **Obsidian MCP is avoided for simple reads/edits** — use Read/Edit tools on the vault filesystem directly (`/Users/awab/AwabHQ/AwabHQ/`) to save time and tokens
- **Referral deal strategy dropped** — removed from Pets Delight notes entirely

## Current State
The invoice generator is live and working at `~/AwabHQ/Cactus Lab/Operations/invoice_generator.html`. Workflow is: open the file in a browser, fill in client name, invoice number, dates, and line items, click "Generate Invoice" — the print dialog opens automatically and you save as PDF. The Pets Delight vault note is cleaned up with the referral deal removed. All other Cactus Lab vault notes are unchanged.

## Still To Do
- Create a Google Drive proof folder with Pets Delight content, metrics screenshots, and account growth stats (flagged as priority sales task)
- Ask Pets Delight for: (1) 3 warm referrals, (2) written testimonial after month 2, (3) video testimonial this month
- Renewal conversation with Pets Delight should start at month 2 (if on 3-month contract)
- User mentioned a second task this session but didn't get to it — pick up next session

## Notes / Watch Out For
- Do NOT use Obsidian MCP tools for vault reads/edits — go directly to the filesystem at `/Users/awab/AwabHQ/AwabHQ/`; MCP is slow and wastes tokens
- The invoice generator uses the Cactus Lab brand green `#1D9E75` — keep this consistent across any future tools/docs
- VAT defaults to 5% (UAE standard) but is editable per invoice — double-check with client if they're VAT-exempt
- Invoice PDFs should be saved to `~/AwabHQ/Cactus Lab/Clients/[Client]/Invoices/` to stay consistent with the existing file structure
