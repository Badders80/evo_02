import { NextResponse } from 'next/server';
import { createClient, getSupabaseServiceClient } from '@/lib/supabase-server';
import {
  HttpError,
  assertCheckoutCampaign,
  interpretReserveResult,
  purchasesAreEnabled,
  requireUserId,
  requireVerifiedKyc,
  resolveLegalHashes,
  pricingForUnits,
} from '@/lib/nellie-loop';

function jsonError(err: unknown): NextResponse {
  if (err instanceof HttpError) {
    return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
  }
  const msg = err instanceof Error ? err.message : 'Unknown checkout error';
  return NextResponse.json({ error: msg }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { horseSlug, units = 1 } = body as { horseSlug?: string; units?: number };

    if (!horseSlug || typeof units !== 'number' || units < 1 || !Number.isInteger(units)) {
      return NextResponse.json(
        { error: 'Invalid horseSlug or units parameter' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = requireUserId(user);
    const userEmail = user?.email;
    if (!userEmail) {
      return NextResponse.json({ error: 'Authenticated user is missing an email' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('kyc_status')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message, code: 'PROFILE_LOOKUP_FAILED' },
        { status: 503 }
      );
    }
    const kycStatus =
      profile && typeof profile === 'object' && 'kyc_status' in profile
        ? String((profile as { kyc_status: string }).kyc_status)
        : null;
    requireVerifiedKyc(kycStatus);

    const { campaign, inventoryId } = assertCheckoutCampaign(horseSlug);
    const pricing = pricingForUnits(campaign.wholesaleMonthlyNzd, units);
    const legalPack = resolveLegalHashes(horseSlug);

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Checkout backend is not configured', code: 'SUPABASE_NOT_CONFIGURED' },
        { status: 503 }
      );
    }

    if (!purchasesAreEnabled()) {
      return NextResponse.json(
        {
          error: 'Purchases are not enabled. Stripe test keys required.',
          code: 'PURCHASES_DISABLED',
        },
        { status: 503 }
      );
    }

    const adminClient = getSupabaseServiceClient();
    const { data: reserveData, error: reserveError } = await adminClient.rpc('reserve_campaign_shares', {
      p_inventory_id: inventoryId,
      p_user_id: userId,
      p_units: units,
      p_ttl_minutes: 15,
    });
    const reservation = interpretReserveResult(reserveData, reserveError);

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY as string;
    const origin = request.headers.get('origin') || new URL(request.url).origin;
    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('customer_email', userEmail);
    params.append('success_url', `${origin}/mystable?checkout=success&slug=${horseSlug}&units=${units}`);
    params.append('cancel_url', `${origin}/horses/${horseSlug}`);
    params.append('line_items[0][price_data][currency]', 'nzd');
    params.append(
      'line_items[0][price_data][product_data][name]',
      `${campaign.legalName} (${units}% Syndicate Unit)`
    );
    params.append(
      'line_items[0][price_data][product_data][description]',
      `Initial 5×M float deposit for ${campaign.legalName}`
    );
    params.append('line_items[0][price_data][unit_amount]', String(pricing.joinFloatUnitNzd * 100));
    params.append('line_items[0][quantity]', '1');
    params.append('metadata[horse_slug]', horseSlug);
    params.append('metadata[units]', String(units));
    params.append('metadata[user_id]', userId);
    params.append('metadata[reservation_id]', reservation.reservationId);
    params.append('metadata[pds_hash]', legalPack.pdsHash);
    params.append('metadata[sa_hash]', legalPack.saHash);
    params.append('metadata[owner_name]', campaign.owner.entity);

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!stripeRes.ok) {
      const errJson = await stripeRes.json();
      return NextResponse.json({ error: errJson.error?.message || 'Stripe error' }, { status: 500 });
    }

    const session = await stripeRes.json();
    return NextResponse.json({ url: session.url, reservationExpiresAt: reservation.expiresAt });
  } catch (error: unknown) {
    return jsonError(error);
  }
}
