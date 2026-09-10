import { NextResponse } from 'next/server';
import { getCampaignBySlug, getCompiledLegalPackForCampaign } from '@/lib/horses-data';
import { createClient } from '@/lib/supabase-server';
import { isWorkflowPreview, previewUser } from '@/lib/nellie-loop';

/**
 * Stake-specific legal pack (investor-SA checkout, Task 2 + Task 4).
 * The modal is a client component and cannot import the compile (server-only
 * supabase client at module top), so it re-fetches the pack with the investor's
 * stake here. The merged pack keeps PDS/term-sheet locked at 1.0% and varies
 * only the SA — pdsHash is identical to the page-level compile.
 *
 * Task 4 (valid execution): when the investor is authenticated, the SA Execution
 * block carries their name + the tick date (NZTR pro-forma: tick on an online
 * form = valid execution). Unauthenticated reads render the blank markers.
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

  // Task 4: fill the SA Execution block only for an authenticated investor.
  // Review-branch preview: the test investor stands in for the session.
  let execution: { investorName?: string; executionDate?: string } | undefined;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const preview = isWorkflowPreview() ? previewUser() : null;
    const effectiveUser = user ?? preview;
    if (effectiveUser) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', effectiveUser.id)
        .maybeSingle();
      const fullName =
        profile && typeof profile === 'object' && 'full_name' in profile
          ? String((profile as { full_name: string | null }).full_name ?? '')
          : '';
      if (fullName) {
        execution = {
          investorName: fullName,
          executionDate: new Date().toISOString().slice(0, 10),
        };
      }
    }
  } catch {
    // Auth probe failure → render blank markers (docs stay readable pre-auth).
    execution = undefined;
  }

  const pack = getCompiledLegalPackForCampaign(campaign, stake, execution);
  return NextResponse.json({
    termSheetMarkdown: pack.termSheetMarkdown,
    pdsMarkdown: pack.pdsMarkdown,
    saMarkdown: pack.saMarkdown,
    termSheetHash: pack.termSheetHash,
    pdsHash: pack.pdsHash,
    saHash: pack.saHash,
  });
}
