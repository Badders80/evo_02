import { NextResponse } from 'next/server';
import { createClient, getSupabaseServiceClient } from '@/lib/supabase-server';
import { requireUserId } from '@/lib/nellie-loop';
import { createVerificationSession } from '@/lib/stripe-identity';

/**
 * POST /api/kyc/create-session — authenticated investor starts Identity flow.
 * Writes profiles.stripe_verification_session_id + kyc_status='pending', then
 * returns the Stripe hosted URL.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = requireUserId(user);

    const origin = request.headers.get('origin') || new URL(request.url).origin;
    // Return to the horse page so the modal can trigger checkout after KYC
    const { horseSlug } = await request.json();
    const returnUrl = horseSlug
      ? `${origin}/marketplace/${horseSlug}?kyc=return`
      : `${origin}/mystable?kyc=return`;

    const session = await createVerificationSession(userId, returnUrl);

    // Profile write goes through the service client (the typed SSR client's
    // Update generic collapses to never in this monorepo build).
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
    const status = (error as { status?: number }).status;
    if (status === 401) {
      return NextResponse.json({ error: 'Authentication required', code: 'UNAUTHENTICATED' }, { status: 401 });
    }
    const msg = error instanceof Error ? error.message : 'Unknown KYC error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
