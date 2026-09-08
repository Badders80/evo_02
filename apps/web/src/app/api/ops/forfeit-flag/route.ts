// apps/web/src/app/api/ops/forfeit-flag/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase-server';
import { forfeitOutcome } from '@/lib/forfeit';

/**
 * POST /api/ops/forfeit-flag — human-triggered: flags holdings at the 3-month
 * floor for forfeit review. Does NOT relist or distribute — those are
 * human-approved actions (short-run human-in-the-loop).
 */
export async function POST(request: Request) {
  const token = request.headers.get('x-operator-token');
  if (!token || token !== process.env.OPERATOR_API_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const admin = getSupabaseServiceClient();
  const { data: holdings, error } = await admin
    .from('holdings')
    .select('id, float_months_held, monthly_keep_rate_nzd')
    .eq('status', 'active');
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }
  const flagged = [];
  for (const h of holdings ?? []) {
    const o = forfeitOutcome({ floatMonthsHeld: Number(h.float_months_held), monthlyKeepNzd: Number(h.monthly_keep_rate_nzd) });
    if (o.shouldForfeit) {
      await admin.from('holdings').update({ status: 'exiting' }).eq('id', h.id);
      flagged.push({ holdingId: h.id, forfeitedDepositNzd: o.forfeitedDepositNzd });
    }
  }
  return NextResponse.json({ flagged });
}
