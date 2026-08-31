import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import fs from 'fs';
import path from 'path';
import {
  formatHorseDisplayName,
  getCampaignBySlug,
  getCampaignMedia,
  getMarketplaceHook,
} from '@/lib/horses-data';
import { campaignShareMetadata, SITE_DESCRIPTION } from '@/lib/seo';
import { getTrainer } from '@evo/db_models';
import { getStableLinks } from '@/lib/stable-links';
import { getSupabaseServiceClient } from '@/lib/supabase-service';
import { CampaignStatusBadge } from '@/components/marketplace/campaign-status-badge';
import { DetailTabs } from '@/components/marketplace/detail-tabs';
import RightRail from '@/components/horse/right-rail';
import { DocumentsGate } from '@/components/horse/documents-gate';
import { CampaignStatusBlock } from '@/components/horse/campaign-status-block';
import type {
  InventoryHorse,
  PedigreeLine,
  RaceLogEntry,
} from '@evo/db_models';

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

function getGalleryImages(slug: string, coverUrl?: string): string[] {
  const dir = path.join(process.cwd(), 'public', 'images', 'content', 'horses', slug);
  if (!fs.existsSync(dir)) return [];
  const validExts = ['.png', '.jpg', '.jpeg', '.webp', '.avif'];
  const coverBasename = coverUrl ? path.basename(coverUrl) : null;
  return fs
    .readdirSync(dir)
    .filter((f) => validExts.includes(path.extname(f).toLowerCase()))
    .filter((f) => f !== coverBasename)
    .sort()
    .map((f) => `/images/content/horses/${slug}/${f}`)
    .slice(0, 6);
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
  const gallery = getGalleryImages(slug, heroImage);

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
      <main className="dot-grid-surface min-h-screen pb-24 pt-32">
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
            <Link
              href="/marketplace"
              className="normal-case tracking-normal text-[12px] font-medium text-accent transition duration-300 hover:text-frost"
            >
              ← Back to Marketplace
            </Link>
          </div>

          <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-[2fr_1fr]">
            {/* LEFT COLUMN */}
            <div className="space-y-12">
              {/* Cover media */}
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-surface-base">
                {heroImage ? (
                  <>
                    <Image
                      src={heroImage}
                      alt={displayName}
                      fill
                      className="object-contain"
                      priority
                      sizes="(max-width: 1024px) 100vw, 60vw"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-xs font-light text-muted-foreground">
                    Photo incoming
                  </div>
                )}
              </div>

              {/* Spec strip */}
              <div className="grid grid-cols-2 gap-6 rounded-2xl border border-border bg-surface-base p-6 md:grid-cols-[1fr_1fr_1.4fr_1.4fr]">
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Sex</p>
                  <p className="text-[14px] font-medium capitalize text-pure-white">{campaign.pedigree.gender || '—'}</p>
                </div>
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Colour</p>
                  <p className="text-[14px] font-medium text-pure-white">{campaign.pedigree.colour || '—'}</p>
                </div>
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Sire</p>
                  <p className="truncate text-[14px] font-medium text-pure-white" title={campaign.pedigree.sire}>
                    {campaign.pedigree.sire || '—'}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Dam</p>
                  <p className="truncate text-[14px] font-medium text-pure-white" title={campaign.pedigree.dam}>
                    {campaign.pedigree.dam || '—'}</p>
                </div>
              </div>

              {/* Gallery */}
              {gallery.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {gallery.map((src, i) => (
                    <div
                      key={src}
                      className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-surface-base"
                    >
                      <Image
                        src={src}
                        alt={`${displayName} — photo ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 33vw, 20vw"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* THE STORY */}
              <section className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    The story
                  </p>
                  <CampaignStatusBadge status={campaign.listingStatus} />
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

            {/* RIGHT COLUMN */}
            <div className="space-y-8 lg:sticky lg:top-28">
              <RightRail
                status={campaign.listingStatus}
                horseName={campaign.legalName}
                horseSlug={campaign.slug}
                wholesaleMonthlyNzd={campaign.wholesaleMonthlyNzd}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
