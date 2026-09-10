import assert from 'node:assert/strict';
import { getCompiledLegalPackForCampaign, type HorseCampaign } from '../lib/horses-data';
import { pricingForUnits, stakePctToStepUnits, stepUnitsToStakePct, isSha256Hex } from '../lib/nellie-loop';
import { SHARE_MATH } from '@evo/legal_engine';

console.log('Running @evo/web E3 Right Rail & Acceptance Gate tests...\n');

// 1. Share-Math & Slider Invariants (Locked Rule 11)
{
  assert.equal(SHARE_MATH.DEFAULT_MIN_INVESTMENT_PCT, 1.0, 'Default min investment pct is 1.0%');
  assert.equal(SHARE_MATH.DEFAULT_STAKE_STEP_PCT, 0.5, 'Default stake step pct is 0.5%');

  // Boundary conversions
  assert.equal(stakePctToStepUnits(1.0), 2, '1.0% stake is 2 step-units (0.5% each)');
  assert.equal(stakePctToStepUnits(1.5), 3, '1.5% stake is 3 step-units');
  assert.equal(stakePctToStepUnits(2.0), 4, '2.0% stake is 4 step-units');
  assert.equal(stepUnitsToStakePct(2), 1.0);
  assert.equal(stepUnitsToStakePct(3), 1.5);
  assert.equal(stepUnitsToStakePct(4), 2.0);

  // Pricing calculations for Nellie wholesale keep ($3,800/mo for 100%)
  // List price = Math.ceil(3800 * 1.05 * 1.03) = 4110
  const wholesale = 3800;
  const pricing1Pct = pricingForUnits(wholesale, 1.0);
  assert.equal(pricing1Pct.listPriceNzd, 4110);
  assert.equal(pricing1Pct.monthlyKeepUnitNzd, 42, '1% monthly keep is $42/mo (includes margin + buffer)');
  assert.equal(pricing1Pct.joinFloatUnitNzd, 210, '1% join float (5 months) is $210');

  const pricing2Pct = pricingForUnits(wholesale, 2.0);
  assert.equal(pricing2Pct.monthlyKeepUnitNzd, 83, '2% monthly keep is $83/mo');
  assert.equal(pricing2Pct.joinFloatUnitNzd, 415, '2% join float (5 months) is $415');

  console.log('✅ Share-math & pricing invariants verified (1.0% floor, 0.5% step, 5×M float deposit)');
}

// 2. Legal Pack Compilation & Hash Invariants (Locked Rule 13)
{
  const testCampaign: HorseCampaign = {
    slug: 'nellie',
    legalName: 'Nellie',
    barnName: 'Nellie',
    wholesaleMonthlyNzd: 3800,
    totalSyndicateStakePct: 10,
    minStakePct: 1.0,
    stakeStepPct: 0.5,
    softLegal: {
      aboutHorse: 'Nellie is a talented filly.',
      trainerBio: 'Stephen Gray is a seasoned trainer.',
      racingOutlookAndPedigree: 'Promising racing outlook.',
    },
    marketing: {
      marketplaceHook: 'Attractive offer from Australia',
      highlightTags: ['Group Performer'],
    },
    listingStatus: 'listed',
    owner: {
      entity: 'Evolution Stables',
      contact: 'alex@evolutionstables.nz',
    },
    trainer: {
      name: 'Stephen Gray',
      stable: 'Stephen Gray Racing',
      location: 'Palmerston North, NZ',
      slug: 'stephen-gray',
    },
    pedigree: {
      sire: 'Per Incanto',
      dam: 'Nellie',
      damSire: 'O’Reilly',
      lineageSummary: 'Top tier lineage',
      foalingDate: '2021-08-01',
      gender: 'Filly',
      colour: 'Bay',
      breeder: 'Little Avondale Trust',
      microchip: '985141001234567',
      lifeNumber: 'NZ0012345',
      studBookUrl: 'https://loveracing.nz',
    },
    capTableFixture: {
      retainedPct: 90,
      allocatedPct: 0,
      reservedPct: 0,
      availablePct: 10,
      totalInvestors: 0,
    },
    closeStyle: 'fourteen_day',
  };

  const pack = getCompiledLegalPackForCampaign(testCampaign);
  assert.ok(pack.pdsMarkdown && pack.pdsMarkdown.length > 100, 'PDS markdown compiled');
  assert.ok(pack.saMarkdown && pack.saMarkdown.length > 100, 'SA markdown compiled');
  assert.ok(isSha256Hex(pack.pdsHash), 'PDS hash is valid 64-hex');
  assert.ok(isSha256Hex(pack.saHash), 'SA hash is valid 64-hex');
  assert.equal(pack.metadata.ownerName, 'Evolution Stables', 'Owner name is Evolution Stables');

  console.log('✅ Legal pack compilation & verified SHA-256 digests validated');
}

