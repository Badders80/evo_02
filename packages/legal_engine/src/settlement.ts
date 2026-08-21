/**
 * Canonical Settlement, Cap Table, and Tax Engine.
 * Authority: evo_00/doc/DSL_MANUAL.md, evo_00/doc/OPERATIONS_SOP.md, and evo_00/migration_bridge/02_DATA_MAPPING.md
 */

export interface HorseCapTableResult {
  allocatedShares: number;
  reservedShares: number;
  availableShares: number;
  totalCampaignShares: number;
  isBalanced: boolean;
  violationReason?: string;
}

/**
 * 3-Way Listed Stake Pool Invariant Calculator.
 * Rule: Evolution only models the stake pool it lists.
 * Allocated + Reserved + Available == totalCampaignShares.
 * The remaining owner-retained stake is intentionally out of scope.
 * All share values are 2-decimal precision to support 0.25%, 0.5%, 1.75%, etc.
 */
export function computeHorseCapTable(
  totalCampaignShares: number,
  allocatedShares: number,
  reservedShares: number = 0
): HorseCapTableResult {
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const total = round2(totalCampaignShares);
  const allocated = round2(allocatedShares);
  const reserved = round2(reservedShares);

  if (total <= 0 || total > 100) {
    return {
      allocatedShares: allocated,
      reservedShares: reserved,
      availableShares: 0,
      totalCampaignShares: total,
      isBalanced: false,
      violationReason: `totalCampaignShares must be between 0 and 100 (received ${totalCampaignShares})`,
    };
  }

  if (Math.abs(total - Math.round(total)) > 0.001) {
    return {
      allocatedShares: allocated,
      reservedShares: reserved,
      availableShares: 0,
      totalCampaignShares: total,
      isBalanced: false,
      violationReason: `totalCampaignShares must be a whole number of step units (received ${totalCampaignShares})`,
    };
  }

  if (allocated < 0) {
    return {
      allocatedShares: allocated,
      reservedShares: reserved,
      availableShares: 0,
      totalCampaignShares: total,
      isBalanced: false,
      violationReason: `allocatedShares must be non-negative (received ${allocatedShares})`,
    };
  }

  if (reserved < 0) {
    return {
      allocatedShares: allocated,
      reservedShares: reserved,
      availableShares: 0,
      totalCampaignShares: total,
      isBalanced: false,
      violationReason: `reservedShares must be non-negative (received ${reservedShares})`,
    };
  }

  if (allocated + reserved > total + 0.001) {
    return {
      allocatedShares: allocated,
      reservedShares: reserved,
      availableShares: 0,
      totalCampaignShares: total,
      isBalanced: false,
      violationReason: `Allocated (${allocated}) + Reserved (${reserved}) exceeds Campaign Total (${total})`,
    };
  }

  const availableShares = round2(total - allocated - reserved);
  const isBalanced = Math.abs(allocated + reserved + availableShares - total) < 0.001;

  return {
    allocatedShares: allocated,
    reservedShares: reserved,
    availableShares,
    totalCampaignShares: total,
    isBalanced,
  };
}

export interface PrizeDistributionResult {
  investorPoolCents: number;
  ownerExpenseBufferCents: number;
  evolutionCents: number;
  investorPoolNzd: number;
  ownerExpenseBufferNzd: number;
  evolutionNzd: number;
}

/**
 * 75 / 25 Prize Money Distribution.
 * 75% to syndicated investors, 25% to Owner/Lessor Expense Buffer.
 * Evolution Stables retains 0%.
 * Any fractional residual cent is allocated to the Owner Expense Buffer.
 */
export function computePrizeDistribution(grossPrizeNzd: number): PrizeDistributionResult {
  const grossCents = Math.round(Math.max(0, grossPrizeNzd) * 100);
  const investorPoolCents = Math.floor((grossCents * 3) / 4);
  const ownerExpenseBufferCents = grossCents - investorPoolCents;
  const evolutionCents = 0;

  return {
    investorPoolCents,
    ownerExpenseBufferCents,
    evolutionCents,
    investorPoolNzd: investorPoolCents / 100,
    ownerExpenseBufferNzd: ownerExpenseBufferCents / 100,
    evolutionNzd: 0,
  };
}

/**
 * Pro-rata investor payout from the investor prize pool.
 */
export function computeInvestorPayouts(
  investorPoolCents: number,
  totalSyndicatedShares: number,
  investorShares: number
): { payoutCents: number; payoutNzd: number } {
  if (
    totalSyndicatedShares <= 0 ||
    investorShares <= 0 ||
    investorShares > totalSyndicatedShares
  ) {
    return { payoutCents: 0, payoutNzd: 0 };
  }
  const payoutCents = Math.floor((investorPoolCents * investorShares) / totalSyndicatedShares);
  return {
    payoutCents,
    payoutNzd: payoutCents / 100,
  };
}

export interface OwnerCloseSettlementResult {
  depositRefundCents: number;
  unusedAdvanceKeepRefundCents: number;
  totalRefundCents: number;
  depositRefundNzd: number;
  unusedAdvanceKeepRefundNzd: number;
  totalRefundNzd: number;
}

