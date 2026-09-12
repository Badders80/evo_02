import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import {
  formatHorseDisplayName,
  getCampaignBySlug,
  getCampaignMedia,
  getMarketplaceHook,
  getCompiledLegalPackForCampaign,
} from '@/lib/horses-data';
import { campaignShareMetadata, SITE_DESCRIPTION } from '@/lib/seo';
import { getTrainer } from '@evo/db_models';
import { getStableLinks } from '@/lib/stable-links';
import { getSupabaseServiceClient } from '@/lib/supabase-service';
import { Eyebrow, StatusPill } from '@evo/ui';
import { CollapsiblePageIntro } from '@/components/marketplace/collapsible-page-intro';
import { DetailTabs } from '@/components/marketplace/detail-tabs';
import { HorsePageShell } from '@/components/marketplace/horse-page-shell';
import { DocumentsGate } from '@/components/horse/documents-gate';
import { CampaignStatusBlock } from '@/components/horse/campaign-status-block';
import { MediaDeck } from '@/components/horse/media-deck';
import type { InventoryHorse, RaceLogEntry } from '@evo/db_models';

function parseJsonbField<T>(value: unknown): T | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  return value as T;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);
  if (!campaign) {
    notFound();
  }
  const title = formatHorseDisplayName(campaign, { includeBarnName: false });
  const description = getMarketplaceHook(campaign) || SITE_DESCRIPTION;
  const shareMeta = campaignShareMetadata(
    campaign,
    `/marketplace/${slug}`,
    `${title} | Evolution Stables`
  );
  return {
    title: `${title} | Marketplace | Evolution Stables`,
    description,
    alternates: { ...shareMeta.alternates, canonical: `/marketplace/${slug}` },
    openGraph: {
      ...shareMeta.openGraph,
      description: shareMeta.openGraph?.description || description,
    },
    twitter: {
      ...shareMeta.twitter,
      description: shareMeta.twitter?.description || description,
    },
  };
}

