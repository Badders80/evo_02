import { NextResponse } from 'next/server';
import { createClient, getSupabaseServiceClient } from '@/lib/supabase-server';
import { HttpError, requireUserId } from '@/lib/nellie-loop';

/**
 * Acceptance audit tick (chunk-3, locked 2026-09-01: "each tick = recorded
 * acceptance (audit event)"). Writes event_type='acceptance' to the events
 * table via the service client (service_role has full access — 00001:290,343).
 *
 * Payload shape (audit #9): { horse_slug, stake_pct, doc: 'pds'|'sa', doc_hash }
 * stripe_event_id stays NULL (nullable, no UNIQUE violation).
 */

const DOCS = new Set(['pds', 'sa']);

function jsonError(err: unknown): NextResponse {
  if (err instanceof HttpError) {
    return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
  }
  const msg = err instanceof Error ? err.message : 'Acceptance recording failed';
  return NextResponse.json({ error: msg }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = requireUserId(user);

    const body = await request.json();
    const { horseSlug, stakePct, doc, docHash } = body as {
      horseSlug?: string;
      stakePct?: number;
      doc?: string;
      docHash?: string;
    };

    if (!horseSlug || typeof stakePct !== 'number' || !Number.isFinite(stakePct) || !doc || !DOCS.has(doc)) {
      return NextResponse.json({ error: 'Invalid acceptance payload' }, { status: 400 });
    }

    const adminClient = getSupabaseServiceClient();
    const { error } = await adminClient.from('events').insert({
      event_type: 'acceptance',
      payload: {
        horse_slug: horseSlug,
        stake_pct: stakePct,
        doc,
        doc_hash: docHash ?? null,
        user_id: userId,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return jsonError(err);
  }
}
