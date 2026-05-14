import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const { to, subject, body, businessName } = await req.json();

    if (!to || !subject || !body) {
      return NextResponse.json({ error: "Missing required fields: to, subject, body" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "RESEND_API_KEY is not configured. Add it to your .env.local file." },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: "Awab @ Cactus Lab <hello@contact.cactuslab.ae>",
      replyTo: "hello@cactuslab.ae",
      to: [to],
      subject,
      text: body,
      html: body
        .split("\n\n")
        .map((p: string) => `<p style="margin: 0 0 16px; line-height: 1.6; font-family: -apple-system, sans-serif; font-size: 15px; color: #111;">${p.replace(/\n/g, "<br>")}</p>`)
        .join(""),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      to,
      businessName,
    });
  } catch (error: unknown) {
    console.error("Send email error:", error);
    const msg = error instanceof Error ? error.message : "Failed to send email";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
