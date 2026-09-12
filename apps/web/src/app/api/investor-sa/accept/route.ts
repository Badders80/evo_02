import { NextResponse } from 'next/server';
import { createClient, getSupabaseServiceClient } from '@/lib/supabase-server';
import { HttpError, requireUserId } from '@/lib/nellie-loop';
import { createVerificationSession } from '@/lib/stripe-identity';
import { getInventoryId } from '@/lib/inventory-ids';
import { getCampaignBySlug, getCompiledLegalPackForCampaign } from '@/lib/horses-data';

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

    // ONE source of truth: the acceptance must record the SAME bytes the investor
    // ticked, so compile through the shared pack builder with the identical
    // execution context (investor name + tick date) the modal used. A local copy
    // of the context builder lived here and drifted from horses-data, producing a
    // different saHash than the document on screen.
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

    const legalPack = getCompiledLegalPackForCampaign(campaign, units, execution);

    if (!legalPack?.saMarkdown || !legalPack?.saHash) {
      return NextResponse.json({ error: 'Legal pack compilation failed' }, { status: 503 });
    }

    // Record BOTH accepted documents as immutable audit events — the exact markdown
    // bytes the investor ticked in Step 3 (the accordion gates the PDS, then the SA).
    // These rows ARE the locked artifact: /api/legal/artifact renders the PDF from
    // them, so the download can never drift from the accepted text.
    const adminClient = getSupabaseServiceClient();
    const { error: eventError } = await adminClient.from('events').insert([
      {
        event_type: 'acceptance',
        payload: {
          horse_slug: horseSlug,
          stake_pct: units,
          doc: 'pds',
          doc_hash: legalPack.pdsHash,
          doc_markdown: legalPack.pdsMarkdown,
          user_id: userId,
        },
      },
      {
        event_type: 'acceptance',
        payload: {
          horse_slug: horseSlug,
          stake_pct: units,
          doc: 'sa',
          doc_hash: legalPack.saHash,
          doc_markdown: legalPack.saMarkdown,
          user_id: userId,
        },
      },
    ]);

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
    // Return to the horse page so the modal can trigger checkout after KYC
    const returnUrl = `${origin}/marketplace/${horseSlug}?kyc=return`;

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