import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { requireUserId } from '@/lib/nellie-loop';

/**
 * GET /api/kyc/status — returns the authenticated investor's current
 * kyc_status (401 unauthenticated, 503 on lookup failure).
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = requireUserId(user);

    const { data, error } = await supabase
      .from('profiles')
      .select('kyc_status')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message, code: 'PROFILE_LOOKUP_FAILED' }, { status: 503 });
    }

    const kycStatus =
      data && typeof data === 'object' && 'kyc_status' in data
        ? String((data as { kyc_status: string }).kyc_status)
        : null;

    return NextResponse.json({ kycStatus: kycStatus ?? 'unverified' });
  } catch (error: unknown) {
    const status = (error as { status?: number }).status;
    if (status === 401) {
      return NextResponse.json({ error: 'Authentication required', code: 'UNAUTHENTICATED' }, { status: 401 });
    }
    const msg = error instanceof Error ? error.message : 'Unknown KYC status error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
