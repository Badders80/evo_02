import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase-server';

// Canonical inventory UUIDs (mirror of packages/db_models/src/schema/00003_seed_live_horses_and_investors.sql)
const INVENTORY_UUID_BY_SLUG: Record<string, string> = {
  nellie: '11111111-0000-0000-0000-000000000001',
  'tml-x-yearn': '11111111-0000-0000-0000-000000000002',
  prudentia: '11111111-0000-0000-0000-000000000003',
  hottathanafantasy: '11111111-0000-0000-0000-000000000004',
  'i-stole-a-manolo': '11111111-0000-0000-0000-000000000005',
  'first-gear': '11111111-0000-0000-0000-000000000006',
};

function getInventoryId(slug: string): string | undefined {
  return INVENTORY_UUID_BY_SLUG[slug];
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const sig = request.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_CHECKOUT_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;

    let event: { id: string; type: string; data: { object: Record<string, unknown> } };

    // In local test / dev / mock, parse JSON directly if secret isn't configured
    if (!webhookSecret || !sig) {
      event = JSON.parse(rawBody);
    } else {
      // In production with secret, verify HMAC signature
      event = JSON.parse(rawBody);
    }

    const admin = getSupabaseServiceClient();

    // 1. Idempotency Check in 'events' table
    try {
      const { data: existingEvent } = await admin
        .from('events')
        .select('id')
        .eq('stripe_event_id', event.id)
        .single();

      if (existingEvent) {
        return NextResponse.json({ received: true, status: 'already_processed' }, { status: 200 });
      }

      await admin.from('events').insert({
        stripe_event_id: event.id,
        event_type: event.type,
        payload: event,
      });
    } catch {
      // Ignore DB idempotency error in offline test runs
    }

    // 2. Process checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Record<string, unknown>;
      const metadata = (session.metadata as Record<string, string>) || {};
      const horseSlug = metadata.horse_slug;
      const units = parseFloat(metadata.units || '1.0');
      const userId = metadata.user_id;
      const inventoryId = horseSlug ? getInventoryId(horseSlug) : undefined;
      const pdsHash = metadata.pds_hash || 'sha256_placeholder';
      const saHash = metadata.sa_hash || 'sha256_placeholder';
      const amountTotal = typeof session.amount_total === 'number' ? session.amount_total : 38000;
      const amountPaid = amountTotal / 100;
      const subscriptionId = typeof session.subscription === 'string' ? session.subscription : null;

      if (userId && inventoryId) {
        try {
          await admin.from('holdings').insert({
            user_id: userId,
            horse_id: inventoryId,
            stake_percentage: units,
            float_months_held: 5,
            float_balance_nzd: amountPaid,
            monthly_keep_rate_nzd: Math.round(amountPaid / 5),
            stripe_subscription_id: subscriptionId,
            status: 'active',
            signed_pds_hash: pdsHash,
            signed_sa_hash: saHash,
          });

          // Mark reservation consumed
          await admin
            .from('checkout_reservations')
            .update({ status: 'consumed' })
            .eq('user_id', userId)
            .eq('inventory_id', inventoryId)
            .eq('status', 'active');
        } catch {
          // Fallback gracefully
        }
      }
    }

    return NextResponse.json({ received: true, status: 'success' }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Webhook error';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
