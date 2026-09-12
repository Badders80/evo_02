import {
  computeDslPricing,
  monthsBetween,
  type DslPricing,
  compileLegalPack,
  type CompiledLegalPack,
  type HorseSoftLegalContent,
  type HorseMarketingContent,
} from '@evo/legal_engine';
import {
  getSire,
  getTrainer,
  type ListingStatus,
  type DslDocStatus,
} from '@evo/db_models';
import { getHorseCdnUrls, getTrainerCdnUrls } from '@evo/storage/cdn';
import { getHorseMediaWithFallback } from './media-fallback';
import { getSupabaseServiceClient } from './supabase-service';
import type { InventoryHorse } from '@evo/db_models';

export interface HorseCampaign {
  slug: string;
  legalName: string;
  barnName?: string;
  wholesaleMonthlyNzd: number;
  totalSyndicateStakePct: number;
  minStakePct: number;
  stakeStepPct: number;
  softLegal: HorseSoftLegalContent;
  marketing: HorseMarketingContent;
  listingStatus: ListingStatus;
  /** Legal-lock docs (00012/00013): all three must be 'approved' before the horse
   * can be purchased — app-layer mirror of the DB legal-lock trigger. Optional in
   * the type only so non-DB constructors (test fixtures) compile; rowToCampaign
   * always maps them (columns are NOT NULL DEFAULT 'draft'). */
  termSheetStatus?: DslDocStatus;
  pdsStatus?: DslDocStatus;
  saStatus?: DslDocStatus;
  owner: {
    entity: string;
    contact: string;
  };
  trainer: {
    name: string;
    stable: string;
    location: string;
    slug: string;
  };
  pedigree: {
    sire: string;
    dam: string;
    damSire: string;
    lineageSummary: string;
    foalingDate: string;
    gender: string;
    colour: string;
    breeder: string;
    microchip: string;
    lifeNumber: string;
    studBookUrl: string;
  };
  capTableFixture: {
    retainedPct: number;
    allocatedPct: number;
    reservedPct: number;
    availablePct: number;
    totalInvestors: number;
  };
  closeStyle: 'fourteen_day' | 'three_x_remaining';
  listingPlatform?: string;
  paymentModel?: 'subscription_float' | 'upfront';
  termStartDate?: string;
  termEndDate?: string;
  distributionSplit?: string;
  distributionSchedule?: string;
}

/**
 * 3-Tier Thoroughbred Naming Standard Formatter.
 * Formats official name with optional yard barn name.
 */
export function formatHorseDisplayName(
  horse: { legalName: string; barnName?: string },
  options: { includeBarnName?: boolean } = { includeBarnName: true }
): string {
  // A barn name that equals the legal name (or legal name minus its " (NZ)"-style
  // country suffix) is not a nickname — displaying it would duplicate the name.
  const legalBare = horse.legalName.replace(/\s*\([A-Z]{2,3}\)\s*$/, '').trim();
  const isSame =
    !horse.barnName ||
    horse.barnName.toLowerCase() === horse.legalName.toLowerCase() ||
    horse.barnName.toLowerCase() === legalBare.toLowerCase();
  if (!horse.barnName || !options.includeBarnName || isSame) {
    return horse.legalName;
  }
  return `${horse.legalName} (${horse.barnName})`;
}

/**
 * First sentence of a text block (fallback source for the marketplace card hook).
 * A sentence ends at the first `.`, `!`, or `?` followed by whitespace or end of input.
 * Never returns more than the first sentence — the card must not dump the full story.
 */
export function firstSentence(text: string): string {
  const t = text.trim();
  if (!t) return '';
  const match = t.match(/^.*?[.!?](?:\s|$)/);
  return (match?.[0] ?? t).trim();
}

/**
 * L1 marketplace hook (locked 2026-08-31): use marketing.marketplaceHook when present;
 * otherwise fall back to the FIRST SENTENCE of soft_legal.aboutHorse; otherwise ''.
 * The card renders name + tags regardless — the hook is never a full story dump.
 */
