import { NextResponse } from 'next/server';
import { getCampaignBySlug } from '@/lib/horses-data';
import {
  generateTermSheetMarkdown,
  generatePdsMarkdown,
  generateSaMarkdown,
  computeDslPricing,
  type SyndicateLegalContext,
} from '@evo/legal_engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') ?? 'nellie';
  const doc = searchParams.get('doc') ?? 'pds';

  const campaign = getCampaignBySlug(slug);
  if (!campaign) {
    return NextResponse.json({ error: 'Horse not found' }, { status: 404 });
  }

  const pricing = computeDslPricing(campaign.wholesaleMonthlyNzd, 1.0);

  const context: SyndicateLegalContext = {
    syndicateName: `${campaign.legalName} Syndicate`,
    campaignSlug: campaign.slug,
    ownerName: 'Evolution Stables',
    horse: {
      legalName: campaign.legalName,
      barnName: campaign.barnName ?? campaign.legalName,
      foalingYear: parseInt(campaign.pedigree.foalingDate.split('-')[0], 10),
      gender: campaign.pedigree.gender as 'Colt' | 'Filly' | 'Gelding' | 'Mare' | 'Horse',
      breeder: campaign.pedigree.breeder,
      microchip: campaign.pedigree.microchip,
      sire: campaign.pedigree.sire,
      dam: campaign.pedigree.dam,
    },
    trainer: {
      name: campaign.trainer.name,
      location: campaign.trainer.location,
      managerEntity: campaign.trainer.stable,
    },
    pricing,
    closeStyle: campaign.closeStyle,
    totalHorsePercentage: campaign.totalSyndicateStakePct,
    totalShares: Math.round(campaign.totalSyndicateStakePct),
    sharesAvailable: Math.round(campaign.capTableFixture.availablePct),
    pdsVersion: '1.0.0',
    saVersion: '1.0.0',
    effectiveDate: '2026-08-17',
  };

  let content: string;
  let filename: string;

  if (doc === 'pds') {
    content = generatePdsMarkdown(context);
    filename = `${slug}_product_disclosure_statement.md`;
  } else if (doc === 'sa') {
    content = generateSaMarkdown(context);
    filename = `${slug}_syndicate_agreement.md`;
  } else {
    content = generateTermSheetMarkdown(context);
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
