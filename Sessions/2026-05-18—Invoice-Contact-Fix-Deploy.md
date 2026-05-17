# Session: Invoice Contact Fix & Deploy — 2026-05-18

## What Was Done
- Fixed invoice send modal showing "Dear Raveena" instead of "Dear Marwan"
- Separated Pets Delight contacts properly in Client interface:
  - `contactName = Raveena` (marketing, day-to-day)
  - `billingContactName = Marwan` (billing, invoice recipient)
  - `invoiceEmails = marwan@mepetcare.com` (To)
  - `invoiceCc = Raveena@petsdelight.com` (CC)
- Added `invoiceCc` field to Client type and all invoice forms
- Fixed `invoices/page.tsx` to use `billingContactName` for email greeting
- Set `INVOICE_TO_EMAILS` and `INVOICE_CC_EMAILS` on correct Netlify site (cactuslabos)
- Fixed `.netlify/state.json` to point to `cactuslabos` not a stale site ID
- Crystalline added as second default client in the OS

## Decisions
- Two-contact model: marketing contact ≠ billing contact — important for any new client with split contacts
- Automated monthly invoice function uses env vars, not hardcoded emails — correctly set now

## Next Steps
- Confirm Netlify deploy went live (check cactuslabos dashboard or trigger manually)
- Test invoice send modal in production: should say "Dear Marwan", To = marwan@mepetcare.com, CC = Raveena@petsdelight.com
- Rotate Netlify token used this session
