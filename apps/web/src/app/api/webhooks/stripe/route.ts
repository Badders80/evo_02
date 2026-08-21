import { NextResponse } from 'next/server';
import { createR2Client } from '@evo/storage/client';
import { uploadVaultDocument } from '@evo/storage/vault';
import { getSupabaseServiceClient } from '@/lib/supabase-server';
import { getCompiledLegalPackForCampaign } from '@/lib/horses-data';
import { verifyStripeSignature } from '@/lib/stripe-signature';
import {
  HttpError,
  buildHoldingInsert,
  isUniqueViolation,
  pricingForUnits,
  r2ConfigFromEnv,
  resolveCampaignInventory,
  resolveLegalHashes,
  resolvePaidAmountNzd,
} from '@/lib/nellie-loop';

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
  const units = Number.parseInt(metadata.units || '', 10);

  if (!horseSlug || !userId || !Number.isInteger(units) || units < 1) {
    throw new HttpError(400, 'INVALID_METADATA', 'checkout.session.completed is missing horse_slug, user_id, or units');
  }

  const { campaign, inventoryId } = resolveCampaignInventory(horseSlug);
  const hashes = resolveLegalHashes(horseSlug);
  if (metadata.pds_hash && metadata.pds_hash !== hashes.pdsHash) {
    throw new HttpError(400, 'PDS_HASH_MISMATCH', 'Stripe metadata PDS hash does not match compiled pack');
  }
  if (metadata.sa_hash && metadata.sa_hash !== hashes.saHash) {
    throw new HttpError(400, 'SA_HASH_MISMATCH', 'Stripe metadata SA hash does not match compiled pack');
  }

  const pricing = pricingForUnits(campaign.wholesaleMonthlyNzd, units);
  const amountPaid = resolvePaidAmountNzd(session.amount_total, pricing.joinFloatUnitNzd);
  const subscriptionId = typeof session.subscription === 'string' ? session.subscription : null;
  const holding = buildHoldingInsert({
    userId,
    inventoryId,
    units,
    amountPaidNzd: amountPaid,
    monthlyKeepNzd: pricing.monthlyKeepUnitNzd,
    pdsHash: hashes.pdsHash,
    saHash: hashes.saHash,
    subscriptionId,
  });

  const admin = getSupabaseServiceClient();
  const { error: holdingError } = await admin.from('holdings').insert(holding);
  if (holdingError && !isUniqueViolation(holdingError)) {
    throw new HttpError(500, 'HOLDINGS_INSERT_FAILED', holdingError.message);
  }

  const { data: consumeData, error: consumeError } = await admin.rpc('consume_campaign_reservation', {
    p_inventory_id: inventoryId,
    p_user_id: userId,
  });
  if (consumeError) {
    throw new HttpError(500, 'RESERVATION_CONSUME_FAILED', consumeError.message);
  }
  const consumed = consumeData as { success?: boolean; consumed_count?: number } | null;
  if (!consumed || consumed.success !== true) {
    throw new HttpError(500, 'RESERVATION_CONSUME_FAILED', 'consume_campaign_reservation returned success: false');
  }
  if ((consumed.consumed_count ?? 0) === 0 && !isUniqueViolation(holdingError)) {
    throw new HttpError(500, 'RESERVATION_MISSING', 'No active reservation to consume');
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
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const sig = request.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_CHECKOUT_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;

    if (webhookSecret) {
      if (!sig || !verifyStripeSignature(rawBody, sig, webhookSecret)) {
        return NextResponse.json({ error: 'Invalid Stripe signature' }, { status: 400 });
      }
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
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
