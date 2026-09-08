import { getSupabaseServiceClient } from '@/lib/supabase-server';

/**
 * E4 welcome email (007 T4 residue): sent to the investor when their holding
 * row lands (checkout.session.completed → persistCompletedCheckout). Reuses
 * the notify-alex nodemailer + SMTP env pattern. Failures are logged, never
 * thrown — a broken SMTP hop must not roll back the holdings insert.
 */

export async function sendWelcomeEmail(params: {
  userId: string;
  horseSlug: string;
  horseName: string;
  units: number;
}): Promise<void> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.evolutionstables.nz';

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('[welcome-email] SMTP not configured — skipping welcome email for', params.userId);
    return;
  }

  try {
    const admin = getSupabaseServiceClient();
    const { data: profile } = await admin
      .from('profiles')
      .select('email, full_name')
      .eq('id', params.userId)
      .maybeSingle();
    const to = profile?.email;
    if (!to) {
      console.warn('[welcome-email] no profile email for', params.userId);
      return;
    }

    const firstName = (profile?.full_name || '').split(' ')[0] || 'there';
    const html = `
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a1a; line-height: 1.6;">
  <h2 style="font-size: 18px;">Welcome to the ownership of ${params.horseName}, ${firstName}</h2>
  <p>Your ${params.units}% Digital Syndication Lease in ${params.horseName} is confirmed and your holding is now active in My Stable.</p>
  <p style="margin-top: 24px;">
    <a href="${appUrl}/mystable" style="display: inline-block; background: #0a0a0a; color: #fff; padding: 10px 20px; text-decoration: none; font-weight: 600; border-radius: 4px; font-size: 13px;">
      View My Stable →
    </a>
  </p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
  <p style="font-size: 12px; color: #999;">Evolution Stables — co-ownership confirmation.</p>
</body>
</html>`.trim();

    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: Number(SMTP_PORT || 587) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      from: SMTP_FROM || SMTP_USER,
      to,
      subject: `Welcome to the ownership of ${params.horseName}`,
      html,
    });
  } catch (error) {
    console.error('[welcome-email] failed:', error instanceof Error ? error.message : error);
  }
}
