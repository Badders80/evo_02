import { NextRequest, NextResponse } from 'next/server';
import { notifyAlexOfInterest } from '@/lib/notify-alex';
import { getSupabaseServiceClient } from '@/lib/supabase-service';

/**
 * Interest Signups / waitlist — guest CTA modal submissions.
 * evo_02 port: writes to `leads` (created in migration 00007); SMTP notify is
 * fire-and-forget and never blocks or fails the request.
 */

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      horse_slug?: string;
      horse_name?: string;
      campaign_key?: string;
      campaignKey?: string;
      utm_campaign?: string;
      source?: string;
      utm_source?: string;
    };

    const email: string | undefined = body.email;
    const horseSlug: string | undefined = body.horse_slug;
    const horseName: string | undefined = body.horse_name;
    const rawCampaign: string | undefined =
      body.campaign_key || body.campaignKey || body.utm_campaign;
    const rawSource: string | undefined = body.source || body.utm_source;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const sanitizeKey = (v: unknown) =>
      String(v || '')
        .trim()
        .toLowerCase()
        .slice(0, 120);

    const slug = horseSlug || (horseName ? horseName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '');

    // 1. Persist the lead (best-effort — a lead DB hiccup must not 500 the modal)
    try {
      const { error } = await getSupabaseServiceClient()
        .from('leads')
        .insert({
          user_email: trimmed,
          horse_slug: sanitizeKey(slug),
          action_type: 'waitlist_guest',
          utm_source: sanitizeKey(rawSource),
          utm_campaign: sanitizeKey(rawCampaign),
          referrer_url: sanitizeKey(request.headers.get('referer') || ''),
          status: 'new',
        });
      if (error) throw error;
    } catch (leadErr) {
      console.error('[subscribe] lead insert failed (non-fatal)', leadErr);
    }

    // 2. Notify (fire-and-forget)
    notifyAlexOfInterest({
      interestedEmail: trimmed,
      horseName: horseName ?? 'General interest',
      horseSlug: sanitizeKey(slug) || 'general',
      source: 'guest',
    }).catch(() => undefined);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[subscribe] error', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}