import { NextResponse } from 'next/server';
import { createClient, getSupabaseServiceClient } from '@/lib/supabase-server';
import { HttpError, requireUserId } from '@/lib/nellie-loop';
import { getInventoryId } from '@/lib/inventory-ids';
import { computeSha256 } from '@evo/storage/hash';

/**
 * Acceptance audit tick (chunk-3, locked 2026-09-01: "each tick = recorded
 * acceptance (audit event)"). Writes event_type='acceptance' to the events
 * table via the service client (service_role has full access — 00001:290,343).
 *
 * Payload shape (audit #9): { horse_slug, stake_pct, doc: 'pds'|'sa', doc_hash }
 * stripe_event_id stays NULL (nullable, no UNIQUE violation).
 *
 * Investor-SA checkout (Task 3): the tick also carries the doc markdown the
 * investor actually read (docMarkdown) — the event IS the contract record
 * (doc + hash + stake + timestamp). Per-doc integrity guard: sha256(docMarkdown)
 * must equal docHash (same-request bytes, byte-identical by construction).
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
    const { horseSlug, stakePct, doc, docHash, docMarkdown } = body as {
      horseSlug?: string;
      stakePct?: number;
      doc?: string;
      docHash?: string;
      docMarkdown?: string;
    };

    if (!horseSlug || typeof stakePct !== 'number' || !Number.isFinite(stakePct) || !doc || !DOCS.has(doc)) {
      return NextResponse.json({ error: 'Invalid acceptance payload' }, { status: 400 });
    }

    // Per-doc integrity guard (kimi WARN-5): the markdown must hash to the claimed
    // digest — the same bytes the web compiled, validated independently per doc.
    if (docHash && typeof docMarkdown === 'string' && docMarkdown.length > 0) {
      const actual = computeSha256(docMarkdown);
      if (actual !== docHash) {
        return NextResponse.json({ error: 'Document hash mismatch' }, { status: 400 });
      }
    }

    const adminClient = getSupabaseServiceClient();
    const { error } = await adminClient.from('events').insert({
      event_type: 'acceptance',
      payload: {
        horse_slug: horseSlug,
        stake_pct: stakePct,
        doc,
        doc_hash: docHash ?? null,
        doc_markdown: typeof docMarkdown === 'string' ? docMarkdown : null,
        user_id: userId,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    // When a holding row already exists (e.g. re-tick after payment), keep the
    // signed hash columns in sync with the acceptance record.
    const inventoryId = getInventoryId(horseSlug);
    if (inventoryId && docHash) {
      const column = doc === 'pds' ? 'signed_pds_hash' : 'signed_sa_hash';
      const { error: holdingError } = await adminClient
        .from('holdings')
        .update({ [column]: docHash })
        .eq('user_id', userId)
        .eq('horse_id', inventoryId);
      if (holdingError) {
        // Non-fatal: the events row is the contract record; a missing holding is
        // expected pre-payment. Surface only unexpected failures.
        if (!String(holdingError.message).includes('0 rows')) {
          return NextResponse.json({ error: holdingError.message }, { status: 503 });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return jsonError(err);
  }
}
