import { NextResponse } from 'next/server';
import { createClient, getSupabaseServiceClient } from '@/lib/supabase-server';
import { requireUserId } from '@/lib/nellie-loop';

/**
 * GET /api/billing/lookup — the authenticated investor's subscription ↔ holding
 * linkage: their holdings plus the Stripe subscription state of each.
 */

const STRIPE_API = 'https://api.stripe.com/v1';

async function retrieveSubscription(subscriptionId: string): Promise<{ status: string; cancel_at_period_end: boolean } | null> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  const res = await fetch(`${STRIPE_API}/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) return null;
  const sub = (await res.json()) as { status?: string; cancel_at_period_end?: boolean };
  return { status: sub.status ?? 'unknown', cancel_at_period_end: Boolean(sub.cancel_at_period_end) };
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = requireUserId(user);

    const admin = getSupabaseServiceClient();
    const { data: holdings, error } = await admin
      .from('holdings')
      .select('id, horse_id, stake_percentage, status, stripe_subscription_id, float_balance_nzd, monthly_keep_rate_nzd')
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({ error: error.message, code: 'HOLDINGS_LOOKUP_FAILED' }, { status: 503 });
    }

    const enriched = await Promise.all(
      (holdings ?? []).map(async (h) => {
        const subscription =
          typeof h.stripe_subscription_id === 'string'
            ? await retrieveSubscription(h.stripe_subscription_id)
            : null;
        return { ...h, subscription };
      })
    );

    return NextResponse.json({ holdings: enriched });
  } catch (error: unknown) {
    if ((error as { status?: number }).status === 401) {
      return NextResponse.json({ error: 'Authentication required', code: 'UNAUTHENTICATED' }, { status: 401 });
    }
    // Investor-safe: raw server detail never reaches the response body.
    console.error('[billing/lookup]', error);
    return NextResponse.json({ error: 'Billing lookup is temporarily unavailable', code: 'BILLING_ERROR' }, { status: 500 });
  }
}
