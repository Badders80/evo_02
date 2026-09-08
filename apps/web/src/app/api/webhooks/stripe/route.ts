import { NextResponse } from 'next/server';
import { createR2Client } from '@evo/storage/client';
import { uploadVaultDocument } from '@evo/storage/vault';
import { getSupabaseServiceClient } from '@/lib/supabase-server';
import { getCompiledLegalPackForCampaign } from '@/lib/horses-data';
import { verifyStripeSignature } from '@/lib/stripe-signature';
import {
  HttpError,
  assertNellieOnly,
  buildHoldingInsert,
  interpretConsumeResult,
  isUniqueViolation,
  pricingForUnits,
  r2ConfigFromEnv,
  requirePaidCheckoutSession,
  resolveCampaignInventory,
  resolveLegalHashes,
  stakePctToStepUnits,
} from '@/lib/nellie-loop';
import { handleIdentityEvent, isIdentityEvent } from '@/lib/identity-webhook';
import { handleSubscriptionEvent, isSubscriptionEvent } from '@/lib/subscription-webhook';
import { sendWelcomeEmail } from '@/lib/welcome-email';

type StripeEvent = {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
};

async function persistCompletedCheckout(event: StripeEvent): Promise<void> {
  const session = event.data.object;
  const metadata = (session.metadata as Record<string, string>) || {};
  const horseSlug = metadata.horse_slug;
  const userId = metadata.user_id;
  const reservationId = metadata.reservation_id;
  // Metadata carries investor-facing PERCENT (locked rule 2026-08-26). Parse as float,
  // never parseInt — a 1.5% purchase must not silently become 1%.
  const units = Number.parseFloat(metadata.units || '');

  if (!horseSlug || !userId || !reservationId || !Number.isFinite(units) || units <= 0) {
    throw new HttpError(
      400,
      'INVALID_METADATA',
      'checkout.session.completed is missing horse_slug, user_id, reservation_id, or units'
    );
  }

  requirePaidCheckoutSession(session);
  assertNellieOnly(horseSlug);
  const { campaign, inventoryId } = await resolveCampaignInventory(horseSlug);
  const hashes = await resolveLegalHashes(horseSlug);
  if (metadata.pds_hash && metadata.pds_hash !== hashes.pdsHash) {
    throw new HttpError(400, 'PDS_HASH_MISMATCH', 'Stripe metadata PDS hash does not match compiled pack');
  }
  if (metadata.sa_hash && metadata.sa_hash !== hashes.saHash) {
    throw new HttpError(400, 'SA_HASH_MISMATCH', 'Stripe metadata SA hash does not match compiled pack');
  }

  const pricing = pricingForUnits(campaign.wholesaleMonthlyNzd, units);
  const subscriptionId = typeof session.subscription === 'string' ? session.subscription : null;
  // float_balance_nzd = the 5×M join float, NOT session.amount_total (which in
  // subscription mode includes the first recurring month = 6×M).
  const holding = buildHoldingInsert({
    userId,
    inventoryId,
    units,
    amountPaidNzd: pricing.joinFloatUnitNzd,
    monthlyKeepNzd: pricing.monthlyKeepUnitNzd,
    pdsHash: hashes.pdsHash,
    saHash: hashes.saHash,
    subscriptionId,
  });

  const admin = getSupabaseServiceClient();
  const customerId = typeof session.customer === 'string' ? session.customer : null;
  if (customerId) {
    const { error: customerError } = await admin
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', userId);
    if (customerError) {
      throw new HttpError(500, 'CUSTOMER_UPDATE_FAILED', customerError.message);
    }
  }
  const { error: holdingError } = await admin.from('holdings').insert(holding);
  if (holdingError && !isUniqueViolation(holdingError)) {
    throw new HttpError(500, 'HOLDINGS_INSERT_FAILED', holdingError.message);
  }

  const { data: consumeData, error: consumeError } = await admin.rpc('consume_campaign_reservation', {
    p_inventory_id: inventoryId,
    p_user_id: userId,
    p_reservation_id: reservationId,
  });
  const consumed = interpretConsumeResult(consumeData, consumeError, isUniqueViolation(holdingError));
  if (!consumed.alreadyConsumed && consumed.units > 0) {
    // Reservation RPC counts step-units (0.5% each); metadata carries percent. Compare
    // in the same dimension — a percent/units mismatch here means the two ends diverged.
    const expectedStepUnits = stakePctToStepUnits(units, campaign.stakeStepPct);
    if (consumed.units !== expectedStepUnits) {
      throw new HttpError(500, 'RESERVATION_UNITS_MISMATCH', 'Consumed reservation units do not match Stripe metadata');
    }
  }

  const r2 = r2ConfigFromEnv();
  if (r2) {
    const pack = getCompiledLegalPackForCampaign(campaign);
    const client = createR2Client(r2);
    const prefix = `${horseSlug}/${userId}`;
    await uploadVaultDocument(
      client,
      r2.bucketName,
      { key: `${prefix}/${hashes.pdsHash}.md`, contentType: 'text/markdown' },
      pack.pdsMarkdown
    );
    await uploadVaultDocument(
      client,
      r2.bucketName,
      { key: `${prefix}/${hashes.saHash}.md`, contentType: 'text/markdown' },
      pack.saMarkdown
    );
  }

  // E4: welcome email after the holding is durably inserted (never rolls back
  // the checkout — sendWelcomeEmail swallows its own failures).
  await sendWelcomeEmail({ userId, horseSlug, horseName: campaign.legalName, units });
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const sig = request.headers.get('stripe-signature');
    const webhookSecrets = [
      process.env.STRIPE_CHECKOUT_WEBHOOK_SECRET,
      process.env.STRIPE_KYC_WEBHOOK_SECRET,
      process.env.STRIPE_WEBHOOK_SECRET,
    ].filter((s): s is string => Boolean(s));

    if (webhookSecrets.length === 0) {
      return NextResponse.json(
        { error: 'Stripe webhook secret is not configured', code: 'WEBHOOK_SECRET_MISSING' },
        { status: 503 }
      );
    }
    // Resilient: accept the signature if it verifies against ANY configured
    // secret. Checkout + Identity events may arrive on one endpoint signed with
    // different secrets; a single-secret read silently 400s the other event type.
    if (!sig || !webhookSecrets.some((secret) => verifyStripeSignature(rawBody, sig, secret))) {
      return NextResponse.json({ error: 'Invalid Stripe signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody) as StripeEvent;
    if (!event?.id || !event.type) {
      return NextResponse.json({ error: 'Invalid Stripe event' }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Webhook backend is not configured', code: 'SUPABASE_NOT_CONFIGURED' },
        { status: 503 }
      );
    }

    const admin = getSupabaseServiceClient();
    const { data: existingEvent, error: existingError } = await admin
      .from('events')
      .select('id, processed')
      .eq('stripe_event_id', event.id)
      .maybeSingle();

    if (existingError) {
      throw new HttpError(500, 'EVENT_LOOKUP_FAILED', existingError.message);
    }
    if (existingEvent?.processed) {
      return NextResponse.json({ received: true, status: 'already_processed' }, { status: 200 });
    }

    if (!existingEvent) {
      const { error: insertEventError } = await admin.from('events').insert({
        stripe_event_id: event.id,
        event_type: event.type,
        payload: event,
        processed: false,
      });
      if (insertEventError && !isUniqueViolation(insertEventError)) {
        throw new HttpError(500, 'EVENT_INSERT_FAILED', insertEventError.message);
      }
    }

    if (event.type === 'checkout.session.completed') {
      await persistCompletedCheckout(event);
    }
    if (isIdentityEvent(event.type)) {
      await handleIdentityEvent(event.type, event.data.object);
    }
    if (isSubscriptionEvent(event.type)) {
      await handleSubscriptionEvent(event.data.object);
    }

    const { error: markError } = await admin
      .from('events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('stripe_event_id', event.id);
    if (markError) {
      throw new HttpError(500, 'EVENT_MARK_FAILED', markError.message);
    }

    return NextResponse.json({ received: true, status: 'success' }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
    }
    const msg = err instanceof Error ? err.message : 'Webhook error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
