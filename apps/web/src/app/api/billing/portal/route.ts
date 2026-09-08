import { NextResponse } from 'next/server';
import { createClient, getSupabaseServiceClient } from '@/lib/supabase-server';
import { requireUserId } from '@/lib/nellie-loop';

/**
 * POST /api/billing/portal — creates a Stripe Billing Portal session for the
 * authenticated investor. Requires the caller to have a stripe_customer_id
 * on their profile; the portal is where cancellation happens (Stripe-managed).
 */

const STRIPE_API = 'https://api.stripe.com/v1';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = requireUserId(user);

    const admin = getSupabaseServiceClient();
    const { data: profile, error } = await admin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .maybeSingle();
    const customerId =
      profile && typeof profile === 'object' && 'stripe_customer_id' in profile
        ? (profile as { stripe_customer_id: string | null }).stripe_customer_id
        : null;

    if (!customerId) {
      return NextResponse.json(
        { error: 'No billing account found — complete a purchase first', code: 'NO_CUSTOMER' },
        { status: 404 }
      );
    }

    const origin = request.headers.get('origin') || new URL(request.url).origin;
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      return NextResponse.json({ error: 'Billing is not configured', code: 'BILLING_NOT_CONFIGURED' }, { status: 503 });
    }

    const params = new URLSearchParams();
    params.append('customer', customerId);
    params.append('return_url', `${origin}/mystable`);

    const res = await fetch(`${STRIPE_API}/billing_portal/sessions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const session = (await res.json()) as { url?: string; error?: { message?: string } };
    if (!res.ok || !session.url) {
      return NextResponse.json(
        { error: session.error?.message || 'Stripe portal session failed', code: 'PORTAL_FAILED' },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    if ((error as { status?: number }).status === 401) {
      return NextResponse.json({ error: 'Authentication required', code: 'UNAUTHENTICATED' }, { status: 401 });
    }
    // Investor-safe: raw server detail never reaches the response body.
    console.error('[billing/portal]', error);
    return NextResponse.json({ error: 'Billing portal is temporarily unavailable', code: 'BILLING_ERROR' }, { status: 500 });
  }
}
