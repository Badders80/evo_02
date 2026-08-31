import type { CampaignIntakePayload, PedigreeInput, TrainerInput, OwnerInput, MarketingInput } from '../lib/campaign-pipeline';

export interface RawPublishPayload {
  slug: string;
  legalName: string;
  barnName: string;
  wholesaleMonthlyNzd: number;
  totalSyndicateStakePct?: number;
  pedigree: PedigreeInput;
  trainer: TrainerInput;
  owner: OwnerInput;
  softLegal?: {
    aboutHorse?: string;
    trainerBio?: string;
    racingOutlookAndPedigree?: string;
    campaignNarrative?: string;
    trainerQuote?: string;
    nextUp?: string;
    latestUpdateUrl?: string;
    updateCount?: number;
  };
  marketing?: MarketingInput;
  closeStyle?: 'fourteen_day' | 'three_x_remaining';
  paymentModel?: 'subscription_float' | 'upfront';
  listingPlatform?: string;
  pdsVersion?: string;
  saVersion?: string;
  effectiveDate?: string;
  termMonths?: number;
  heroImageUrl?: string;
  pedigreeImageUrl?: string;
}

const REQUIRED_FIELDS: (keyof RawPublishPayload)[] = [
  'slug',
  'legalName',
  'barnName',
  'wholesaleMonthlyNzd',
  'totalSyndicateStakePct',
];

const REQUIRED_PEDIGREE: (keyof PedigreeInput)[] = [
  'sire',
  'dam',
  'gender',
  'breeder',
];

const REQUIRED_TRAINER: (keyof TrainerInput)[] = [
  'name',
  'stable',
  'location',
];

const REQUIRED_OWNER: (keyof OwnerInput)[] = [
  'entity',
];

export function toCampaignIntakePayload(raw: RawPublishPayload): CampaignIntakePayload {
  for (const field of REQUIRED_FIELDS) {
    const value = raw[field];
    if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '') || (typeof value === 'number' && value <= 0)) {
      throw new Error(`Missing required field: ${String(field)}`);
    }
  }
  // Locked share rule (founder 2026-08-26): total stake must be a whole multiple of the
  // 0.5% increment — otherwise total_shares would be fractional and violate the DB CHECK.
  const stake = raw.totalSyndicateStakePct as number;
  const doubled = Math.round(stake * 2); // stake × 2 must be an exact integer (multiple of 0.5)
  if (!Number.isFinite(stake) || Math.abs(stake * 2 - doubled) > 1e-9) {
    throw new Error(
      `totalSyndicateStakePct must be a multiple of ${0.5}% (received ${stake})`
    );
  }

  for (const field of REQUIRED_PEDIGREE) {
    const value = raw.pedigree?.[field];
    if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
      throw new Error(`Missing required pedigree field: ${String(field)}`);
    }
  }

  for (const field of REQUIRED_TRAINER) {
    const value = raw.trainer?.[field];
    if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
      throw new Error(`Missing required trainer field: ${String(field)}`);
    }
  }

  for (const field of REQUIRED_OWNER) {
    const value = raw.owner?.[field];
    if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
      throw new Error(`Missing required owner field: ${String(field)}`);
    }
  }

  return {
    slug: raw.slug.trim(),
    legalName: raw.legalName.trim(),
    barnName: raw.barnName.trim(),
    wholesaleMonthlyNzd: raw.wholesaleMonthlyNzd,
    totalSyndicateStakePct: raw.totalSyndicateStakePct,
    pedigree: raw.pedigree,
    trainer: raw.trainer,
    owner: raw.owner,
    softLegal: raw.softLegal,
    marketing: raw.marketing,
    closeStyle: raw.closeStyle,
    paymentModel: raw.paymentModel,
    listingPlatform: raw.listingPlatform,
    pdsVersion: raw.pdsVersion,
    saVersion: raw.saVersion,
    effectiveDate: raw.effectiveDate,
    termMonths: raw.termMonths,
    heroImageUrl: raw.heroImageUrl,
    pedigreeImageUrl: raw.pedigreeImageUrl,
  };
}