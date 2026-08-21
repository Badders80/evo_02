/**
 * @evo/legal_engine — Legal types and schemas for DSL PDS/SA generation.
 * Authority: evo_00/doc/DSL_MANUAL.md and evo_00/migration_bridge/04_LEGAL_DIFF_AUDIT.md
 */

import type { CloseStyle } from '@evo/db_models/types';

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
  listingPlatform?: 'evolution' | 'tokinvest' | string;
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
