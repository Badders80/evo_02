import { NextResponse } from 'next/server';
import { createClient, getSupabaseServiceClient } from '@/lib/supabase-server';
import { computeDslPricing } from '@evo/legal_engine';
import { getCampaignBySlug, getCompiledLegalPackForCampaign, isCheckoutOpen } from '@/lib/horses-data';

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
    const body = await request.json();
    const { horseSlug, units = 1 } = body;

    if (!horseSlug || units < 1) {
      return NextResponse.json(
        { error: 'Invalid horseSlug or units parameter' },
        { status: 400 }
      );
    }

    // 1. Verify user session via SSR Supabase client
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id ?? 'usr_guest_demo';
    const userEmail = user?.email ?? 'investor@evolutionstables.nz';

    // 2. Fetch canonical campaign data
    const campaign = getCampaignBySlug(horseSlug);
    if (!campaign) {
      return NextResponse.json({ error: 'Thoroughbred campaign not found' }, { status: 404 });
    }
    if (!isCheckoutOpen(campaign)) {
      return NextResponse.json(
        { error: 'This campaign is visible but not open for subscription' },
        { status: 409 }
      );
    }

    const inventoryId = getInventoryId(horseSlug);
    if (!inventoryId) {
      return NextResponse.json({ error: 'Unknown inventory UUID for campaign' }, { status: 500 });
    }

    // 3. Compute canonical DSL pricing ($5xM float join + monthly M)
    const pricing = computeDslPricing(campaign.wholesaleMonthlyNzd, units);
    const legalPack = getCompiledLegalPackForCampaign(campaign);

    // 4. Concurrency reservation (15-minute lock)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    try {
      const adminClient = getSupabaseServiceClient();
      await adminClient.from('checkout_reservations').insert({
        inventory_id: inventoryId,
        user_id: userId,
        units,
        status: 'active',
        expires_at: expiresAt,
      });
    } catch {
      // In offline/fixture mode without live DB, continue seamlessly
    }

    // 5. Handle Stripe Engine
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const purchasesEnabled = process.env.PURCHASES_ENABLED === 'true';

    // If Stripe secret is present & purchases are enabled, we can call Stripe API
    if (stripeSecretKey && purchasesEnabled) {
      const params = new URLSearchParams();
      params.append('mode', 'payment');
      params.append('customer_email', userEmail);
      params.append('success_url', `${request.headers.get('origin')}/mystable?checkout=success&slug=${horseSlug}&units=${units}`);
      params.append('cancel_url', `${request.headers.get('origin')}/horses/${horseSlug}`);
      params.append('line_items[0][price_data][currency]', 'nzd');
      params.append('line_items[0][price_data][product_data][name]', `${campaign.legalName} (${units}% Syndicate Unit)`);
      params.append('line_items[0][price_data][product_data][description]', `Initial 5×M float deposit for ${campaign.legalName}`);
      params.append('line_items[0][price_data][unit_amount]', String(pricing.joinFloatUnitNzd * 100));
      params.append('line_items[0][quantity]', '1');
      params.append('metadata[horse_slug]', horseSlug);
      params.append('metadata[units]', String(units));
      params.append('metadata[user_id]', userId);
      params.append('metadata[pds_hash]', legalPack.pdsHash);
      params.append('metadata[sa_hash]', legalPack.saHash);

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
      return NextResponse.json({ url: session.url, reservationExpiresAt: expiresAt });
    }

    // Sandbox / Instant Walkthrough Mode
    const sandboxUrl = `/mystable?checkout=sandbox_success&slug=${horseSlug}&units=${units}&float=${pricing.joinFloatUnitNzd}`;
    return NextResponse.json({
      url: sandboxUrl,
      reservationExpiresAt: expiresAt,
      isSandbox: true,
      pricing,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown checkout error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
