import { compileLegalPack, computeDslPricing } from '@evo/legal_engine';
import type {
  CompiledLegalPack,
  DslPricing,
  HorseMarketingContent,
  HorseSoftLegalContent,
  SyndicateLegalContext,
  ThoroughbredPedigree,
  TrainerDetails,
} from '@evo/legal_engine';
import { SHARE_MATH } from '@evo/legal_engine';
import type { CloseStyle, Database, PaymentStyle } from '@evo/db_models/types';
import { getSupabaseServiceClient } from './supabase-server';

export interface PedigreeInput {
  sire: string;
  dam: string;
  damSire?: string;
  foalingDate?: string;
  foalingYear?: number;
  gender: 'Colt' | 'Filly' | 'Gelding' | 'Mare' | 'Horse';
  colour?: string;
  breeder: string;
  microchip?: string;
  lifeNumber?: string;
  studBookUrl?: string;
  lineageSummary?: string;
}

export interface TrainerInput {
  name: string;
  stable: string;
  location: string;
}

export interface OwnerInput {
  entity: string;
  contact?: string;
}

export interface MarketingInput {
  marketplaceHook?: string;
  highlightTags?: string[];
  highlights?: string[];
}

export interface CampaignIntakePayload {
  slug: string;
  legalName: string;
  barnName: string;
  wholesaleMonthlyNzd: number;
  totalSyndicateStakePct?: number;
  pedigree: PedigreeInput;
  trainer: TrainerInput;
  owner: OwnerInput;
  softLegal?: Partial<HorseSoftLegalContent>;
  marketing?: MarketingInput;
  closeStyle?: CloseStyle;
  paymentModel?: PaymentStyle;
  listingPlatform?: string;
  pdsVersion?: string;
  saVersion?: string;
  effectiveDate?: string;
  termMonths?: number;
  heroImageUrl?: string;
  pedigreeImageUrl?: string;
}

const DEFAULT_PDS_VERSION = '1.0.0';
const DEFAULT_SA_VERSION = '1.0.0';

function deriveFoalingYear(input: PedigreeInput): number {
  if (input.foalingYear) return input.foalingYear;
  if (input.foalingDate) {
    const year = new Date(input.foalingDate).getFullYear();
    if (!Number.isNaN(year)) return year;
  }
  return new Date().getFullYear();
}

function buildPedigree(input: PedigreeInput): ThoroughbredPedigree {
  return {
    legalName: '',
    barnName: '',
    sire: input.sire,
    dam: input.dam,
    foalingYear: deriveFoalingYear(input),
    gender: input.gender,
    breeder: input.breeder,
    microchip: input.microchip,
  };
}

function buildTrainer(input: TrainerInput): TrainerDetails {
  return {
    name: input.name,
    location: `${input.stable}, ${input.location}`,
    managerEntity: input.stable,
  };
}

function buildSoftLegal(
  input: Partial<HorseSoftLegalContent> | undefined,
  pedigree: PedigreeInput
): HorseSoftLegalContent | undefined {
  const hasAny = input?.aboutHorse || input?.trainerBio || input?.racingOutlookAndPedigree;
  if (!hasAny && !pedigree.lineageSummary) return undefined;

  return {
    aboutHorse: input?.aboutHorse ?? '',
    trainerBio: input?.trainerBio ?? '',
    racingOutlookAndPedigree: input?.racingOutlookAndPedigree ?? pedigree.lineageSummary ?? '',
  };
}

function buildMarketing(input: MarketingInput | undefined): HorseMarketingContent | undefined {
  if (!input) return undefined;
  const hasAny =
    input.marketplaceHook || (input.highlightTags && input.highlightTags.length > 0) || (input.highlights && input.highlights.length > 0);
  if (!hasAny) return undefined;

  return {
    marketplaceHook: input.marketplaceHook ?? '',
    highlightTags: input.highlightTags ?? [],
    highlights: input.highlights,
  };
}

function buildLegalContext(
  intake: CampaignIntakePayload,
  pricing: DslPricing
): SyndicateLegalContext {
  const horsePedigree = buildPedigree(intake.pedigree);
  const trainer = buildTrainer(intake.trainer);
  const totalStakePct = intake.totalSyndicateStakePct ?? 0; // required — guard in createCampaignFromIntake
  const minStakePct = pricing.stakePercentage;
  const totalShares = totalStakePct / SHARE_MATH.DEFAULT_STAKE_STEP_PCT;
  const sharesAvailable = totalShares;

  return {
    syndicateName: `${intake.legalName} Syndicate`,
    campaignSlug: intake.slug,
    ownerName: intake.owner.entity,
    horse: horsePedigree,
    trainer,
    pricing,
    closeStyle: intake.closeStyle ?? 'fourteen_day',
    totalHorsePercentage: totalStakePct,
    totalShares,
    sharesAvailable,
    minInvestmentPct: minStakePct,
    stakeStepPct: SHARE_MATH.DEFAULT_STAKE_STEP_PCT,
    paymentModel: intake.paymentModel ?? 'subscription_float',
    termMonths: intake.termMonths ?? 12,
    listingPlatform: intake.listingPlatform ?? 'evolution',
    pdsVersion: intake.pdsVersion ?? DEFAULT_PDS_VERSION,
    saVersion: intake.saVersion ?? DEFAULT_SA_VERSION,
    effectiveDate: intake.effectiveDate ?? new Date().toISOString().split('T')[0],
    softLegal: buildSoftLegal(intake.softLegal, intake.pedigree),
    marketing: buildMarketing(intake.marketing),
  };
}

