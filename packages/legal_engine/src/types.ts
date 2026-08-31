/**
 * @evo/legal_engine — Legal types and schemas for DSL PDS/SA generation.
 * Authority: evo_00/doc/DSL_MANUAL.md and evo_00/migration_bridge/04_LEGAL_DIFF_AUDIT.md
 */

import type { CloseStyle } from '@evo/db_models/types';

/**
 * Canonical DSL share math (locked 2026-08-26, founder).
 * A lot/share = one increment (0.5%). Available units = listed stake % / step %.
 * Min investment is a purchase floor — never a divisor for counting units.
 * Investor-facing language is percentage-based; "lots" never appears.
 */
export const SHARE_MATH = {
  DEFAULT_MIN_INVESTMENT_PCT: 1.0,
  DEFAULT_STAKE_STEP_PCT: 0.5,
} as const;

export interface ThoroughbredPedigree {
  legalName: string;
  barnName: string;
  foalingYear: number;
  gender: 'Colt' | 'Filly' | 'Gelding' | 'Mare' | 'Horse';
  breeder: string;
  microchip?: string;
  sire: string;
  dam: string;
}

export interface TrainerDetails {
  name: string;
  location: string;
  managerEntity: string;
}

export interface DslPricing {
  costMonthlyNzd: number;
  listPriceNzd: number;
  monthlyKeepUnitNzd: number;
  joinFloatUnitNzd: number;
  stakePercentage: number;
  evolutionMarginPercent: number;
  processingBufferPercent: number;
  gstInclusive: boolean;
}

export interface HorseSoftLegalContent {
  aboutHorse: string;
  trainerBio: string;
  racingOutlookAndPedigree: string;
  campaignNarrative?: string;
  trainerQuote?: string;
  nextUp?: string;
  latestUpdateUrl?: string;
  updateCount?: number;
}

export interface HorseMarketingContent {
  marketplaceHook: string;
  highlightTags: string[];
  highlights?: string[];
}

export interface SyndicateLegalContext {
  syndicateName: string;
  campaignSlug: string;
  ownerName: string;
  horse: ThoroughbredPedigree;
  trainer: TrainerDetails;
  pricing: DslPricing;
  closeStyle: CloseStyle;
  totalHorsePercentage: number;
  totalShares: number;
  sharesAvailable: number;
  paymentModel?: 'subscription_float' | 'upfront';
  termMonths?: number;
  listingPlatform?: string;
  minInvestmentPct?: number;
  stakeStepPct?: number;
  pdsVersion: string;
  saVersion: string;
  effectiveDate: string;
  softLegal?: HorseSoftLegalContent;
  marketing?: HorseMarketingContent;
}

export interface CompiledLegalPack {
  termSheetMarkdown: string;
  pdsMarkdown: string;
  saMarkdown: string;
  termSheetHash: string;
  pdsHash: string;
  saHash: string;
  metadata: {
    syndicateName: string;
    campaignSlug: string;
    ownerName: string;
    pdsVersion: string;
    saVersion: string;
    effectiveDate: string;
  };
}

export interface ValidationIssue {
  severity: 'error' | 'warning';
  code: string;
  message: string;
}

export interface ValidationReport {
  valid: boolean;
  issues: ValidationIssue[];
}
