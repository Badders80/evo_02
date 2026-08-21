import assert from 'node:assert/strict';
import {
  computeHorseCapTable,
  computePrizeDistribution,
  computeInvestorPayouts,
  computeOwnerCloseSettlement,
  computeDelinquencyBurn,
  computeDelinquentDefaultSettlement,
  computeInvestorExitSettlement,
  computeGstBreakdown,
} from '../src/settlement';

console.log('Running @evo/legal_engine Settlement & Cap Table Invariant tests...\n');

// 1. 3-Way Listed Stake Pool Invariant Tests
{
  // 5% syndicate with 3 allocated, 1 reserved (legacy test shape; now only models listed pool)
  const cap = computeHorseCapTable(5, 3, 1);
  assert.equal(cap.allocatedShares, 3, 'Allocated shares must be 3');
  assert.equal(cap.reservedShares, 1, 'Reserved shares must be 1');
  assert.equal(cap.availableShares, 1, 'Available shares must be 5 - 3 - 1 = 1');
  assert.equal(cap.totalCampaignShares, 5);
  assert.equal(cap.isBalanced, true, 'Cap table must be balanced: 3 + 1 + 1 == 5');

  // Fully subscribed 5-unit syndicate (e.g. 5% listed at 1% step)
  const capFull = computeHorseCapTable(5, 5, 0);
  assert.equal(capFull.allocatedShares, 5);
  assert.equal(capFull.availableShares, 0);
  assert.equal(capFull.isBalanced, true);

  // 5% listed at 0.5% step: 10 units fully subscribed
  const cap10Full = computeHorseCapTable(10, 10, 0);
  assert.equal(cap10Full.allocatedShares, 10);
  assert.equal(cap10Full.availableShares, 0);
  assert.equal(cap10Full.isBalanced, true);

  // Fractional-lot syndicate (2.5 + 1.75 + 0.25 + 0.25 + 0.25 = 5.0)
  const capFractional = computeHorseCapTable(5, 2.5 + 1.75 + 0.25 + 0.25 + 0.25, 0);
  assert.equal(capFractional.totalCampaignShares, 5);
  assert.equal(capFractional.allocatedShares, 5);
  assert.equal(capFractional.availableShares, 0);
  assert.equal(capFractional.isBalanced, true, 'Fractional lots summing to 5.00 must balance');

  // 2-decimal precision: 0.25 available from 2.75 allocated on a 3.00 campaign
  const capPrecise = computeHorseCapTable(3, 2.75, 0);
  assert.equal(capPrecise.availableShares, 0.25, '2-decimal remainder must be preserved');
  assert.equal(capPrecise.isBalanced, true);

  // Over-allocation violation test
  const capOver = computeHorseCapTable(5, 4, 2); // 4 + 2 = 6 > 5
  assert.equal(capOver.isBalanced, false, 'Over-allocation must flag isBalanced: false');
  assert.ok(capOver.violationReason?.includes('exceeds Campaign Total'));

  // Invalid input guards
  const capInvalid = computeHorseCapTable(105, 0, 0);
  assert.equal(capInvalid.isBalanced, false, 'Campaign total > 100 must be rejected');

  const capNegative = computeHorseCapTable(5, -1, 0);
  assert.equal(capNegative.isBalanced, false, 'Negative allocated shares must be rejected');

  console.log('✅ 3-Way Listed Stake Pool Invariants & Input Guards verified');
}

// 2. 75 / 25 Prize Money Distribution Tests
{
  const prize10k = computePrizeDistribution(10000);
  assert.equal(prize10k.investorPoolCents, 750000, '75% of $10,000 is 750,000 cents');
  assert.equal(prize10k.ownerExpenseBufferCents, 250000, '25% of $10,000 is 250,000 cents');
  assert.equal(prize10k.evolutionCents, 0, 'Evolution takes strictly 0 cents');
  assert.equal(prize10k.investorPoolNzd, 7500.0);
  assert.equal(prize10k.ownerExpenseBufferNzd, 2500.0);
  assert.equal(prize10k.evolutionNzd, 0.0);
  assert.equal(prize10k.investorPoolCents + prize10k.ownerExpenseBufferCents, 1000000);

  // Fractional amount test ($9,999.99) — residual sub-cent assigned to owner buffer
  const prizeOdd = computePrizeDistribution(9999.99);
  assert.equal(prizeOdd.investorPoolCents + prizeOdd.ownerExpenseBufferCents, 999999);
  assert.equal(prizeOdd.evolutionCents, 0);

  // Pro-rata investor payout test (e.g. 1 share out of 5 total shares from $7500 pool)
  const investorPayout = computeInvestorPayouts(750000, 5, 1);
  assert.equal(investorPayout.payoutCents, 150000, '1/5th of 750,000 cents is 150,000 cents ($1,500)');
  assert.equal(investorPayout.payoutNzd, 1500.0);

  console.log('✅ 75/25 Prize Distribution (0% Evolution) & Pro-Rata Payouts verified');
}

