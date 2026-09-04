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
import { Eyebrow } from '@evo/ui';
import { CampaignStatusBadge } from '@/components/marketplace/campaign-status-badge';
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
      <main className="min-h-screen pb-24 pt-32">
        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-12">
          {/* Breadcrumb */}
          <div className="mb-10 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
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

          <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-[2fr_1fr]">
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
                  <CampaignStatusBadge status={campaign.listingStatus} />
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

            {/* RIGHT COLUMN — RightRail's <aside lg:fixed> is the direct grid child; fixed (not sticky)
            so it never releases at the footer — stays pinned under the nav for the whole document.
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
                  legalPack={{
                    pdsMarkdown: legalPack.pdsMarkdown,
                    saMarkdown: legalPack.saMarkdown,
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