export default async function MarketplaceCampaignPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);
  if (!campaign) {
    notFound();
  }

  const { data: rawRow } = await getSupabaseServiceClient()
    .from('inventory')
    .select('*')
    .eq('slug', slug)
    .single();
  const row = rawRow as InventoryHorse | null;
  const pedigreeData = parseJsonbField<Record<string, unknown>>(row?.pedigree_data) ?? {};
  const raceLog = (row as unknown as { race_log?: RaceLogEntry[] | null })?.race_log ?? undefined;

  const breedingRecordUrl =
    typeof pedigreeData.stud_book_url === 'string' && pedigreeData.stud_book_url
      ? pedigreeData.stud_book_url
      : campaign.pedigree.studBookUrl || undefined;

  const media = getCampaignMedia(campaign.slug, campaign.trainer.slug);
  const heroImage = media.horse.heroConformation;
  const videoUrl = media.horse.trackworkVideo;
  const gallery = media.horse.paradeGallery ?? [];

  const trainerProfile = getTrainer(campaign.trainer.slug);
  const stableLinks = getStableLinks(campaign.trainer.slug);

  const displayName = formatHorseDisplayName(campaign, { includeBarnName: false });
  const age = campaign.pedigree.foalingDate
    ? new Date().getFullYear() - Number(campaign.pedigree.foalingDate.split('-')[0])
    : undefined;

  const story = campaign.softLegal.aboutHorse;
  const overviewBody = campaign.softLegal.racingOutlookAndPedigree;

  const pdsUrl = `/api/legal/download?slug=${encodeURIComponent(campaign.slug)}&doc=pds`;
  const saUrl = `/api/legal/download?slug=${encodeURIComponent(campaign.slug)}&doc=sa`;

  return (
    <div className="min-h-screen bg-canvas font-sans selection:bg-accent selection:text-black">
      <main className="min-h-screen pb-24">
        {/* One-time intro (founder 2026-09-12): collapses on scroll-past,
            breadcrumb becomes the top. Resets only on route change. */}
        <CollapsiblePageIntro>
          <div id="page-intro" className="mx-auto max-w-6xl px-12 pt-32 md:px-16 lg:px-20">
          <p className="text-[11px] font-light uppercase tracking-[0.2em] text-muted-foreground">
            Evolution Stables
          </p>
          <h1 className="mt-4 text-[36px] font-light tracking-[-0.04em] text-heading md:text-[64px] leading-[1.05]">
            Ownership,
            <br />
            evolved.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] font-light leading-[1.7] text-muted-foreground">
            Browse active offerings, coming-soon offerings, and completed track record. For a deeper
            dive into our ownership model, read the{' '}
            <a
              href="/marketplace#ownership-faq"
              className="text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:text-heading"
            >
              Ownership FAQ
            </a>{' '}
            below.
          </p>
          </div>
        </CollapsiblePageIntro>
        <div className="mx-auto mt-16 max-w-6xl px-6 sm:px-10 lg:px-12">
          {/* Breadcrumb — 'new top' once the intro collapses. Founder 2026-09-12:
              generous margin below the collapsed intro (PT-14 ≈ the intro's own
              bottom rhythm); doubles as breathing room when intro is visible. */}
          <div className="mb-10 flex items-center justify-between pt-10 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <div className="flex items-center gap-2">
              <Link
                href="/marketplace"
                className="transition duration-300 hover:text-frost"
              >
                Marketplace
              </Link>
              <span>/</span>
              <span className="text-foreground">{displayName}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-[2fr_1fr]">
            {/* LEFT COLUMN */}
            <div className="space-y-12">
              {/* MediaDeck — hero + spec strip + thumbnail carousel (video-ready) */}
              <MediaDeck
                heroImage={heroImage}
                gallery={gallery}
                videoUrl={videoUrl}
                age={age}
                sex={campaign.pedigree.gender}
                colour={campaign.pedigree.colour}
                sire={campaign.pedigree.sire}
                dam={campaign.pedigree.dam}
              />

              {/* THE STORY */}
              <section className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Eyebrow className="text-muted-foreground">The story</Eyebrow>
                  <StatusPill status={campaign.listingStatus} />
                  <Link
                    href="/marketplace"
                    className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-accent transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back to Marketplace</span>
                  </Link>
                </div>
                <h1 className="text-[24px] font-light leading-tight tracking-tight text-heading">
                  {displayName}
                </h1>
                <div className="space-y-4 text-[14px] font-light leading-[1.85] text-foreground">
                  {story ? (
                    story.split('\n\n').filter(Boolean).map((para, idx) => (
                      <p key={`story-${idx}-${para.slice(0, 12)}`}>{para}</p>
                    ))
                  ) : (
                    <p>—</p>
                  )}
                </div>
              </section>

              {/* Campaign Status Block — what's-next, investor update link + count, trainer quote */}
              <CampaignStatusBlock
                nextUp={campaign.softLegal.nextUp}
                latestUpdateUrl={campaign.softLegal.latestUpdateUrl}
                updateCount={campaign.softLegal.updateCount}
                trainerQuote={campaign.softLegal.trainerQuote}
              />
              {/* Detail Tabs */}
              <DetailTabs
                horseName={campaign.legalName}
                sireName={campaign.pedigree.sire}
                damName={campaign.pedigree.dam}
                damSireName={campaign.pedigree.damSire}
                sex={campaign.pedigree.gender}
                colour={campaign.pedigree.colour}
                age={age}
                breedingUrl={breedingRecordUrl}
                trainer={{
                  name: campaign.trainer.name,
                  stable_name: campaign.trainer.stable,
                  contact_name: trainerProfile?.name,
                  location: campaign.trainer.location,
                  bio: trainerProfile?.bio ?? trainerProfile?.philosophy,
                  website: stableLinks?.website,
                  people: [],
                }}
                foalingDate={campaign.pedigree.foalingDate}
                pedigreeData={pedigreeData}
                story={overviewBody}
                raceLog={raceLog}
                trainerBio={campaign.softLegal.trainerBio}
                horseSlug={campaign.slug}
              documentsPanel={
                  <DocumentsGate
                    horseSlug={campaign.slug}
                    pdsUrl={pdsUrl}
                    saUrl={saUrl}
                  />
                }
              />
            </div>

            {/* RIGHT COLUMN — RightRail's <aside> is the direct grid child; sticky
            (not fixed): travels level with the image, pins under the nav once
            scrolled to, releases at the grid end.
            F8: modal is page-level via HorsePageShell, reachable from any CTA via ?open=1&units=X. */}
            {(() => {
              const legalPack = getCompiledLegalPackForCampaign(campaign);
              return (
                <HorsePageShell
                  listingStatus={
                    (campaign.listingStatus === 'listed' ||
                      campaign.listingStatus === 'fully_subscribed' ||
                      campaign.listingStatus === 'coming_soon' ||
                      campaign.listingStatus === 'completed')
                      ? campaign.listingStatus
                      : 'coming_soon'
                  }
                  horseName={campaign.legalName}
                  horseSlug={campaign.slug}
                  wholesaleMonthlyNzd={campaign.wholesaleMonthlyNzd}
                  minInvestmentPct={campaign.minStakePct}
                  maxInvestmentPct={campaign.capTableFixture.availablePct > 0 ? campaign.capTableFixture.availablePct : 10.0}
                  stakeStepPct={campaign.stakeStepPct || 0.5}
                  termStartDate={campaign.termStartDate}
                  termEndDate={campaign.termEndDate}
                  distributionSplit={campaign.distributionSplit}
                  legalPack={{
                    termSheetMarkdown: legalPack.termSheetMarkdown,
                    pdsMarkdown: legalPack.pdsMarkdown,
                    saMarkdown: legalPack.saMarkdown,
                    termSheetHash: legalPack.termSheetHash,
                    pdsHash: legalPack.pdsHash,
                    saHash: legalPack.saHash,
                  }}
                />
              );
            })()}
          </div>
        </div>
      </main>
    </div>
  );
}
