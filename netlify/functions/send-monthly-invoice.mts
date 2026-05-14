// Runs on the 25th of every month at 8:30am UAE time (UTC+4 → 4:30am UTC)
// Starts June 2026. Edit INVOICE_CONFIG below to update client details.

import { Resend } from "resend";

// ── UPDATE THIS CONFIG WHEN CLIENT DETAILS CHANGE ──────────────────────────
const INVOICE_CONFIG = {
  enabled: true,
  clientName: "Pets Delight",
  billToCompany: "Arab Land Trading LLC",
  billToAddress: "Al Quoz Industrial Area 1, Street 8, Warehouse 1-4\nP.O. Box 29893, Dubai, UAE",
  billToTrn: "100544168600003",
  invoiceEmails: [] as string[],  // set via INVOICE_TO_EMAILS env var
  ccEmails: [] as string[],       // set via INVOICE_CC_EMAILS env var
  retainerAED: 5500,
  vatRate: 5,
  invoiceDesc: "Short-form video package — social media management",
  invoiceNotes: "18 videos/month, 15 stories and 8 LinkedIn posts",
  invoiceNumberPrefix: "PD",
  paymentDetails: `Account Holder: CACTUS LAB FZ LLC\nBank: Mashreq Bank\nAccount Number: 019102102223\nIBAN: AE900330000019102102223`,
};
// ───────────────────────────────────────────────────────────────────────────

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function aed(n: number) {
  return "AED " + Number(n).toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function buildHtml(cfg: typeof INVOICE_CONFIG, invoiceNum: string, invoiceDate: Date, dueDate: Date): string {
  const subtotal = cfg.retainerAED;
  const vatAmt = subtotal * cfg.vatRate / 100;
  const total = subtotal + vatAmt;
  const addressLines = cfg.billToAddress.split("\n").join("<br>");

  return `
    <div style="max-width:680px;margin:0 auto;padding:48px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111;background:#fff;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;">
        <div>
          <div style="font-size:22px;font-weight:700;color:#1D9E75;letter-spacing:-0.3px;">CACTUS LAB</div>
          <div style="font-size:12px;color:#6b7280;margin-top:2px;">Short-form video &amp; social media agency</div>
          <div style="font-size:11px;color:#6b7280;margin-top:10px;line-height:1.7;">
            Cactus Lab FZ LLC<br>Ras Al Khaimah Economic Zone (RAKEZ)<br>United Arab Emirates<br>hello@cactuslab.ae
          </div>
          <div style="font-size:11px;color:#6b7280;margin-top:6px;font-weight:600;">TRN: 105428032400001</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:26px;font-weight:700;letter-spacing:-0.5px;">INVOICE</div>
          <table style="margin-top:12px;margin-left:auto;font-size:12px;border-collapse:collapse;">
            <tr><td style="padding:2px 0 2px 16px;font-weight:600;">Invoice No.</td><td style="padding:2px 0 2px 16px;color:#6b7280;">${invoiceNum}</td></tr>
            <tr><td style="padding:2px 0 2px 16px;font-weight:600;">Date</td><td style="padding:2px 0 2px 16px;color:#6b7280;">${fmtDate(invoiceDate)}</td></tr>
            <tr><td style="padding:2px 0 2px 16px;font-weight:600;">Due Date</td><td style="padding:2px 0 2px 16px;color:#6b7280;">${fmtDate(dueDate)}</td></tr>
          </table>
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;margin-bottom:32px;padding:18px 22px;background:#f9fafb;border-radius:10px;">
        <div>
          <div style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Bill To</div>
          <div style="font-size:13px;font-weight:600;">${cfg.billToCompany}</div>
          <div style="font-size:12px;color:#6b7280;margin-top:2px;line-height:1.5;">${addressLines}</div>
          <div style="font-size:12px;color:#6b7280;margin-top:4px;font-weight:600;">TRN: ${cfg.billToTrn}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">From</div>
          <div style="font-size:13px;font-weight:600;">Cactus Lab FZ LLC</div>
          <div style="font-size:13px;color:#6b7280;">hello@cactuslab.ae</div>
        </div>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
        <thead>
          <tr>
            <th style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;padding:10px 12px;background:#f9fafb;border-bottom:1px solid #e5e7eb;text-align:left;">Description</th>
            <th style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;padding:10px 12px;background:#f9fafb;border-bottom:1px solid #e5e7eb;text-align:right;">Qty</th>
            <th style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;padding:10px 12px;background:#f9fafb;border-bottom:1px solid #e5e7eb;text-align:right;">Rate</th>
            <th style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;padding:10px 12px;background:#f9fafb;border-bottom:1px solid #e5e7eb;text-align:right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:12px;font-size:13px;border-bottom:1px solid #e5e7eb;">
              ${cfg.invoiceDesc}
              <div style="font-size:11px;color:#9ca3af;margin-top:3px;">${cfg.invoiceNotes}</div>
            </td>
            <td style="padding:12px;font-size:13px;border-bottom:1px solid #e5e7eb;text-align:right;">1</td>
            <td style="padding:12px;font-size:13px;border-bottom:1px solid #e5e7eb;text-align:right;white-space:nowrap;">${aed(cfg.retainerAED)}</td>
            <td style="padding:12px;font-size:13px;border-bottom:1px solid #e5e7eb;text-align:right;white-space:nowrap;">${aed(cfg.retainerAED)}</td>
          </tr>
        </tbody>
      </table>

      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div style="max-width:300px;">
          <div style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:5px;">Payment Details</div>
          <div style="font-size:12px;color:#6b7280;line-height:1.7;">${cfg.paymentDetails.split("\n").join("<br>")}</div>
        </div>
        <div style="min-width:220px;">
          <div style="display:flex;justify-content:space-between;font-size:13px;padding:5px 0;">
            <span style="color:#6b7280;">Subtotal</span><span>${aed(subtotal)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:13px;padding:5px 0;">
            <span style="color:#6b7280;">VAT (${cfg.vatRate}%)</span><span>${aed(vatAmt)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:17px;font-weight:700;padding:10px 0 5px;border-top:1.5px solid #111;margin-top:6px;">
            <span>Total Due</span><span>${aed(total)}</span>
          </div>
        </div>
      </div>

      <div style="margin-top:48px;padding-top:18px;border-top:1px solid #e5e7eb;text-align:center;font-size:11px;color:#9ca3af;">
        Cactus Lab FZ LLC &nbsp;·&nbsp; RAKEZ, UAE &nbsp;·&nbsp; TRN: 105428032400001 &nbsp;·&nbsp; Thank you for your business.
      </div>
    </div>
  `;
}

export default async (): Promise<Response> => {
  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();

  // Skip May 2026 (index 4)
  if (year === 2026 && month === 4) {
    console.log("Skipping May 2026 as configured");
    return new Response("Skipped — May 2026");
  }

  if (!INVOICE_CONFIG.enabled) {
    return new Response("Scheduled invoices disabled");
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY not set");
    return new Response("Missing RESEND_API_KEY", { status: 500 });
  }

  // Email recipients from env or config
  const toEmails = process.env.INVOICE_TO_EMAILS
    ? process.env.INVOICE_TO_EMAILS.split(",").map(e => e.trim()).filter(Boolean)
    : INVOICE_CONFIG.invoiceEmails;

  const ccEmails = process.env.INVOICE_CC_EMAILS
    ? process.env.INVOICE_CC_EMAILS.split(",").map(e => e.trim()).filter(Boolean)
    : INVOICE_CONFIG.ccEmails;

  if (toEmails.length === 0) {
    console.error("No recipient emails configured. Set INVOICE_TO_EMAILS env var.");
    return new Response("No recipients configured", { status: 400 });
  }

  const invoiceNum = `${INVOICE_CONFIG.invoiceNumberPrefix}${MONTH_SHORT[month]}${String(year).slice(2)}001`;
  const invoiceDate = new Date(year, month, 1);
  const dueDate = new Date(year, month, 8);

  const html = buildHtml(INVOICE_CONFIG, invoiceNum, invoiceDate, dueDate);
  const subject = `Invoice ${invoiceNum} — ${INVOICE_CONFIG.clientName} | Cactus Lab`;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "Cactus Lab <hello@contact.cactuslab.ae>",
    replyTo: "hello@cactuslab.ae",
    to: toEmails,
    ...(ccEmails.length > 0 ? { cc: ccEmails } : {}),
    subject,
    html,
  });

  if (error) {
    console.error("Failed to send monthly invoice:", error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }

  console.log(`Monthly invoice ${invoiceNum} sent to ${toEmails.join(", ")}`);
  return new Response(`Sent ${invoiceNum}`);
};

// 4:30am UTC = 8:30am UAE (UTC+4), 25th of every month
export const config = {
  schedule: "30 4 25 * *",
};
