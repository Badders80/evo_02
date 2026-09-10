import { NextResponse } from 'next/server';
import { getCampaignBySlug, getCompiledLegalPackForCampaign } from '@/lib/horses-data';

/**
 * Stake-specific legal pack (investor-SA checkout, Task 2).
 * The modal is a client component and cannot import the compile (server-only
 * supabase client at module top), so it re-fetches the pack with the investor's
 * stake here. The merged pack keeps PDS/term-sheet locked at 1.0% and varies
 * only the SA — pdsHash is identical to the page-level compile.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const stake = parseFloat(searchParams.get('stake') ?? '1.0');

  if (!slug) {
    return NextResponse.json({ error: 'slug required' }, { status: 400 });
  }
  if (!Number.isFinite(stake) || stake <= 0 || stake > 100) {
    return NextResponse.json({ error: 'invalid stake' }, { status: 400 });
  }

  const campaign = await getCampaignBySlug(slug);
  if (!campaign) {
    return NextResponse.json({ error: 'Horse not found' }, { status: 404 });
  }

  const pack = getCompiledLegalPackForCampaign(campaign, stake);
  return NextResponse.json({
    pdsMarkdown: pack.pdsMarkdown,
    saMarkdown: pack.saMarkdown,
    pdsHash: pack.pdsHash,
    saHash: pack.saHash,
  });
}