/**
 * Case B: Owner Closes Syndicate (14-day statutory notice).
 * Rule: Unused deposit (floatMonthsHeld * M) refunded + unused advance keep refunded pro-rata.
 * If the float was previously drawn down, only the remaining held deposit is refunded.
 */
export function computeOwnerCloseSettlement(
  monthlyKeepNzd: number,
  daysRemainingInMonth: number,
  daysInMonth: number = 30,
  floatMonthsHeld: number = 3
): OwnerCloseSettlementResult {
  const keepCents = Math.round(Math.max(0, monthlyKeepNzd) * 100);
  const validDaysInMonth = Math.max(1, daysInMonth);
  const validDaysRemaining = Math.max(0, Math.min(validDaysInMonth, daysRemainingInMonth));
  const validFloatMonths = Math.max(0, floatMonthsHeld);

  const depositRefundCents = Math.round(validFloatMonths * keepCents);
  const unusedAdvanceKeepRefundCents = Math.round((keepCents * validDaysRemaining) / validDaysInMonth);
  const totalRefundCents = depositRefundCents + unusedAdvanceKeepRefundCents;

  return {
    depositRefundCents,
    unusedAdvanceKeepRefundCents,
    totalRefundCents,
    depositRefundNzd: depositRefundCents / 100,
    unusedAdvanceKeepRefundNzd: unusedAdvanceKeepRefundCents / 100,
    totalRefundNzd: totalRefundCents / 100,
  };
}

export interface DelinquencyBurnResult {
  burnedAdvanceKeepCents: number;
  remainingDepositMonths: number;
  burnedAdvanceKeepNzd: number;
}

/**
 * Case D — Phase 1: Delinquency Drawdown (The 4 -> 3 Rule).
 * Rule: Missed payment on 1st burns 1 month advance keep, coverage drops from 4 to 3 months.
 */
export function computeDelinquencyBurn(monthlyKeepNzd: number): DelinquencyBurnResult {
  const keepCents = Math.round(Math.max(0, monthlyKeepNzd) * 100);
  return {
    burnedAdvanceKeepCents: keepCents,
    remainingDepositMonths: 3,
    burnedAdvanceKeepNzd: keepCents / 100,
  };
}

export interface DelinquentDefaultSettlementResult {
  burnedAdvanceKeepCents: number;
  forfeitedDepositCents: number;
  totalEvolutionLiquidatedDamagesCents: number;
  burnedAdvanceKeepNzd: number;
  forfeitedDepositNzd: number;
  totalEvolutionLiquidatedDamagesNzd: number;
  stakeRepossessed: boolean;
}

/**
 * Case D — Phase 2: Uncured Default Settlement.
 * Rule: After 4->3 keep drawdown, when default matures under SA Clause 8, the 3-month deposit ($3xM) is forfeited to Evolution as liquidated damages, stake repossessed.
 */
export function computeDelinquentDefaultSettlement(monthlyKeepNzd: number): DelinquentDefaultSettlementResult {
  const keepCents = Math.round(Math.max(0, monthlyKeepNzd) * 100);
  const forfeitedDepositCents = 3 * keepCents;

  return {
    burnedAdvanceKeepCents: keepCents,
    forfeitedDepositCents,
    totalEvolutionLiquidatedDamagesCents: forfeitedDepositCents,
    burnedAdvanceKeepNzd: keepCents / 100,
    forfeitedDepositNzd: forfeitedDepositCents / 100,
    totalEvolutionLiquidatedDamagesNzd: forfeitedDepositCents / 100,
    stakeRepossessed: true,
  };
}

export interface InvestorExitSettlementResult {
  depositRefundCents: number;
  depositRefundNzd: number;
  stakeForfeited: boolean;
  burnedOverMonths: number;
}

/**
 * Case E: Investor Voluntary Walk-Away (Notice before the 1st of the month).
 * Rule: Zero cash refund of deposit (burned over 4 months of keep coverage or forfeited upon immediate release).
 */
export function computeInvestorExitSettlement(): InvestorExitSettlementResult {
  return {
    depositRefundCents: 0,
    depositRefundNzd: 0,
    stakeForfeited: true,
    burnedOverMonths: 4,
  };
}

export interface GstBreakdownResult {
  grossCents: number;
  netKeepCents: number;
  gstCents: number;
  grossNzd: number;
  netKeepNzd: number;
  gstNzd: number;
}

/**
 * NZ GST Breakdown (GST-inclusive keep fee).
 * Rule: Net keep is 20/23 of gross; GST remittance is 3/23 (gross - net).
 * Strictly guarantees net + gst === gross down to the exact cent.
 */
export function computeGstBreakdown(grossKeepNzd: number): GstBreakdownResult {
  const grossCents = Math.round(Math.max(0, grossKeepNzd) * 100);
  const netKeepCents = Math.round((grossCents * 20) / 23);
  const gstCents = grossCents - netKeepCents;

  return {
    grossCents,
    netKeepCents,
    gstCents,
    grossNzd: grossCents / 100,
    netKeepNzd: netKeepCents / 100,
    gstNzd: gstCents / 100,
  };
}
