import { Resend } from "resend";

const FROM = process.env.RESEND_FROM || "Cactus Lab <noreply@cactuslab.ae>";

function getClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

interface VideoReadyArgs {
  to: string;
  companyName: string;
  videoTitle: string;
  portalUrl: string;
}

// Fire-and-forget. Caller doesn't await failures — email is best-effort,
// never blocks the underlying mutation. Logs to console on error so it's
// visible in Vercel logs without surfacing to the client.
export async function sendVideoReadyEmail({ to, companyName, videoTitle, portalUrl }: VideoReadyArgs): Promise<void> {
  const resend = getClient();
  if (!resend) {
    console.log("[email] RESEND_API_KEY not set — skipping video-ready email to", to);
    return;
  }

  const subject = `New video ready for review — ${videoTitle}`;
  const html = `
<!doctype html>
<html><body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:100%;">
        <tr><td style="padding:32px 32px 0 32px;">
          <div style="font-size:14px;font-weight:700;color:#1D9E75;letter-spacing:0.05em;">CACTUS LAB</div>
        </td></tr>
        <tr><td style="padding:24px 32px 8px 32px;">
          <h1 style="margin:0;font-size:22px;font-weight:700;color:#111;line-height:1.3;">New video ready for your review</h1>
        </td></tr>
        <tr><td style="padding:0 32px 24px 32px;">
          <p style="margin:8px 0 0 0;font-size:15px;color:#444;line-height:1.6;">Hi ${escapeHtml(companyName)} team,</p>
          <p style="margin:12px 0 0 0;font-size:15px;color:#444;line-height:1.6;">
            <strong style="color:#111;">${escapeHtml(videoTitle)}</strong> has been uploaded to your portal and is ready for review.
            Open the portal to watch, approve, or request a revision.
          </p>
        </td></tr>
        <tr><td style="padding:8px 32px 32px 32px;">
          <a href="${portalUrl}" style="display:inline-block;background:#22c55e;color:#000;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:14px;">Open Client Portal</a>
        </td></tr>
        <tr><td style="padding:0 32px 32px 32px;">
          <p style="margin:0;font-size:12px;color:#888;line-height:1.6;">
            Or paste this link in your browser:<br>
            <span style="color:#555;word-break:break-all;">${portalUrl}</span>
          </p>
        </td></tr>
      </table>
      <p style="margin:16px 0 0 0;font-size:11px;color:#999;">Cactus Lab FZ LLC · RAKEZ, United Arab Emirates</p>
    </td></tr>
  </table>
</body></html>
  `.trim();

  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) console.error("[email] resend error:", error);
  } catch (e) {
    console.error("[email] send threw:", e);
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
