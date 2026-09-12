import { getSupabaseServiceClient } from './supabase-service';

/**
 * Frozen legal artifacts.
 *
 * The investor's locked copy of a document is the acceptance event written at the
 * moment they ticked it: the exact markdown bytes, plus that document's hash. These
 * helpers read those bytes back — never a fresh compile — so the PDF a buyer
 * downloads is provably the document they accepted, even after the generator or the
 * campaign data moves on.
 */

export type AcceptedDocKey = 'pds' | 'sa';

export interface AcceptedDocument {
  doc: AcceptedDocKey;
  markdown: string;
  hash: string;
  acceptedAt: string;
  stakePct: number | null;
}

interface AcceptanceEventRow {
  created_at: string;
  payload: {
    horse_slug?: string;
    doc?: string;
    doc_hash?: string;
    doc_markdown?: string;
    stake_pct?: number;
    user_id?: string;
  } | null;
}

function toAccepted(row: AcceptanceEventRow): AcceptedDocument | null {
  const p = row.payload;
  if (!p?.doc_markdown || !p.doc_hash || (p.doc !== 'pds' && p.doc !== 'sa')) return null;
  return {
    doc: p.doc,
    markdown: p.doc_markdown,
    hash: p.doc_hash,
    acceptedAt: row.created_at,
    stakePct: typeof p.stake_pct === 'number' ? p.stake_pct : null,
  };
}

/** Every document this investor has accepted for one horse, keyed by doc. */
export async function getAcceptedDocuments(
  userId: string,
  slug: string
): Promise<Partial<Record<AcceptedDocKey, AcceptedDocument>>> {
  const admin = getSupabaseServiceClient();
  const { data, error } = await admin
    .from('events')
    .select('created_at, payload')
    .eq('event_type', 'acceptance')
    .eq('payload->>user_id', userId)
    .eq('payload->>horse_slug', slug)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw new Error(`acceptance lookup failed: ${error.message}`);

  const out: Partial<Record<AcceptedDocKey, AcceptedDocument>> = {};
  for (const row of (data ?? []) as AcceptanceEventRow[]) {
    const accepted = toAccepted(row);
    // Newest first — keep the first hit per doc (a re-acceptance supersedes).
    if (accepted && !out[accepted.doc]) out[accepted.doc] = accepted;
  }
  return out;
}

export async function getAcceptedDocument(
  userId: string,
  slug: string,
  doc: AcceptedDocKey
): Promise<AcceptedDocument | null> {
  const all = await getAcceptedDocuments(userId, slug);
  return all[doc] ?? null;
}
