import {
  computeDslPricing,
  type DslPricing,
  compileLegalPack,
  type CompiledLegalPack,
  type HorseSoftLegalContent,
  type HorseMarketingContent,
} from '@evo/legal_engine';
import {
  getSire,
  getTrainer,
  ownerDisplayName,
  type ListingStatus,
} from '@evo/db_models';
import { getHorseCdnUrls, getTrainerCdnUrls } from '@evo/storage/cdn';
import { getSupabaseServiceClient } from './supabase-service';
import type { InventoryHorse } from '@evo/db_models';

export interface HorseCampaign {
  slug: string;
  legalName: string;
  barnName?: string;
  wholesaleMonthlyNzd: number;
  totalSyndicateStakePct: number;
  softLegal: HorseSoftLegalContent;
  marketing: HorseMarketingContent;
  listingStatus: ListingStatus;
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
  listingPlatform?: 'evolution' | 'tokinvest' | string;
}

/**
 * 3-Tier Thoroughbred Naming Standard Formatter.
 * Formats official name with optional yard barn name.
 */
export function formatHorseDisplayName(
  horse: { legalName: string; barnName?: string },
  options: { includeBarnName?: boolean } = { includeBarnName: true }
): string {
  if (!horse.barnName || !options.includeBarnName || horse.barnName.toLowerCase() === horse.legalName.toLowerCase()) {
    return horse.legalName;
  }
  return `${horse.legalName} (${horse.barnName})`;
}

export function isCheckoutOpen(campaign: HorseCampaign): boolean {
  return campaign.listingStatus === 'listed';
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

function resolveOwner(slug: string): { entity: string; contact: string } {
  switch (slug) {
    case 'first-gear':
    case 'tml-x-yearn':
      return { entity: 'Stephen Gray Racing', contact: 'Stephen Gray' };
    case 'nellie':
    case 'prudentia':
    case 'hottathanafantasy':
    case 'i-stole-a-manolo':
      return { entity: 'B.A.X Bloodstock', contact: 'Kylie Bax' };
    default:
      return { entity: 'Evolution Stables', contact: 'Evolution Stables' };
  }
}

function resolveTrainer(trainerName: string, trainerLocation: string): HorseCampaign['trainer'] {
  const slug = resolveTrainerSlug(trainerName);
  const profile = getTrainer(slug);
  const stable = profile?.stableName ?? trainerName;
  const location = profile?.location ?? trainerLocation;
  return { name: trainerName, stable, location, slug };
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

function rowToCampaign(row: InventoryHorse): HorseCampaign {
  const pedigreeData = parseJsonb<Record<string, unknown>>(row.pedigree_data) ?? {};
  const softLegal = parseJsonb<Partial<HorseSoftLegalContent>>(row.soft_legal) ?? {};
  const marketing = parseJsonb<Partial<HorseMarketingContent>>(row.marketing) ?? {};

  const trainer = resolveTrainer(row.trainer_name, row.trainer_location);
  const owner = resolveOwner(row.slug);

  const listedStakePct = Number(row.listed_stake_pct);
  const totalShares = Number(row.total_shares);
  const sharesAvailable = Number(row.shares_available);
  const reservedShares = Number(row.reserved_shares);
  const stakeStepPct = Number(row.stake_step_pct);

  const availablePct = sharesAvailable * stakeStepPct;
  const allocatedPct = Math.max(0, listedStakePct - availablePct);
  const reservedPct = reservedShares * stakeStepPct;
  const retainedPct = Math.max(0, 100 - allocatedPct - reservedPct - availablePct);

  const totalInvestors = Math.round(allocatedPct / Math.max(stakeStepPct, 0.01));

  const sire = String(pedigreeData.sire ?? row.sire ?? '');
  const dam = String(pedigreeData.dam ?? row.dam ?? '');
  const damSire = String(pedigreeData.damSire ?? '');
  const lineageSummary = String(pedigreeData.lineageSummary ?? '');
  const foalingDate = String(pedigreeData.foalingDate ?? '');
  const gender = String(pedigreeData.gender ?? '');
  const colour = String(pedigreeData.colour ?? '');
  const breeder = String(pedigreeData.breeder ?? '');
  const microchip = String(pedigreeData.microchip ?? '');
  const lifeNumber = String(pedigreeData.lifeNumber ?? '');
  const studBookUrl = String(pedigreeData.studBookUrl ?? '');

  const campaign: HorseCampaign = {
    slug: row.slug,
    legalName: row.legal_name,
    barnName: row.barn_name || undefined,
    wholesaleMonthlyNzd: Number(row.cost_monthly_nzd),
    totalSyndicateStakePct: listedStakePct,
    softLegal: {
      aboutHorse: softLegal.aboutHorse ?? '',
      trainerBio: softLegal.trainerBio ?? '',
      racingOutlookAndPedigree: softLegal.racingOutlookAndPedigree ?? '',
    },
    marketing: {
      marketplaceHook: marketing.marketplaceHook ?? '',
      highlightTags: Array.isArray(marketing.highlightTags) ? marketing.highlightTags : [],
      highlights: Array.isArray(marketing.highlights) ? marketing.highlights : undefined,
    },
    listingStatus: statusToListingStatus(row.status),
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
  return (rows ?? []).map(rowToCampaign);
}

export async function getCampaignBySlug(slug: string): Promise<HorseCampaign | null> {
  const supabase = getSupabaseServiceClient();
  const { data: row, error } = await supabase.from('inventory').select('*').eq('slug', slug).single();
  if (error || !row) {
    if (error?.code === 'PGRST116') return null;
    throw new Error(`Failed to load campaign ${slug}: ${error?.message ?? 'not found'}`);
  }
  return rowToCampaign(row);
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
  return {
    horse: getHorseCdnUrls(slug),
    trainer: getTrainerCdnUrls(trainerSlug),
  };
}

/**
 * Compiles the legal pack dynamically via @evo/legal_engine and computes verified SHA-256 digests.
 */
export function getCompiledLegalPackForCampaign(campaign: HorseCampaign): CompiledLegalPack {
  const pricing = computeDslPricing(campaign.wholesaleMonthlyNzd, 1.0);

  const { pack } = compileLegalPack(
    {
      syndicateName: `${campaign.legalName} Syndicate`,
      campaignSlug: campaign.slug,
      ownerName: campaign.owner.entity,
      horse: {
        legalName: campaign.legalName,
        barnName: campaign.barnName ?? campaign.legalName,
        foalingYear: campaign.pedigree.foalingDate ? parseInt(campaign.pedigree.foalingDate.split('-')[0], 10) : 0,
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
      softLegal: campaign.softLegal,
      marketing: campaign.marketing,
      listingPlatform: campaign.listingPlatform,
    },
    { skipValidation: true }
  );

  return pack;
}
