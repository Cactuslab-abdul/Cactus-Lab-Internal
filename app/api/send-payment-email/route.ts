import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const { to, cc, clientName, amount, invoiceRef, body } = await req.json();

    if (!to || !clientName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "RESEND_API_KEY is not configured" }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const subject = invoiceRef
      ? `Payment Received — Invoice ${invoiceRef} | Cactus Lab`
      : `Payment Received — Thank you, ${clientName}`;

    const htmlBody = (body as string)
      .split("\n\n")
      .map((p: string) => `<p style="margin:0 0 16px;line-height:1.7;font-family:-apple-system,sans-serif;font-size:15px;color:#111;">${p.replace(/\n/g, "<br>")}</p>`)
      .join("");

    const html = `
      <div style="max-width:520px;margin:0 auto;padding:40px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
        <div style="font-size:20px;font-weight:700;color:#1D9E75;letter-spacing:-0.3px;margin-bottom:4px;">CACTUS LAB</div>
        <div style="font-size:12px;color:#6b7280;margin-bottom:32px;">Short-form video &amp; social media agency</div>
        <div style="border-top:2px solid #f3f4f6;padding-top:24px;">${htmlBody}</div>
        ${amount ? `<div style="margin:24px 0;padding:16px 20px;background:#f0fdf4;border-radius:10px;border:1px solid #bbf7d0;font-size:18px;font-weight:700;color:#15803d;">✓ ${typeof amount === "number" ? "AED " + amount.toLocaleString("en-AE") : amount} received</div>` : ""}
        <div style="margin-top:32px;padding-top:20px;border-top:1px solid #f3f4f6;font-size:11px;color:#9ca3af;">
          Cactus Lab FZ LLC &nbsp;·&nbsp; RAKEZ, UAE &nbsp;·&nbsp; hello@cactuslab.ae
        </div>
      </div>
    `;

    const ccList = cc ? [cc] : [];

    const { data, error } = await resend.emails.send({
      from: "Cactus Lab <hello@contact.cactuslab.ae>",
      replyTo: "hello@cactuslab.ae",
      to: [to],
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
    console.error("Payment email error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to send email" }, { status: 500 });
  }
}
