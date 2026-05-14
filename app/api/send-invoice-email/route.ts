import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

function aed(n: number) {
  return "AED " + Number(n).toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDisplay(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

interface LineItem {
  desc: string;
  qty: number;
  rate: number;
  notes?: string;
}

interface InvoiceData {
  number: string;
  date: string;
  due: string;
  clientName: string;
  clientContact?: string;
  clientAddress?: string;
  clientTrn?: string;
  items: LineItem[];
  vatRate: number;
  paymentDetails?: string;
  notes?: string;
  terms?: string;
}

function buildInvoiceHtml(inv: InvoiceData): string {
  const subtotal = inv.items.reduce((s, i) => s + i.qty * i.rate, 0);
  const vatAmt = subtotal * inv.vatRate / 100;
  const total = subtotal + vatAmt;

  const itemRows = inv.items.map(item => `
    <tr>
      <td style="padding:12px;font-size:13px;border-bottom:1px solid #e5e7eb;">
        ${item.desc || "—"}
        ${item.notes ? `<div style="font-size:11px;color:#9ca3af;margin-top:3px;">${item.notes.split("\n").join("<br>")}</div>` : ""}
      </td>
      <td style="padding:12px;font-size:13px;border-bottom:1px solid #e5e7eb;text-align:right;">${item.qty}</td>
      <td style="padding:12px;font-size:13px;border-bottom:1px solid #e5e7eb;text-align:right;white-space:nowrap;">${aed(item.rate)}</td>
      <td style="padding:12px;font-size:13px;border-bottom:1px solid #e5e7eb;text-align:right;white-space:nowrap;">${aed(item.qty * item.rate)}</td>
    </tr>
  `).join("");

  const addressLines = (inv.clientAddress || "").split("\n").join("<br>");

  return `
    <div style="max-width:680px;margin:0 auto;padding:48px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111;background:#fff;">
      <!-- Header -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;">
        <div>
          <div style="font-size:22px;font-weight:700;color:#1D9E75;letter-spacing:-0.3px;">CACTUS LAB</div>
          <div style="font-size:12px;color:#6b7280;margin-top:2px;">Short-form video &amp; social media agency</div>
          <div style="font-size:11px;color:#6b7280;margin-top:10px;line-height:1.7;">
            Cactus Lab FZ LLC<br>
            Ras Al Khaimah Economic Zone (RAKEZ)<br>
            United Arab Emirates<br>
            hello@cactuslab.ae
          </div>
          <div style="font-size:11px;color:#6b7280;margin-top:6px;font-weight:600;">TRN: 105428032400001</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:26px;font-weight:700;letter-spacing:-0.5px;">INVOICE</div>
          <table style="margin-top:12px;margin-left:auto;font-size:12px;border-collapse:collapse;">
            <tr><td style="padding:2px 0 2px 16px;font-weight:600;">Invoice No.</td><td style="padding:2px 0 2px 16px;color:#6b7280;">${inv.number}</td></tr>
            <tr><td style="padding:2px 0 2px 16px;font-weight:600;">Date</td><td style="padding:2px 0 2px 16px;color:#6b7280;">${fmtDisplay(inv.date)}</td></tr>
            <tr><td style="padding:2px 0 2px 16px;font-weight:600;">Due Date</td><td style="padding:2px 0 2px 16px;color:#6b7280;">${fmtDisplay(inv.due)}</td></tr>
          </table>
        </div>
      </div>

      <!-- Bill To / From -->
      <div style="display:flex;justify-content:space-between;margin-bottom:32px;padding:18px 22px;background:#f9fafb;border-radius:10px;">
        <div>
          <div style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Bill To</div>
          <div style="font-size:13px;font-weight:600;">${inv.clientName}</div>
          ${inv.clientContact ? `<div style="font-size:13px;color:#6b7280;">${inv.clientContact}</div>` : ""}
          ${inv.clientAddress ? `<div style="font-size:12px;color:#6b7280;margin-top:2px;line-height:1.5;">${addressLines}</div>` : ""}
          ${inv.clientTrn ? `<div style="font-size:12px;color:#6b7280;margin-top:4px;font-weight:600;">TRN number: ${inv.clientTrn}</div>` : ""}
        </div>
        <div style="text-align:right;">
          <div style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">From</div>
          <div style="font-size:13px;font-weight:600;">Cactus Lab FZ LLC</div>
          <div style="font-size:13px;color:#6b7280;">hello@cactuslab.ae</div>
        </div>
      </div>

      <!-- Items table -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
        <thead>
          <tr>
            ${["Description","Qty","Rate","Amount"].map((h, i) =>
              `<th style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;padding:10px 12px;background:#f9fafb;border-bottom:1px solid #e5e7eb;text-align:${i > 0 ? "right" : "left"};">${h}</th>`
            ).join("")}
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <!-- Totals + payment details -->
      <div style="display:flex;justify-content:flex-end;margin-bottom:28px;">
        <div style="min-width:220px;">
          <div style="display:flex;justify-content:space-between;font-size:13px;padding:5px 0;">
            <span style="color:#6b7280;">Subtotal</span><span>${aed(subtotal)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:13px;padding:5px 0;">
            <span style="color:#6b7280;">Tax (${inv.vatRate}%)</span><span>${aed(vatAmt)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:17px;font-weight:700;padding:10px 0 5px;border-top:1.5px solid #111;margin-top:6px;">
            <span>Total</span><span>${aed(total)}</span>
          </div>
        </div>
      </div>

      <div style="border-top:1px solid #e5e7eb;padding-top:18px;">
        ${inv.paymentDetails ? `
        <div style="margin-bottom:14px;">
          <div style="font-size:12px;font-weight:700;margin-bottom:4px;">Notes</div>
          <div style="font-size:12px;color:#6b7280;line-height:1.7;">${inv.paymentDetails.split("\n").join("<br>")}</div>
        </div>` : ""}
        ${inv.terms ? `
        <div>
          <div style="font-size:12px;font-weight:700;margin-bottom:4px;">Terms</div>
          <div style="font-size:12px;color:#6b7280;">${inv.terms}</div>
        </div>` : ""}
      </div>
    </div>
  `;
}

function buildEmailHtml(invoiceData: InvoiceData, messageBody?: string): string {
  const invoiceHtml = buildInvoiceHtml(invoiceData);
  if (!messageBody) return invoiceHtml;

  const bodyHtml = messageBody
    .split("\n\n")
    .map(p => `<p style="margin:0 0 16px;line-height:1.7;font-size:15px;color:#111;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">${p.replace(/\n/g, "<br>")}</p>`)
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

export async function POST(req: NextRequest) {
  try {
    const { to, cc, messageBody, invoiceData } = await req.json();

    if (!to || !invoiceData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "RESEND_API_KEY is not configured" }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const toList = (to as string).split(",").map((e: string) => e.trim()).filter(Boolean);
    const ccList = cc ? (cc as string).split(",").map((e: string) => e.trim()).filter(Boolean) : [];

    const subject = `Invoice ${invoiceData.number} — ${invoiceData.clientName} | Cactus Lab`;
    const html = buildEmailHtml(invoiceData as InvoiceData, messageBody as string | undefined);

    const { data, error } = await resend.emails.send({
      from: "Cactus Lab <hello@contact.cactuslab.ae>",
      replyTo: "hello@cactuslab.ae",
      to: toList,
      ...(ccList.length > 0 ? { cc: ccList } : {}),
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (error: unknown) {
    console.error("Invoice email error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to send email" }, { status: 500 });
  }
}