export function getMarketplaceHook(campaign: {
  marketing: { marketplaceHook: string };
  softLegal: { aboutHorse: string };
}): string {
  const hook = campaign.marketing.marketplaceHook.trim();
  if (hook) return hook;
  return firstSentence(campaign.softLegal.aboutHorse);
}

export function isCheckoutOpen(campaign: Pick<HorseCampaign, 'listingStatus'>): boolean {
  return campaign.listingStatus === 'listed';
}

/**
 * Legal-lock rule (00013, founder 2026-09-09): a horse is only buyable once its
 * term sheet, PDS and SA are ALL 'approved'. Pure predicate mirroring the DB
 * trigger so the app never relies on the DB alone (defense-in-depth); a missing
 * or non-approved status is never 'approved' — fail closed.
 */
export function areLegalDocsApproved(
  campaign: Pick<HorseCampaign, 'termSheetStatus' | 'pdsStatus' | 'saStatus'>
): boolean {
  return (
    campaign.termSheetStatus === 'approved' &&
    campaign.pdsStatus === 'approved' &&
    campaign.saStatus === 'approved'
  );
}

function parseJsonb<T>(value: unknown): T | null {
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

function resolveTrainerSlug(trainerName: string): string {
  const normalized = trainerName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (normalized.includes('barbara') || normalized.includes('kennedy')) return 'barbara-kennedy';
  if (normalized.includes('stephen') && normalized.includes('gray')) return 'stephen-gray';
  if (normalized.includes('lance') || normalized.includes('osullivan') || normalized.includes('wexford'))
    return 'lance-osullivan';
  return normalized || 'unknown';
}

function resolveTrainer(trainerName: string, trainerLocation: string): HorseCampaign['trainer'] {
  const slug = resolveTrainerSlug(trainerName);
  const profile = getTrainer(slug);
  const stable = profile?.stableName ?? trainerName;
  const location = profile?.location ?? trainerLocation;
  return { name: trainerName, stable, location, slug };
}

/**
 * Owner resolution (007 T6): owner entities live in the `owners` table and are
 * linked to inventory via owner_id (migration 00009). Fetched once per query
 * as a slug→owner map (no N+1); a missing linkage falls back to the canonical
 * lessor of last resort (Evolution Stables) rather than failing the row.
 */
const EVOLUTION_OWNER = { entity: 'Evolution Stables', contact: 'Evolution Stables' } as const;

async function fetchOwnerMap(): Promise<Map<string, { entity: string; contact: string }>> {
  const admin = getSupabaseServiceClient();
  const { data } = await admin.from('inventory').select('slug, owners(entity, contact)');
  const map = new Map<string, { entity: string; contact: string }>();
  for (const row of (data ?? []) as Array<{ slug: string; owners?: { entity: string; contact: string } }>) {
    if (row.owners) {
      map.set(row.slug, row.owners);
    }
  }
  return map;
}

function statusToListingStatus(status: string): ListingStatus {
  switch (status) {
    case 'listed':
      return 'listed';
    case 'coming_soon':
    case 'coming_soon_details':
      return 'coming_soon';
    case 'fully_subscribed':
      return 'fully_subscribed';
    case 'completed':
      return 'completed';
    default:
      return 'coming_soon';
  }
}

function rowToCampaign(
  row: InventoryHorse,
  ownerMap: Map<string, { entity: string; contact: string }>
): HorseCampaign {
  const pedigreeData = parseJsonb<Record<string, unknown>>(row.pedigree_data) ?? {};
  // Raw jsonb maps — typed as plain records so both camelCase (canonical) and legacy
  // snake_case keys are readable at runtime (dual-shape read, locked 2026-08-31).
  const softLegal = parseJsonb<Record<string, unknown>>(row.soft_legal) ?? {};
  const marketing = parseJsonb<Record<string, unknown>>(row.marketing) ?? {};

  const trainer = resolveTrainer(row.trainer_name, row.trainer_location);
  const owner = ownerMap.get(row.slug) ?? EVOLUTION_OWNER;

  const listedStakePct = Number(row.listed_stake_pct);
  const sharesAvailable = Number(row.shares_available);
  const reservedShares = Number(row.reserved_shares);
  const stakeStepPct = Number(row.stake_step_pct);

  const availablePct = sharesAvailable * stakeStepPct;
  const allocatedPct = Math.max(0, listedStakePct - availablePct);
  const reservedPct = reservedShares * stakeStepPct;
  const retainedPct = Math.max(0, 100 - allocatedPct - reservedPct - availablePct);

  // Sold-out guard (f5, audit 2026-09-03): a listed campaign with zero available
  // stake must render as fully_subscribed — never buyable. Root-cause at the data
  // layer so no call site can fall back to a buyable max.
  const listingStatus: ListingStatus =
    availablePct <= 0 && statusToListingStatus(row.status) === 'listed'
      ? 'fully_subscribed'
      : statusToListingStatus(row.status);

  const totalInvestors = Math.round(allocatedPct / Math.max(stakeStepPct, 0.01));

  const sire = String(pedigreeData.sire ?? row.sire ?? '');
  const dam = String(pedigreeData.dam ?? row.dam ?? '');
  const damSire = String(pedigreeData.damSire ?? pedigreeData.dam_sire ?? '');
  const lineageSummary = String(pedigreeData.lineageSummary ?? pedigreeData.lineage_summary ?? '');
  const foalingDate = String(pedigreeData.foalingDate ?? pedigreeData.foaling_date ?? '');
  const gender = String(pedigreeData.gender ?? '');
  const colour = String(pedigreeData.colour ?? '');
  const breeder = String(pedigreeData.breeder ?? '');
  const microchip = String(pedigreeData.microchip ?? '');
  const lifeNumber = String(pedigreeData.lifeNumber ?? '');
  const studBookUrl = String(pedigreeData.studBookUrl ?? pedigreeData.stud_book_url ?? '');

  const campaign: HorseCampaign = {
    slug: row.slug,
    legalName: row.legal_name,
    // founder: Manolo's barn_name='Manolo' is a derived non-nickname, not a real yard name.
    // Suppress at the data layer so formatHorseDisplayName shows only the legal name.
    barnName: row.slug === 'i-stole-a-manolo' ? undefined : (row.barn_name || undefined),
    wholesaleMonthlyNzd: Number(row.cost_monthly_nzd),
    totalSyndicateStakePct: listedStakePct,
    minStakePct: Number(row.min_stake_pct ?? 1.0),
    stakeStepPct,
    softLegal: {
      // Dual-shape read (locked 2026-08-31): canonical camelCase, backward-compatible
      // snake_case fallback for rows written before the writer was canonicalized.
      aboutHorse: String(softLegal.aboutHorse ?? softLegal.about_horse ?? ''),
      trainerBio: String(softLegal.trainerBio ?? softLegal.trainer_bio ?? ''),
      racingOutlookAndPedigree: String(
        softLegal.racingOutlookAndPedigree ?? softLegal.racing_outlook_and_pedigree ?? ''
      ),
      raceExpectation: String(softLegal.raceExpectation ?? softLegal.race_expectation ?? ''),
      campaignNarrative: String(
        softLegal.campaignNarrative ?? softLegal.campaign_narrative ?? ''
      ),
      trainerQuote: String(softLegal.trainerQuote ?? softLegal.trainer_quote ?? ''),
      nextUp: String(softLegal.nextUp ?? softLegal.next_up ?? ''),
      latestUpdateUrl: String(
        softLegal.latestUpdateUrl ?? softLegal.latest_update_url ?? ''
      ),
      updateCount: Number(softLegal.updateCount ?? softLegal.update_count ?? 0),
    },
    marketing: {
      marketplaceHook: String(marketing.marketplaceHook ?? marketing.marketplace_hook ?? ''),
      highlightTags: Array.isArray(marketing.highlightTags)
        ? (marketing.highlightTags as string[])
        : Array.isArray(marketing.highlight_tags)
          ? (marketing.highlight_tags as string[])
          : [],
      highlights: Array.isArray(marketing.highlights)
        ? (marketing.highlights as string[])
        : undefined,
    },
    listingStatus,
    termSheetStatus: row.term_sheet_status,
    pdsStatus: row.pds_status,
    saStatus: row.sa_status,
    owner,
    trainer,
    pedigree: {
      sire,
      dam,
      damSire,
      lineageSummary,
      foalingDate,
      gender,
      colour,
      breeder,
      microchip,
      lifeNumber,
      studBookUrl,
    },
    capTableFixture: {
      retainedPct,
      allocatedPct,
      reservedPct,
      availablePct,
      totalInvestors,
    },
    closeStyle: row.close_style as 'fourteen_day' | 'three_x_remaining',
    listingPlatform: row.listing_platform,
    paymentModel: row.payment_style as 'subscription_float' | 'upfront',
    termStartDate: row.term_start_date ?? undefined,
    termEndDate: row.term_end_date ?? undefined,
    distributionSplit: row.distribution_split ?? undefined,
    distributionSchedule: row.distribution_schedule ?? undefined,
  };

  // Sire sanity: enrich empty pedigree fields from registry when possible.
  const sireProfile = getSire(sire);
  if (sireProfile) {
    if (!campaign.pedigree.lineageSummary) {
      campaign.pedigree.lineageSummary = `By ${sireProfile.name} (${sireProfile.country}).`;
    }
  }

  return campaign;
}

export async function getAllCampaigns(): Promise<HorseCampaign[]> {
  const supabase = getSupabaseServiceClient();
  const { data: rows, error } = await supabase.from('inventory').select('*').order('slug');
  if (error) {
    throw new Error(`Failed to load campaigns: ${error.message}`);
  }
  const ownerMap = await fetchOwnerMap();
  return (rows ?? []).map((row) => rowToCampaign(row, ownerMap));
}

export async function getCampaignBySlug(slug: string): Promise<HorseCampaign | null> {
  const supabase = getSupabaseServiceClient();
  const { data: row, error } = await supabase.from('inventory').select('*').eq('slug', slug).single();
  if (error || !row) {
    if (error?.code === 'PGRST116') return null;
    throw new Error(`Failed to load campaign ${slug}: ${error?.message ?? 'not found'}`);
  }
  const ownerMap = await fetchOwnerMap();
  return rowToCampaign(row, ownerMap);
}

/**
 * Calculates live pricing for a campaign using @evo/legal_engine SSOT.
 */
export function getCampaignPricing(campaign: HorseCampaign, stakePct = 1.0): DslPricing {
  return computeDslPricing(campaign.wholesaleMonthlyNzd, stakePct);
}

/**
 * Resolves all media CDN links for a campaign.
 */
export function getCampaignMedia(slug: string, trainerSlug: string) {
  const horseUrls = getHorseCdnUrls(slug);
  const fallbackMedia = getHorseMediaWithFallback(slug);
  return {
    horse: {
      ...horseUrls,
      heroConformation: horseUrls.heroConformation || fallbackMedia.heroConformation,
    },
    trainer: getTrainerCdnUrls(trainerSlug),
  };
}

/**
 * Compiles the legal pack dynamically via @evo/legal_engine and computes verified SHA-256 digests.
 * stakePct defaults to 1.0 — the PDS + term sheet are locked offer docs compiled at the
 * default (identical for every investor); the SA is investor-specific and compiled with the
 * investor's chosen stake. The merged pack keeps PDS/TS hashes constant and varies only the SA.
 * execution (Task 4): the SA Execution block carries the investor's name + tick date — a valid
 * NZTR pro-forma execution. Only set when the investor is authenticated.
 */
export function getCompiledLegalPackForCampaign(
  campaign: HorseCampaign,
  stakePct = 1.0,
  execution?: { investorName?: string; executionDate?: string }
): CompiledLegalPack {
  // Term months are derived from the stored dates (inventory has no term_months
  // column); both PDS §3 and SA clause 5 read context.termMonths, and a blank is
  // rendered when the dates are missing — never an invented term.
  const termMonths = monthsBetween(campaign.termStartDate, campaign.termEndDate) ?? undefined;

  // Locked share math: a leasehold offered in stake-step increments is counted in
  // those increments (5% offered in 0.5% steps = 10 shares of 0.5% each). The SA
  // sentence multiplies shares × step, so the count must come from the same math.
  const shareCount =
    campaign.stakeStepPct > 0
      ? Math.round(campaign.totalSyndicateStakePct / campaign.stakeStepPct)
      : Math.round(campaign.totalSyndicateStakePct);

  const buildContext = (pricing: DslPricing) => ({
    syndicateName: `${campaign.legalName} Syndicate`,
    campaignSlug: campaign.slug,
    ownerName: campaign.owner.entity,
    horse: {
      legalName: campaign.legalName,
      barnName: campaign.barnName ?? campaign.legalName,
      foalingYear: campaign.pedigree.foalingDate ? parseInt(campaign.pedigree.foalingDate.split('-')[0], 10) : 0,
      foalingDate: campaign.pedigree.foalingDate || undefined,
      gender: campaign.pedigree.gender as 'Colt' | 'Filly' | 'Gelding' | 'Mare' | 'Horse',
      breeder: campaign.pedigree.breeder,
      microchip: campaign.pedigree.microchip,
      sire: campaign.pedigree.sire,
      dam: campaign.pedigree.dam,
    },
    trainer: {
      name: campaign.trainer.name,
      location: campaign.trainer.location,
      // Manager is Evolution Stables (locked: Evolution is the syndicate manager,
      // never an owner row). The trainer's stable is NOT the manager.
      managerEntity: 'Evolution Stables',
    },
    pricing,
    closeStyle: campaign.closeStyle,
    totalHorsePercentage: campaign.totalSyndicateStakePct,
    totalShares: shareCount,
    sharesAvailable: Math.round(campaign.capTableFixture.availablePct),
    paymentModel: campaign.paymentModel,
    termMonths,
    minInvestmentPct: campaign.minStakePct,
    stakeStepPct: campaign.stakeStepPct,
    termStartDate: campaign.termStartDate,
    termEndDate: campaign.termEndDate,
    distributionSplit: campaign.distributionSplit,
    distributionSchedule: campaign.distributionSchedule,
    pdsVersion: '1.0.0',
    saVersion: '1.0.0',
    effectiveDate: campaign.termStartDate,
    investorName: execution?.investorName,
    executionDate: execution?.executionDate,
    softLegal: campaign.softLegal,
    marketing: campaign.marketing,
    listingPlatform: campaign.listingPlatform,
  });

  // Locked docs (PDS + term sheet) always compile at the default 1.0% — identical for every investor.
  const lockedPricing = computeDslPricing(campaign.wholesaleMonthlyNzd, 1.0);
  const { pack: lockedPack } = compileLegalPack(buildContext(lockedPricing), { skipValidation: true });

  // Default stake → the locked pack IS the pack (fast path, 8 existing callers unaffected).
  if (stakePct === 1.0) return lockedPack;

  // Investor-specific SA: recompile with the investor's stake, keep PDS/TS locked.
  const saPricing = computeDslPricing(campaign.wholesaleMonthlyNzd, stakePct);
  const { pack: saPack } = compileLegalPack(buildContext(saPricing), { skipValidation: true });

  return {
    ...lockedPack,
    saMarkdown: saPack.saMarkdown,
    saHash: saPack.saHash,
  };
}