// 3. Settlement Operations SOP Tests (Cases B, D, E)
{
  const keepNzd = 76.0; // $76/month keep

  // Case B: Owner Closes Syndicate (14-day notice, e.g. 15 days remaining in 30-day month, full 3 months held)
  const caseB = computeOwnerCloseSettlement(keepNzd, 15, 30, 3);
  assert.equal(caseB.depositRefundNzd, 228.0, '3 months deposit refunded in full (3 * 76 = 228)');
  assert.equal(caseB.unusedAdvanceKeepRefundNzd, 38.0, 'Half month unused keep refunded (76 * 15/30 = 38)');
  assert.equal(caseB.totalRefundNzd, 266.0, 'Total refund = 228 + 38 = 266');

  // Case B with partial held float (e.g. 2 months held after 1 month was previously drawn)
  const caseBPartial = computeOwnerCloseSettlement(keepNzd, 0, 30, 2);
  assert.equal(caseBPartial.depositRefundNzd, 152.0, 'Only remaining 2 months held deposit refunded (2 * 76 = 152)');
  assert.equal(caseBPartial.totalRefundNzd, 152.0);

  // Case D Phase 1: Delinquency Drawdown (The 4 -> 3 Rule)
  const caseD1 = computeDelinquencyBurn(keepNzd);
  assert.equal(caseD1.burnedAdvanceKeepNzd, 76.0, '1 month advance keep burned');
  assert.equal(caseD1.remainingDepositMonths, 3, '3 months deposit coverage remaining');

  // Case D Phase 2: Uncured Default Settlement
  const caseD2 = computeDelinquentDefaultSettlement(keepNzd);
  assert.equal(caseD2.burnedAdvanceKeepNzd, 76.0);
  assert.equal(caseD2.forfeitedDepositNzd, 228.0, '3 months deposit forfeited to Evolution (3 * 76 = 228)');
  assert.equal(caseD2.totalEvolutionLiquidatedDamagesNzd, 228.0);
  assert.equal(caseD2.stakeRepossessed, true);

  // Case E: Investor Walk-Away (Notice before the 1st, 4-month burn, zero refund)
  const caseE = computeInvestorExitSettlement();
  assert.equal(caseE.depositRefundNzd, 0.0, 'Zero cash refund of deposit');
  assert.equal(caseE.stakeForfeited, true);
  assert.equal(caseE.burnedOverMonths, 4, 'Full 4-month float coverage is burned in Case E (must be 4, not 3)');

  console.log('✅ SOP Settlement Cases (Case B, Case D 4->3, Case E) verified');
}

// 4. NZ GST Breakdown Tests (Strict 20/23 and 3/23 Identity)
{
  const gst76 = computeGstBreakdown(76.0);
  assert.equal(gst76.grossNzd, 76.0);
  assert.equal(gst76.netKeepNzd, 66.09, '76 * 20 / 23 = 66.0869 -> 66.09');
  assert.equal(gst76.gstNzd, 9.91, '76 * 3 / 23 = 9.9130 -> 9.91');
  assert.equal(
    Math.round((gst76.netKeepNzd + gst76.gstNzd) * 100) / 100,
    76.0,
    'Net + GST must strictly equal Gross'
  );

  // Arbitrary odd number test
  const gstOdd = computeGstBreakdown(123.45);
  assert.equal(gstOdd.netKeepCents + gstOdd.gstCents, gstOdd.grossCents);

  console.log('✅ NZ GST 3/23 Breakdown Identity verified');
}

console.log('\n🎉 All Settlement, Cap Table & GST tests passed successfully!');
