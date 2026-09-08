// apps/web/src/app/api/ops/float-decay/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase-server';
import { decayFloat } from '@/lib/float-decay';

/**
 * POST /api/ops/float-decay — human-triggered monthly float decrement.
 * Decrements every active holding's float_months_held by 1 (floor 3) and
 * flags in-fault/default. Short-run: human-in-the-loop; promote to cron later.
 *
 * Idempotency note (kimi WARN): this endpoint is NOT idempotent — running it
 * twice in the same month double-decays. In the short run the operator runs it
 * once per month (human-in-the-loop). When promoted to cron, add a
 * `last_decayed_at` timestamp (or month marker) guard so a re-run is a no-op.
 */
export async function POST(request: Request) {
  const token = request.headers.get('x-operator-token');
  if (!token || token !== process.env.OPERATOR_API_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const admin = getSupabaseServiceClient();
  const { data: holdings, error } = await admin
    .from('holdings')
    .select('id, float_months_held')
    .eq('status', 'active')
    .gt('float_months_held', 3); // guard: never decay a holding already at the floor
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }
  let decayed = 0;
  for (const h of holdings ?? []) {
    const next = decayFloat(Number(h.float_months_held));
    if (next !== Number(h.float_months_held)) {
      await admin.from('holdings').update({ float_months_held: next }).eq('id', h.id);
      decayed += 1;
    }
  }
  return NextResponse.json({ decayed });
}
