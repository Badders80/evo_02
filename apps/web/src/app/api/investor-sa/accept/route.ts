import { NextResponse } from 'next/server';
import { createClient, getSupabaseServiceClient } from '@/lib/supabase-server';
import { HttpError, requireUserId } from '@/lib/nellie-loop';
import { createVerificationSession } from '@/lib/stripe-identity';
import { getInventoryId } from '@/lib/inventory-ids';
import { getCampaignBySlug } from '@/lib/horses-data';
import { compileLegalPack, computeDslPricing } from '@evo/legal_engine';

/**
 * POST /api/investor-sa/accept — Investor-SA checkout (Task 2 from G009).
 * Records SA acceptance with the exact markdown bytes the investor read,
 * then starts KYC flow (returns Stripe Identity URL).
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = requireUserId(user);

    const body = await request.json();
    const { horseSlug, units } = body as { horseSlug?: string; units?: number };

    if (!horseSlug || typeof units !== 'number' || !Number.isFinite(units)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Fetch the campaign data
    const campaign = await getCampaignBySlug(horseSlug);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Build the legal context (same logic as getCompiledLegalPackForCampaign)
    const buildContext = (pricing: any) => ({
      syndicateName: `${campaign.legalName} Syndicate`,
      campaignSlug: campaign.slug,
      ownerName: campaign.owner.entity,
      horse: {
        legalName: campaign.legalName,
        barnName: campaign.barnName ?? campaign.legalName,
        foalingYear: campaign.pedigree.foalingDate ? parseInt(campaign.pedigree.foalingDate.split('-')[0], 10) : 0,
        foalingDate: campaign.pedigree.foalingDate || undefined,
        gender: campaign.pedigree.gender as 'Colt' | 'Filly' | 'Gelding' | 'Mare' | 'Horse',
        breeder: campaign.pedigree.breeder,
        microchip: campaign.pedigree.microchip,
        sire: campaign.pedigree.sire,
        dam: campaign.pedigree.dam,
      },
      trainer: {
        name: campaign.trainer.name,
        location: campaign.trainer.location,
        managerEntity: 'Evolution Stables',
      },
      pricing,
      closeStyle: campaign.closeStyle,
      totalHorsePercentage: campaign.totalSyndicateStakePct,
      totalShares: Math.round(campaign.totalSyndicateStakePct),
      sharesAvailable: Math.round(campaign.capTableFixture.availablePct),
      paymentModel: campaign.paymentModel,
      termStartDate: campaign.termStartDate,
      termEndDate: campaign.termEndDate,
      distributionSplit: campaign.distributionSplit,
      distributionSchedule: campaign.distributionSchedule,
      pdsVersion: '1.0.0',
      saVersion: '1.0.0',
      effectiveDate: campaign.termStartDate,
      investorName: undefined,
      executionDate: undefined,
      softLegal: campaign.softLegal,
      marketing: campaign.marketing,
      listingPlatform: campaign.listingPlatform,
    });

    // Locked docs (PDS + term sheet) always compile at 1.0%
    const lockedPricing = computeDslPricing(campaign.wholesaleMonthlyNzd, 1.0);
    const { pack: lockedPack } = compileLegalPack(buildContext(lockedPricing), { skipValidation: true });

    // Investor-specific SA: recompile with the investor's stake, keep PDS/TS locked
    const saPricing = computeDslPricing(campaign.wholesaleMonthlyNzd, units);
    const { pack: saPack } = compileLegalPack(buildContext(saPricing), { skipValidation: true });

    const legalPack = {
      ...lockedPack,
      saMarkdown: saPack.saMarkdown,
      saHash: saPack.saHash,
    };

    if (!legalPack?.saMarkdown || !legalPack?.saHash) {
      return NextResponse.json({ error: 'Legal pack compilation failed' }, { status: 503 });
    }

    // Record the SA acceptance audit event (same pattern as /api/acceptance)
    const adminClient = getSupabaseServiceClient();
    const { error: eventError } = await adminClient.from('events').insert({
      event_type: 'acceptance',
      payload: {
        horse_slug: horseSlug,
        stake_pct: units,
        doc: 'sa',
        doc_hash: legalPack.saHash,
        doc_markdown: legalPack.saMarkdown,
        user_id: userId,
      },
    });

    if (eventError) {
      return NextResponse.json({ error: eventError.message }, { status: 503 });
    }

    // Also update the holding row's signed_sa_hash if it exists
    const inventoryId = getInventoryId(horseSlug);
    if (inventoryId) {
      const { error: holdingError } = await adminClient
        .from('holdings')
        .update({ signed_sa_hash: legalPack.saHash })
        .eq('user_id', userId)
        .eq('horse_id', inventoryId);
      if (holdingError && !String(holdingError.message).includes('0 rows')) {
        console.warn('holding sa_hash sync failed:', holdingError.message);
      }
    }

    // Start KYC flow (same as /api/kyc/create-session)
    const origin = request.headers.get('origin') || new URL(request.url).origin;
    const returnUrl = `${origin}/mystable?kyc=return`;

    const session = await createVerificationSession(userId, returnUrl);

    const admin = getSupabaseServiceClient();
    const { error: updateError } = await admin
      .from('profiles')
      .update({
        stripe_verification_session_id: session.id,
        kyc_status: 'pending',
      })
      .eq('id', userId);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message, code: 'PROFILE_UPDATE_FAILED' },
        { status: 503 }
      );
    }

    if (!session.url) {
      return NextResponse.json(
        { error: 'Stripe returned no hosted verification URL', code: 'STRIPE_NO_URL' },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'STRIPE_SECRET_KEY is not configured') {
      return NextResponse.json({ error: 'KYC is not configured', code: 'KYC_NOT_CONFIGURED' }, { status: 503 });
    }
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    const status = (error as { status?: number }).status;
    if (status === 401) {
      return NextResponse.json({ error: 'Authentication required', code: 'UNAUTHENTICATED' }, { status: 401 });
    }
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}