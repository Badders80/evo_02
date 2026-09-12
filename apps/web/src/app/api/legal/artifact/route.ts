import { NextResponse } from 'next/server';
import { computeSha256, renderLegalPdf } from '@evo/legal_engine';
import { getAcceptedDocument, type AcceptedDocKey } from '@/lib/legal-artifacts';
import { getCampaignBySlug } from '@/lib/horses-data';
import { HttpError, requireUserId } from '@/lib/nellie-loop';
import { createClient } from '@/lib/supabase-server';

/**
 * GET /api/legal/artifact?slug=<campaign>&doc=pds|sa
 *
 * The investor's LOCKED copy: renders a PDF from the exact bytes recorded in their
 * acceptance event — never a fresh compile — so the download is provably the
 * document they ticked. Hash is re-verified before rendering; a mismatch refuses
 * the artifact rather than serving something that is not the signed document.
 */
const TITLES: Record<AcceptedDocKey, string> = {
  pds: 'Product Disclosure Statement',
  sa: 'Syndicate Agreement',
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const doc = searchParams.get('doc') ?? 'pds';

    if (!slug) return NextResponse.json({ error: 'slug required', code: 'SLUG_REQUIRED' }, { status: 400 });
    if (doc !== 'pds' && doc !== 'sa') {
      return NextResponse.json({ error: 'doc must be pds or sa', code: 'BAD_DOC' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = requireUserId(user);

    const campaign = await getCampaignBySlug(slug);
    if (!campaign) return NextResponse.json({ error: 'Horse not found' }, { status: 404 });

    const accepted = await getAcceptedDocument(userId, slug, doc);
    if (!accepted) {
      // Nothing accepted yet — the caller should show the live offer documents instead.
      return NextResponse.json(
        { error: 'No accepted document on record for this investor', code: 'NO_ACCEPTED_DOCUMENT' },
        { status: 404 }
      );
    }

    // The lock only means something if the stored bytes still hash to the recorded
    // digest — verify before rendering.
    const actual = computeSha256(accepted.markdown);
    if (actual !== accepted.hash) {
      return NextResponse.json(
        { error: 'Stored document does not match its recorded hash', code: 'ARTIFACT_HASH_MISMATCH' },
        { status: 409 }
      );
    }

    const pdf = renderLegalPdf(accepted.markdown, {
      title: `${TITLES[doc]} — ${campaign.legalName}`,
      footerLeft: `Evolution Stables — Syndicate Manager | accepted ${accepted.acceptedAt}`,
      docHash: accepted.hash,
      version: 'v1.0.0',
    });

    const filename = `${slug}-${doc}-${accepted.hash.slice(0, 8)}.pdf`;
    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, max-age=0, must-revalidate',
        'X-Legal-Doc-Hash': accepted.hash,
      },
    });
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    const status = (error as { status?: number }).status;
    if (status === 401) {
      return NextResponse.json({ error: 'Authentication required', code: 'UNAUTHENTICATED' }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
