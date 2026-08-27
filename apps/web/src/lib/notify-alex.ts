/**
 * Sends Alex an email notification when someone shows interest in a horse.
 * Used by /api/leads (logged-in) and /api/subscribe (guest) waitlist signups.
 *
 * Requires SMTP env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 * Also uses NOTIFY_EMAIL (defaults to alex@evolutionstables.nz)
 */

interface NotifyParams {
  /** The email of the person who hit "Notify Me" */
  interestedEmail: string;
  /** The display name of the horse (e.g. "Almanzor x Night Danza") */
  horseName: string;
  /** The horse slug (e.g. "nellie") */
  horseSlug: string;
  /** Whether the person was logged in or a guest */
  source: "logged-in" | "guest";
  /** Google Sheet URL for direct link */
  sheetUrl?: string;
}

export async function notifyAlexOfInterest(params: NotifyParams): Promise<void> {
  const { interestedEmail, horseName, horseSlug, source, sheetUrl } = params;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  const notifyEmail = process.env.NOTIFY_EMAIL || "alex@evolutionstables.nz";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.evolutionstables.nz";

  const defaultSheetUrl = `https://docs.google.com/spreadsheets/d/${
    process.env.LEADS_SPREADSHEET_ID || '1r1tLSTKIrcjxfn6NPGIfnmmj9GGebKXat8EZXMTHEyk'
  }/edit`;
  const sheetLink = sheetUrl || defaultSheetUrl;

  const sourceLabel = source === "logged-in" ? "Logged-in investor" : "Guest (not signed in)";

  const subject = `🔔 Waitlist signup — ${horseName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a1a; line-height: 1.6;">

  <h2 style="font-size: 18px; margin-bottom: 24px;">New waitlist signup</h2>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 13px; color: #666; width: 140px;">Horse</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px; font-weight: 600;">
        <a href="${appUrl}/marketplace/${horseSlug}" style="color: #0a0a0a; text-decoration: none;">${horseName}</a>
      </td>
    </tr>
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 13px; color: #666;">Interested person</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px;">
        <a href="mailto:${interestedEmail}" style="color: #0a0a0a;">${interestedEmail}</a>
      </td>
    </tr>
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 13px; color: #666;">Source</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px;">${sourceLabel}</td>
    </tr>
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 13px; color: #666;">Recorded in</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px;">
        ${source === "logged-in" ? "Leads tab" : "Waitlist tab"}
        (<a href="${sheetLink}" style="color: #0a0a0a;">open sheet</a>)
      </td>
    </tr>
  </table>

  <p style="margin-top: 24px;">
    <a href="${sheetLink}" style="display: inline-block; background: #0a0a0a; color: #fff; padding: 10px 20px; text-decoration: none; font-weight: 600; border-radius: 4px; font-size: 13px;">
      View Google Sheet →
    </a>
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
  <p style="font-size: 12px; color: #999;">
    Evolution Stables — waitlist notification<br>
    Triggered by "Notify Me" on the ${horseName} marketplace page.
  </p>
</body>
</html>
  `.trim();

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn("[notify-alex] SMTP not configured — skipping email (SMTP_HOST/USER/PASS missing)");
    return;
  }

  const nodemailer = await import("nodemailer");

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || "587", 10),
    secure: parseInt(SMTP_PORT || "587", 10) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "Evolution Stables <noreply@evolutionstables.co.nz>",
    to: notifyEmail,
    subject,
    html,
  });
}