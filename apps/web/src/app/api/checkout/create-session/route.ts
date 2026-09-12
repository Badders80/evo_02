import { NextResponse } from 'next/server';
import { createClient, getSupabaseServiceClient } from '@/lib/supabase-server';
import {
  HttpError,
  assertCheckoutCampaign,
  assertNoActiveHolding,
  interpretReserveResult,
  purchasesAreEnabled,
  requireUserId,
  resolveLegalHashes,
  pricingForUnits,
  stakePctToStepUnits,
  isWorkflowPreview,
  PREVIEW_USER_EMAIL,
} from '@/lib/nellie-loop';
import { buildSubscriptionCheckoutParams } from '@/lib/stripe-subscription';

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

    // Investor-facing `units` are PERCENT of the horse (locked rule 2026-08-26).
    if (!horseSlug || typeof units !== 'number' || !Number.isFinite(units) || units <= 0) {
      return NextResponse.json(
        { error: 'Invalid horseSlug or units parameter', code: 'INVALID_STAKE' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = requireUserId(user);
    // Review-branch preview: fall back to the test investor's email.
    const userEmail = user?.email ?? (isWorkflowPreview() ? PREVIEW_USER_EMAIL : null);
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
    // Chunk-4: KYC_REQUIRED carries the investor's current kyc_status so the modal can
    // render the honest state (prompt / pending / rejected) instead of guessing. The KYC
    // port (Firebase → Supabase) is a separate workstream — this route stays the gate.
    // Review-branch preview (WORKFLOW_PREVIEW=true): skip the KYC gate so the chain
    // walks end-to-end without Stripe Identity. Never set in prod.
    if (kycStatus !== 'verified' && process.env.WORKFLOW_PREVIEW !== 'true') {
      return NextResponse.json(
        {
          error: 'KYC verification required before checkout',
          code: 'KYC_REQUIRED',
          kycStatus: kycStatus ?? null,
        },
        { status: 403 }
      );
    }

    const { campaign, inventoryId } = await assertCheckoutCampaign(horseSlug);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }
    const pricing = pricingForUnits(campaign.wholesaleMonthlyNzd, units);
    // Investor-SA checkout: the SA hash in Stripe metadata must be the investor's
    // stake-specific compile — the doc they ticked in Step 3. Task 4: the execution
    // block (name + tick date) is part of the signed bytes, so the compile carries
    // the same execution context the investor ticked.
    const { data: execProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .maybeSingle();
    const fullName =
      execProfile && typeof execProfile === 'object' && 'full_name' in execProfile
        ? String((execProfile as { full_name: string | null }).full_name ?? '')
        : '';
    const execution = fullName
      ? { investorName: fullName, executionDate: new Date().toISOString().slice(0, 10) }
      : undefined;
    const legalPack = await resolveLegalHashes(horseSlug, units, execution);

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
    // Founder option A (2026-09-12): refuse a repeat purchase before payment.
    await assertNoActiveHolding(adminClient, userId, inventoryId);
    // Boundary conversion: the reservation RPC counts 0.5% step-units against
    // inventory.shares_available — investor-facing values are percent. Convert here only.
    const stepUnits = stakePctToStepUnits(units, campaign.stakeStepPct);
    const { data: reserveData, error: reserveError } = await adminClient.rpc('reserve_campaign_shares', {
      p_inventory_id: inventoryId,
      p_user_id: userId,
      p_units: stepUnits,
      p_ttl_minutes: 15,
    });
    const reservation = interpretReserveResult(reserveData, reserveError);

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY as string;
    const origin = request.headers.get('origin') || new URL(request.url).origin;
    const params = buildSubscriptionCheckoutParams({
      userEmail,
      legalName: campaign.legalName,
      units,
      monthlyKeepUnitNzd: pricing.monthlyKeepUnitNzd,
      joinFloatUnitNzd: pricing.joinFloatUnitNzd,
      origin,
      metadata: {
        horse_slug: horseSlug,
        units: String(units),
        user_id: userId,
        reservation_id: reservation.reservationId,
        pds_hash: legalPack.pdsHash,
        sa_hash: legalPack.saHash,
        owner_name: campaign.owner.entity,
        // Task 4: the execution block (name + tick date) is part of the signed SA
        // bytes — carry it so the webhook recompiles the identical document.
        investor_name: execution?.investorName ?? '',
        execution_date: execution?.executionDate ?? '',
      },
    });

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
      // Chunk-5 (f10): Stripe failures map to STRIPE_DECLINE so the modal can render
      // investor copy — raw Stripe error strings never reach the investor.
      return NextResponse.json(
        { error: errJson.error?.message || 'Stripe error', code: 'STRIPE_DECLINE' },
        { status: 500 }
      );
    }

    const session = await stripeRes.json();
    return NextResponse.json({ url: session.url, reservationExpiresAt: reservation.expiresAt });
  } catch (error: unknown) {
    return jsonError(error);
  }
}