function buildInventoryInsert(
  intake: CampaignIntakePayload,
  pricing: DslPricing,
  pack: CompiledLegalPack
): Database['public']['Tables']['inventory']['Insert'] {
  // DB invariant (00001): total_shares = listed_stake_pct / stake_step_pct AND total_shares <= 100.
  const totalStakePct = intake.totalSyndicateStakePct as number; // guarded in createCampaignFromIntake
  const minStakePct = pricing.stakePercentage;
  const stakeStepPct = SHARE_MATH.DEFAULT_STAKE_STEP_PCT;
  const totalShares = totalStakePct / stakeStepPct;

  return {
    slug: intake.slug,
    legal_name: intake.legalName,
    barn_name: intake.barnName,
    sire: intake.pedigree.sire,
    dam: intake.pedigree.dam,
    trainer_name: intake.trainer.name,
    trainer_location: `${intake.trainer.stable}, ${intake.trainer.location}`,
    cost_monthly_nzd: pricing.costMonthlyNzd,
    list_price_nzd: pricing.listPriceNzd,
    monthly_keep_unit_nzd: pricing.monthlyKeepUnitNzd,
    join_float_unit_nzd: pricing.joinFloatUnitNzd,
    listed_stake_pct: totalStakePct,
    min_stake_pct: minStakePct,
    stake_step_pct: stakeStepPct,
    total_shares: totalShares,
    shares_available: totalShares,
    reserved_shares: 0,
    status: 'draft',
    close_style: intake.closeStyle ?? 'fourteen_day',
    payment_style: intake.paymentModel ?? 'subscription_float',
    listing_platform: intake.listingPlatform ?? 'evolution',
    hero_image_url: intake.heroImageUrl ?? '',
    pedigree_image_url: intake.pedigreeImageUrl ?? null,
    pds_hash: pack.pdsHash,
    sa_hash: pack.saHash,
    pds_url: '',
    sa_url: '',
    pedigree_data: {
      dam_sire: intake.pedigree.damSire ?? undefined,
      foaling_date: intake.pedigree.foalingDate ?? undefined,
      foaling_year: deriveFoalingYear(intake.pedigree),
      gender: intake.pedigree.gender,
      colour: intake.pedigree.colour ?? undefined,
      breeder: intake.pedigree.breeder,
      microchip: intake.pedigree.microchip ?? undefined,
      life_number: intake.pedigree.lifeNumber ?? undefined,
      stud_book_url: intake.pedigree.studBookUrl ?? undefined,
      lineage_summary: intake.pedigree.lineageSummary ?? undefined,
    },
    soft_legal: intake.softLegal
      ? {
          aboutHorse: intake.softLegal.aboutHorse ?? null,
          trainerBio: intake.softLegal.trainerBio ?? null,
          racingOutlookAndPedigree: intake.softLegal.racingOutlookAndPedigree ?? null,
        }
      : null,
    marketing: intake.marketing
      ? {
          marketplaceHook: intake.marketing.marketplaceHook ?? null,
          highlightTags: intake.marketing.highlightTags ?? null,
          highlights: intake.marketing.highlights ?? null,
        }
      : null,
  };
}

/**
 * Orchestrates a campaign from intake data: generates DSL pricing, compiles the legal pack,
 * persists the campaign to Supabase inventory, and returns the inventory row ID + compiled pack.
 */
export async function createCampaignFromIntake(
  intake: CampaignIntakePayload
): Promise<{ inventoryId: string; legalPack: CompiledLegalPack }> {
  if (!intake.slug || !intake.legalName || !intake.barnName) {
    throw new Error('Campaign intake requires slug, legalName, and barnName');
  }
  if (intake.wholesaleMonthlyNzd <= 0) {
    throw new Error('wholesaleMonthlyNzd must be greater than 0');
  }
  if (!intake.totalSyndicateStakePct || intake.totalSyndicateStakePct <= 0) {
    throw new Error('totalSyndicateStakePct is required and must be greater than 0');
  }
  if (!intake.softLegal?.aboutHorse?.trim()) {
    throw new Error('Campaign intake requires softLegal.aboutHorse (The story)');
  }
  if (!intake.softLegal?.racingOutlookAndPedigree?.trim()) {
    throw new Error('Campaign intake requires softLegal.racingOutlookAndPedigree (Overview tab)');
  }

  const pricing = computeDslPricing(intake.wholesaleMonthlyNzd, 1.0);
  const context = buildLegalContext(intake, pricing);
  const { pack } = compileLegalPack(context);

  const supabase = getSupabaseServiceClient();
  const insert = buildInventoryInsert(intake, pricing, pack);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('inventory') as any)
    .insert(insert)
    .select('id')
    .single();
  if (error) {
    throw new Error(`Failed to insert inventory campaign: ${error.message}`);
  }
  if (!data?.id) {
    throw new Error('Supabase insert did not return an inventory id');
  }

  return { inventoryId: data.id, legalPack: pack };
}

export type { CompiledLegalPack };
