import { NextResponse } from 'next/server';
import { createClient, getSupabaseServiceClient } from '@/lib/supabase-server';
import { requireUserId } from '@/lib/nellie-loop';

/**
 * POST /api/billing/cancel — cancels the Stripe subscription backing the
 * authenticated investor's active holding. Cancellation is at period end
 * (the investor keeps what they paid for); the subscription's customer_portal
 * flow is the alternate self-serve path.
 */

const STRIPE_API = 'https://api.stripe.com/v1';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = requireUserId(user);

    const body = (await request.json().catch(() => ({}))) as { holdingId?: string };
    if (!body.holdingId) {
      return NextResponse.json({ error: 'holdingId is required', code: 'INVALID_HOLDING' }, { status: 400 });
    }

    const admin = getSupabaseServiceClient();
    const { data: holding, error } = await admin
      .from('holdings')
      .select('id, status, stripe_subscription_id')
      .eq('id', body.holdingId)
      .eq('user_id', userId) // ownership bound at the query — no cross-investor cancels
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message, code: 'HOLDING_LOOKUP_FAILED' }, { status: 503 });
    }
    if (!holding || typeof holding.stripe_subscription_id !== 'string' || !holding.stripe_subscription_id) {
      return NextResponse.json({ error: 'No subscription on this holding', code: 'NO_SUBSCRIPTION' }, { status: 404 });
    }
    if (holding.status !== 'active') {
      return NextResponse.json(
        { error: `Holding is ${holding.status} — nothing to cancel`, code: 'NOT_ACTIVE' },
        { status: 409 }
      );
    }

    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      return NextResponse.json({ error: 'Billing is not configured', code: 'BILLING_NOT_CONFIGURED' }, { status: 503 });
    }

    const params = new URLSearchParams();
    // Cancel at period end: the investor keeps the float months they paid for.
    params.append('cancel_at_period_end', 'true');
    const res = await fetch(
      `${STRIPE_API}/subscriptions/${encodeURIComponent(holding.stripe_subscription_id)}`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      }
    );
    const sub = (await res.json()) as { cancel_at_period_end?: boolean; status?: string; error?: { message?: string } };
    if (!res.ok) {
      return NextResponse.json(
        { error: sub.error?.message || 'Stripe cancellation failed', code: 'CANCEL_FAILED' },
        { status: 502 }
      );
    }

    // Mark the holding exiting; the subscription webhook finalizes the state.
    const { error: updateError } = await admin
      .from('holdings')
      .update({ status: 'exiting' })
      .eq('id', (holding as { id: string }).id);
    if (updateError) {
      return NextResponse.json({ error: updateError.message, code: 'HOLDING_UPDATE_FAILED' }, { status: 503 });
    }

    return NextResponse.json({
      canceled: true,
      cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
      subscriptionStatus: sub.status ?? 'unknown',
    });
  } catch (error: unknown) {
    if ((error as { status?: number }).status === 401) {
      return NextResponse.json({ error: 'Authentication required', code: 'UNAUTHENTICATED' }, { status: 401 });
    }
    // Investor-safe: raw server detail never reaches the response body.
    console.error('[billing/cancel]', error);
    return NextResponse.json({ error: 'Cancellation is temporarily unavailable — please try again shortly', code: 'BILLING_ERROR' }, { status: 500 });
  }
}
