// Runs on 24th (preview to Awab) and 25th (send to client) at 8:30am UAE (4:30am UTC).
// Starts June 2026. May 2026 is skipped.
// Configure recipients via env vars: INVOICE_TO_EMAILS, INVOICE_CC_EMAILS, INVOICE_CONTACT_NAME

import { Resend } from "resend";

// ── UPDATE THIS CONFIG WHEN CLIENT DETAILS CHANGE ──────────────────────────
const INVOICE_CONFIG = {
  enabled: true,
  clientName: "Pets Delight",
  contactName: "Marwan",               // used in "Dear Marwan,"
  billToCompany: "Arab Land Trading LLC",
  billToAddress: "Al Quoz Industrial Area 1, Street 8, Warehouse 1-4\nP.O. Box 29893, Dubai, UAE",
  billToTrn: "100544168600003",
  retainerAED: 5500,
  vatRate: 5,
  invoiceDesc: "Short-form video package — social media management",
  invoiceNotes: "18 videos/month, 15 stories and 8 LinkedIn posts",
  invoiceNumberPrefix: "PD",
  paymentDetails: `Account Holder: CACTUS LAB FZ LLC\nBank: Mashreq Bank\nAccount Number: 019102102223\nIBAN: AE900330000019102102223`,
  previewRecipient: "awab.sirelkhatim@gmail.com",  // gets preview on the 24th
};
// ───────────────────────────────────────────────────────────────────────────

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function aed(n: number) {
  return "AED " + Number(n).toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function pad(n: number) { return String(n).padStart(2, "0"); }

function buildInvoiceHtml(cfg: typeof INVOICE_CONFIG, invoiceNum: string, invoiceDate: Date, dueDate: Date): string {
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

function buildClientEmail(cfg: typeof INVOICE_CONFIG, invoiceHtml: string, invoiceNum: string, invoiceDate: Date): string {
  const year = invoiceDate.getFullYear();
  const month = invoiceDate.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const start = `${pad(1)}/${pad(month + 1)}/${year}`;
  const end = `${pad(lastDay)}/${pad(month + 1)}/${year}`;

  const contactName = process.env.INVOICE_CONTACT_NAME || cfg.contactName;
  const messageBody = `Dear ${contactName},\n\nI hope you're doing well.\n\nPlease find attached the invoice covering ${start} to ${end}. Kindly review and process it at your convenience.\n\nBest regards,\nAwab Sirelkhatim`;

  const bodyHtml = messageBody
    .split("\n\n")
    .map(p => `<p style="margin:0 0 16px;line-height:1.7;font-size:15px;color:#111;font-family:-apple-system,sans-serif;">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");

  return `
    <div style="max-width:700px;margin:0 auto;background:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="padding:36px 36px 28px;">
        <div style="font-size:18px;font-weight:700;color:#1D9E75;margin-bottom:2px;">CACTUS LAB</div>
        <div style="font-size:11px;color:#6b7280;margin-bottom:24px;">Short-form video &amp; social media agency</div>
        <div style="border-top:1px solid #f3f4f6;padding-top:20px;">${bodyHtml}</div>
      </div>
      <div style="border-top:3px solid #f3f4f6;">${invoiceHtml}</div>
    </div>
  `;
}

function buildPreviewEmail(cfg: typeof INVOICE_CONFIG, invoiceHtml: string, invoiceNum: string, toEmails: string[]): string {
  return `
    <div style="max-width:700px;margin:0 auto;background:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="background:#fef3c7;border:2px solid #f59e0b;border-radius:10px;padding:16px 20px;margin:24px;">
        <div style="font-size:14px;font-weight:700;color:#92400e;margin-bottom:6px;">⚠ PREVIEW — Sending tomorrow</div>
        <div style="font-size:13px;color:#78350f;line-height:1.6;">
          Invoice <strong>${invoiceNum}</strong> will auto-send to <strong>${toEmails.join(", ")}</strong> tomorrow at 8:30am UAE time.<br>
          If you need to make changes, update <code style="background:#fde68a;padding:1px 4px;border-radius:3px;">netlify/functions/send-monthly-invoice.mts</code> and redeploy before then.
        </div>
      </div>
      <div style="border-top:1px solid #f3f4f6;">${invoiceHtml}</div>
    </div>
  `;
}

export default async (): Promise<Response> => {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth();
  const year = today.getFullYear();

  // Skip May 2026
  if (year === 2026 && month === 4) {
    console.log("Skipping May 2026");
    return new Response("Skipped — May 2026");
  }

  if (!INVOICE_CONFIG.enabled) {
    return new Response("Scheduled invoices disabled");
  }

  if (day !== 24 && day !== 25) {
    return new Response("Not a send day");
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY not set");
    return new Response("Missing RESEND_API_KEY", { status: 500 });
  }

  const toEmails = process.env.INVOICE_TO_EMAILS
    ? process.env.INVOICE_TO_EMAILS.split(",").map(e => e.trim()).filter(Boolean)
    : [];

  const ccEmails = process.env.INVOICE_CC_EMAILS
    ? process.env.INVOICE_CC_EMAILS.split(",").map(e => e.trim()).filter(Boolean)
    : [];

  const invoiceNum = `${INVOICE_CONFIG.invoiceNumberPrefix}${MONTH_SHORT[month]}${String(year).slice(2)}001`;
  const invoiceDate = new Date(year, month, 1);
  const dueDate = new Date(year, month, 8);

  const invoiceHtml = buildInvoiceHtml(INVOICE_CONFIG, invoiceNum, invoiceDate, dueDate);
  const resend = new Resend(apiKey);

  if (day === 24) {
    // Preview to Awab
    const previewHtml = buildPreviewEmail(INVOICE_CONFIG, invoiceHtml, invoiceNum, toEmails);
    const { error } = await resend.emails.send({
      from: "Cactus Lab <hello@contact.cactuslab.ae>",
      replyTo: "hello@cactuslab.ae",
      to: [INVOICE_CONFIG.previewRecipient],
      subject: `PREVIEW — Invoice ${invoiceNum} sends tomorrow | Cactus Lab`,
      html: previewHtml,
    });
    if (error) {
      console.error("Preview send failed:", error);
      return new Response(`Preview error: ${error.message}`, { status: 500 });
    }
    console.log(`Preview of ${invoiceNum} sent to ${INVOICE_CONFIG.previewRecipient}`);
    return new Response(`Preview sent for ${invoiceNum}`);
  }

  // Day 25 — send to client
  if (toEmails.length === 0) {
    console.error("No recipient emails. Set INVOICE_TO_EMAILS env var in Netlify.");
    return new Response("No recipients configured", { status: 400 });
  }

  const clientHtml = buildClientEmail(INVOICE_CONFIG, invoiceHtml, invoiceNum, invoiceDate);
  const { error } = await resend.emails.send({
    from: "Cactus Lab <hello@contact.cactuslab.ae>",
    replyTo: "hello@cactuslab.ae",
    to: toEmails,
    ...(ccEmails.length > 0 ? { cc: ccEmails } : {}),
    subject: `Invoice ${invoiceNum} — ${INVOICE_CONFIG.clientName} | Cactus Lab`,
    html: clientHtml,
  });

  if (error) {
    console.error("Client send failed:", error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }

  console.log(`Invoice ${invoiceNum} sent to ${toEmails.join(", ")}`);
  return new Response(`Sent ${invoiceNum}`);
};

// 4:30am UTC = 8:30am UAE (UTC+4), runs on 24th (preview) and 25th (send)
export const config = {
  schedule: "30 4 24,25 * *",
};