// 2b. Hash-variance (kimi WARN-6, investor-SA checkout): the SA hash MUST vary with
// the investor's stake while the PDS hash stays constant (PDS = locked offer doc).
{
  const testCampaign: HorseCampaign = {
    slug: 'nellie',
    legalName: 'Nellie',
    barnName: 'Nellie',
    wholesaleMonthlyNzd: 3800,
    totalSyndicateStakePct: 10,
    minStakePct: 1.0,
    stakeStepPct: 0.5,
    softLegal: {
      aboutHorse: 'Nellie is a talented filly.',
      trainerBio: 'Stephen Gray is a seasoned trainer.',
      racingOutlookAndPedigree: 'Promising racing outlook.',
    },
    marketing: {
      marketplaceHook: 'Attractive offer from Australia',
      highlightTags: ['Group Performer'],
    },
    listingStatus: 'listed',
    owner: {
      entity: 'Evolution Stables',
      contact: 'alex@evolutionstables.nz',
    },
    trainer: {
      name: 'Stephen Gray',
      stable: 'Stephen Gray Racing',
      location: 'Palmerston North, NZ',
      slug: 'stephen-gray',
    },
    pedigree: {
      sire: 'Per Incanto',
      dam: 'Nellie',
      damSire: 'O’Reilly',
      lineageSummary: 'Top tier lineage',
      foalingDate: '2021-08-01',
      gender: 'Filly',
      colour: 'Bay',
      breeder: 'Little Avondale Trust',
      microchip: '985141001234567',
      lifeNumber: 'NZ0012345',
      studBookUrl: 'https://loveracing.nz',
    },
    capTableFixture: {
      retainedPct: 90,
      allocatedPct: 0,
      reservedPct: 0,
      availablePct: 10,
      totalInvestors: 0,
    },
    closeStyle: 'fourteen_day',
  };

  const pack15 = getCompiledLegalPackForCampaign(testCampaign, 1.5);
  const pack20 = getCompiledLegalPackForCampaign(testCampaign, 2.0);
  const packDefault = getCompiledLegalPackForCampaign(testCampaign);

  // SA is investor-specific: hash varies with stake.
  assert.notEqual(pack15.saHash, pack20.saHash, 'SA hash must vary with stake (1.5% vs 2.0%)');
  assert.notEqual(pack15.saHash, packDefault.saHash, 'SA hash must differ from the 1.0% default');
  // PDS is a locked offer doc: hash identical across stakes.
  assert.equal(pack15.pdsHash, pack20.pdsHash, 'PDS hash must stay constant across stakes');
  assert.equal(pack15.pdsHash, packDefault.pdsHash, 'PDS hash must equal the default compile');
  // The stake-specific SA actually renders the stake's numbers (1.5% of $4110 list = $62/mo, $310 float).
  assert.ok(pack15.saMarkdown.includes('$62.00'), '1.5% SA renders $62.00 monthly keep');
  assert.ok(pack15.saMarkdown.includes('$310.00'), '1.5% SA renders $310.00 initial payment');
  assert.ok(pack20.saMarkdown.includes('$83.00'), '2.0% SA renders $83.00 monthly keep');
  assert.ok(pack20.saMarkdown.includes('$415.00'), '2.0% SA renders $415.00 initial payment');

  console.log('✅ Hash-variance: SA varies with stake, PDS stays locked (investor-specific SA)');
}

// 3. (Removed 2026-09-04 format-pass/rail rebuild: the E3 5-pillar accordion and stake
// slider were deleted from the rail — locked Step-1 "Ownership" card replaced them.
// Whistleblowing pillar copy was locked content, now retired with the surface.)

console.log('\n🎉 All @evo/web E3 Right Rail tests passed successfully!\n');
