import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCampaignBySlug, getCampaignMedia, getCampaignPricing, isCheckoutOpen } from '@/lib/horses-data';
import { getTrainer } from '@evo/db_models';
import { getStableLinks } from '@/lib/stable-links';
import RightRail from '@/components/horse/right-rail';
import { MediaDeck } from '@/components/horse/media-deck';
import { StoryBlock } from '@/components/horse/story-block';
import { Tabs } from '@/components/horse/tabs';
import { OverviewTab } from '@/components/horse/overview-tab';
import { PedigreeTab } from '@/components/horse/pedigree-tab';
import { TrainerTab } from '@/components/horse/trainer-tab';
import { RaceTab } from '@/components/horse/race-tab';
import { DocumentsGate } from '@/components/horse/documents-gate';
import type {
  InventoryHorse,
  PedigreeLine,
  RaceLogEntry,
} from '@evo/db_models';

/**
 * Horse campaign page — founder-locked LEFT/RIGHT page model
 * (build-loop/page-model-notes.md):
 *   LEFT (⅔): media deck → story → tabs (overview | pedigree | trainer |
 *             race record | documents)
 *   RIGHT (⅓): sticky status-driven investment rail
 * Old /horses/[slug] file is untouched (CUT = hide, never delete); the route
 * redirects here via next.config.ts.
 */

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
  return {
    title: `${campaign.legalName} | Marketplace | Evolution Stables`,
    description: campaign.marketing.marketplaceHook,
  };
}

export default async function MarketplaceCampaignPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);
  if (!campaign) {
    notFound();
  }

  // The row is re-fetched for the 4-gen pedigree + race log (typed shapes).
  // getCampaignBySlug collapses pedigree into display fields; the tab needs
  // the raw jsonb lines. Same source table, one extra read is fine for RSC.
  const { getSupabaseServiceClient } = await import('@/lib/supabase-service');
  const supabase = getSupabaseServiceClient();
  const { data: rawRow } = await supabase.from('inventory').select('*').eq('slug', slug).single();
  const row = rawRow as InventoryHorse | null;
  const pedigreeData = parseJsonbField<Record<string, unknown>>(row?.pedigree_data) ?? {};

  // 4-gen pedigree lines + cross line (snake_case jsonb keys, chunk-5b types).
  const sireLine = (pedigreeData.sire_line ?? []) as PedigreeLine[];
  const damLine = (pedigreeData.dam_line ?? []) as PedigreeLine[];
  const crossLine = (pedigreeData.cross_line ?? null) as {
    sire_dam_sire?: string;
    sire_dam_dam?: string;
    dam_sire_sire?: string;
    dam_sire_dam?: string;
  } | null;
  const loveracingId =
    typeof pedigreeData.loverracing_id === 'number'
      ? pedigreeData.loverracing_id
      : typeof pedigreeData.loveracing_id === 'number'
        ? pedigreeData.loveracing_id
        : undefined;
  const breedingRecordUrl =
    typeof pedigreeData.stud_book_url === 'string' && pedigreeData.stud_book_url
      ? pedigreeData.stud_book_url
      : undefined;

  // Race log (chunk-5b): only first-gear/prudentia carry real data.
  const raceLog = (row as unknown as { race_log?: RaceLogEntry[] | null })?.race_log ?? undefined;

  // Media deck inputs (HORSE_STILLS: 01 = cover; video only when supplied).
  const media = getCampaignMedia(campaign.slug, campaign.trainer.slug);
  const gallery = media.horse.paradeGallery;

  // Trainer registry + Phase 1.5 stable links (render-only-existing rule).
  const trainerProfile = getTrainer(campaign.trainer.slug);
  const stableLinks = getStableLinks(campaign.trainer.slug);

  // Age computed from foaling date — never hardcoded.
  const age = campaign.pedigree.foalingDate
    ? String(new Date().getFullYear() - Number(campaign.pedigree.foalingDate.split('-')[0]))
    : undefined;

  // Story paragraphs: about_horse woven with trainer_bio (L2 layer).
  const storyParagraphs = [campaign.softLegal.aboutHorse, campaign.softLegal.trainerBio].filter(
    (p): p is string => Boolean(p && p.trim())
  );

  // Documents: compiled legal pack endpoints (PDS/SA live download routes).
  const pdsUrl = `/api/legal/download?slug=${encodeURIComponent(campaign.slug)}&doc=pds`;
  const saUrl = `/api/legal/download?slug=${encodeURIComponent(campaign.slug)}&doc=sa`;

  // NZTR profile URL from loveracing id (race tab external links).
  const nztrUrl = loveracingId
    ? `https://loveracing.nz/Common/SystemTemplates/Modal/EntryDetail.aspx?DisplayContext=Modal&HorseID=${loveracingId}`
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-12 pt-28 pb-8 md:px-16 lg:px-20 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12 items-start">
        {/* ── LEFT (⅔) — horse info, scrolls normally ─────────────────── */}
        <div className="min-w-0 space-y-8">
          <MediaDeck
            heroImage={media.horse.heroConformation}
            gallery={gallery}
            videoUrl={media.horse.trackworkVideo}
            sex={campaign.pedigree.gender}
            colour={campaign.pedigree.colour}
            sire={campaign.pedigree.sire}
            dam={campaign.pedigree.dam}
          />

          <StoryBlock
            legalName={campaign.legalName}
            barnName={campaign.barnName}
            status={campaign.listingStatus}
            storyParagraphs={storyParagraphs}
          />

          <Tabs
            overview={
              <OverviewTab
                highlights={campaign.marketing.highlights ?? []}
                racingOutlook={campaign.softLegal.racingOutlookAndPedigree}
              />
            }
            pedigree={
              <PedigreeTab
                subjectName={campaign.legalName}
                sireName={campaign.pedigree.sire}
                damName={campaign.pedigree.dam}
                sireLine={sireLine}
                damLine={damLine}
                crossLine={crossLine}
                sex={campaign.pedigree.gender}
                colour={campaign.pedigree.colour}
                age={age}
                foaled={campaign.pedigree.foalingDate}
                breedingRecordUrl={breedingRecordUrl}
              />
            }
            trainer={
              <TrainerTab
                trainerName={campaign.trainer.name}
                stableName={campaign.trainer.stable}
                location={campaign.trainer.location}
                philosophy={trainerProfile?.philosophy}
                bio={campaign.softLegal.trainerBio}
                contactName={trainerProfile?.name}
                website={stableLinks?.website}
                facebookUrl={stableLinks?.facebookUrl}
                instagramUrl={stableLinks?.instagramUrl}
                xUrl={stableLinks?.xUrl}
              />
            }
            raceRecord={
              <RaceTab
                horseName={campaign.legalName}
                raceLog={raceLog}
                status={campaign.listingStatus}
                breedingUrl={breedingRecordUrl}
                nztrUrl={nztrUrl}
              />
            }
            documents={
              <DocumentsGate
                horseSlug={campaign.slug}
                pdsUrl={pdsUrl}
                saUrl={saUrl}
              />
            }
          />
        </div>

        {/* ── RIGHT (⅓) — sticky investment rail ──────────────────────── */}
        <RightRail
          status={campaign.listingStatus}
          horseName={campaign.legalName}
          horseSlug={campaign.slug}
        />
      </div>
    </div>
  );
}