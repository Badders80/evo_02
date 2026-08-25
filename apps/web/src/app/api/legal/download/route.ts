import { NextResponse } from 'next/server';
import { getCampaignBySlug, getCompiledLegalPackForCampaign } from '@/lib/horses-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') ?? 'nellie';
  const doc = searchParams.get('doc') ?? 'pds';

  const campaign = await getCampaignBySlug(slug);
  if (!campaign) {
    return NextResponse.json({ error: 'Horse not found' }, { status: 404 });
  }

  const pack = getCompiledLegalPackForCampaign(campaign);

  let content: string;
  let filename: string;

  if (doc === 'pds') {
    content = pack.pdsMarkdown;
    filename = `${slug}_product_disclosure_statement.md`;
  } else if (doc === 'sa') {
    content = pack.saMarkdown;
    filename = `${slug}_syndicate_agreement.md`;
  } else {
    content = pack.termSheetMarkdown;
    filename = `${slug}_term_sheet.md`;
  }

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
