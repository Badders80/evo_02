// apps/web/src/lib/forfeit.ts
import { computeDelinquentDefaultSettlement } from '@evo/legal_engine';

export interface ForfeitOutcome {
  shouldForfeit: boolean;
  forfeitedDepositNzd: number;
  stakeRepossessed: boolean;
  depositDisposition: 'manual_review_to_owner';
  requiresHumanApproval: boolean;
}

export function forfeitOutcome(input: { floatMonthsHeld: number; monthlyKeepNzd: number }): ForfeitOutcome {
  if (input.floatMonthsHeld > 3) {
    return {
      shouldForfeit: false,
      forfeitedDepositNzd: 0,
      stakeRepossessed: false,
      depositDisposition: 'manual_review_to_owner',
      requiresHumanApproval: false,
    };
  }
  const s = computeDelinquentDefaultSettlement(input.monthlyKeepNzd);
  return {
    shouldForfeit: true,
    forfeitedDepositNzd: s.forfeitedDepositNzd,
    stakeRepossessed: s.stakeRepossessed,
    depositDisposition: s.depositDisposition,
    requiresHumanApproval: true,
  };
}
