import assert from 'node:assert/strict';
import {
 computeHorseCapTable,
 computeOwnerCloseSettlement,
 computeDelinquencyBurn,
 computeDelinquentDefaultSettlement,
 computeInvestorExitSettlement,
 computeGstBreakdown,
} from '@evo/legal_engine';
import {
 getCoOwnerCount,
 getTotalHoldingsCount,
 getCampaignAllocatedShares,
} from './investor-registry';

console.log('Running Mission Control Cap Table & Investor Registry integration tests...\n');

// 1. Registry & Active Holdings Tests
{
 assert.equal(getCoOwnerCount(), 10, 'Must have 10 canonical verified co-owners');
 assert.equal(getTotalHoldingsCount(), 12, 'Must have 12 active holdings across co-owners');

 // Nellie & Mulan: 5% listed pool, nothing sold
 assert.equal(getCampaignAllocatedShares('nellie'), 0, 'Nellie must have 0 allocated share units');
 assert.equal(getCampaignAllocatedShares('tml-x-yearn'), 0, 'Mulan must have 0 allocated share units');

 // Prudentia & Hottathanafantasy: 5% listed pool, 0.25% step = 20 units, fully subscribed
 assert.equal(getCampaignAllocatedShares('prudentia'), 20, 'Prudentia must have 20 allocated step units');
 assert.equal(getCampaignAllocatedShares('hottathanafantasy'), 20, 'Hottathanafantasy must have 20 allocated step units');

 // First Gear is a completed 10% track-record campaign. No active holdings are modelled
 // in the build; KYC-verified external co-owners are kept in FIRST_GEAR_CO_OWNERS for audit.
 assert.equal(getCampaignAllocatedShares('first-gear'), 0, 'First Gear must have 0 active allocated shares');

 console.log('✅ Investor Registry & Allocated Share counts verified for all live campaigns');
}

// 2. Mission Control Listed Pool Invariant Tests
{
 // Nellie (5% campaign, 0.5% step = 10 units: 0 allocated, 0 reserved, 10 available)
 const nellieAllocated = getCampaignAllocatedShares('nellie');
 const capNellie = computeHorseCapTable(10, nellieAllocated, 0);
 assert.equal(capNellie.allocatedShares, 0);
 assert.equal(capNellie.reservedShares, 0);
 assert.equal(capNellie.availableShares, 10);
 assert.equal(capNellie.totalCampaignShares, 10);
 assert.equal(capNellie.isBalanced, true, 'Nellie listed pool must be balanced: 0 + 0 + 10 == 10');

 // Mulan (5% campaign, 0.5% step = 10 units)
 const mulanAllocated = getCampaignAllocatedShares('tml-x-yearn');
 const capMulan = computeHorseCapTable(10, mulanAllocated, 0);
 assert.equal(capMulan.allocatedShares, 0);
 assert.equal(capMulan.reservedShares, 0);
 assert.equal(capMulan.availableShares, 10);
 assert.equal(capMulan.totalCampaignShares, 10);
 assert.equal(capMulan.isBalanced, true, 'Mulan listed pool must be balanced: 0 + 0 + 10 == 10');

 // Prudentia (5% campaign, 0.25% step = 20 units: 20 allocated, 0 reserved, 0 available)
 const prudentiaAllocated = getCampaignAllocatedShares('prudentia');
 const capPrudentia = computeHorseCapTable(20, prudentiaAllocated, 0);
 assert.equal(capPrudentia.allocatedShares, 20);
 assert.equal(capPrudentia.reservedShares, 0);
 assert.equal(capPrudentia.availableShares, 0);
 assert.equal(capPrudentia.totalCampaignShares, 20);
 assert.equal(capPrudentia.isBalanced, true, 'Prudentia listed pool must be balanced: 20 + 0 + 0 == 20');

 // Hottathanafantasy (5% campaign, 0.25% step = 20 units)
 const hottaAllocated = getCampaignAllocatedShares('hottathanafantasy');
 const capHotta = computeHorseCapTable(20, hottaAllocated, 0);
 assert.equal(capHotta.allocatedShares, 20);
 assert.equal(capHotta.reservedShares, 0);
 assert.equal(capHotta.availableShares, 0);
 assert.equal(capHotta.totalCampaignShares, 20);
 assert.equal(capHotta.isBalanced, true, 'Hottathanafantasy listed pool must be balanced: 20 + 0 + 0 == 20');

 // Manolo (5% campaign, 0.5% step = 10 units coming soon)
 const manoloAllocated = getCampaignAllocatedShares('i-stole-a-manolo');
 const capManolo = computeHorseCapTable(10, manoloAllocated, 0);
 assert.equal(capManolo.allocatedShares, 0);
 assert.equal(capManolo.reservedShares, 0);
 assert.equal(capManolo.availableShares, 10);
 assert.equal(capManolo.totalCampaignShares, 10);
 assert.equal(capManolo.isBalanced, true, 'Manolo listed pool must be balanced: 0 + 0 + 10 == 10');

 console.log('✅ Listed Pool Cap Table Invariants verified for active campaigns');
}

// 3. Settlement Desk Invariants
{
 // Case B: Owner close refund
 const caseB = computeOwnerCloseSettlement(76, 15, 30, 3);
 assert.equal(caseB.totalRefundNzd, 266.0);

 // Case D: Delinquency Two-Phase
 const caseD1 = computeDelinquencyBurn(76);
 assert.equal(caseD1.burnedAdvanceKeepNzd, 76.0);
 assert.equal(caseD1.remainingDepositMonths, 3);

 const caseD2 = computeDelinquentDefaultSettlement(76);
 assert.equal(caseD2.forfeitedDepositNzd, 228.0);
 assert.equal(caseD2.stakeRepossessed, true);

 // Case E: Walk-away
 const caseE = computeInvestorExitSettlement();
 assert.equal(caseE.depositRefundNzd, 0.0);
 assert.equal(caseE.burnedOverMonths, 4);

 // GST 3/23
 const gst = computeGstBreakdown(76);
 assert.equal(gst.gstNzd, 9.91);
 assert.equal(gst.netKeepNzd, 66.09);
 assert.equal(Math.round((gst.netKeepNzd + gst.gstNzd) * 100) / 100, 76.0);

 console.log('✅ Settlement Desk calculations verified against @evo/legal_engine canon');
}

console.log('\n🎉 Mission Control Cap Table & Investor Integration tests PASSED!');
