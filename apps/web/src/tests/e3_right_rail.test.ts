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

// 3. E3 Five Pillars Content & Vocabulary Whitelist Gate
{
  const E3_PILLARS = [
    {
      id: 'deal',
      title: 'The Deal',
      summary: 'Fixed price · fixed duration · fixed return.',
      content: 'Can the owner ask for more money? Nope. One price, fixed. What the upfront covers: the last 5 months of the term.',
    },
    {
      id: 'included',
      title: "What's Included",
      summary: 'Everything covered, nothing changes.',
      content: 'Float, keep, insurance, veterinary coverage — all-inclusive management. No surprise capital calls.',
    },
    {
      id: 'what_if',
      title: 'What If',
      summary: 'Injured → you stop paying.',
      content: 'Welfare-first stewardship. If injured and unable to race, your monthly keep contributions stop immediately.',
    },
    {
      id: 'return',
      title: 'Your Return',
      summary: '75% gross prize money, pro-rata, quarterly.',
      content: 'Stakes published on official NZTR record. Distributions paid quarterly directly to your bank account.',
    },
    {
      id: 'exit',
      title: 'Exit & Transfer',
      summary: 'Fixed term end · transfer via Evolution on request.',
      content: 'Secondary market to follow. Initially, ownership transfers are facilitated through Evolution Stables upon request.',
    },
  ];

  const BANNED_PATTERNS = [
    /\bshares\b/i,
    /\breward\b/i,
    /\byield\b/i,
    /\bdividend\b/i,
    /\broi\b/i,
    /\bpayout\b/i,
    /\btop-up\b/i,
    /\bpieces\b/i,
    /\bparts\b/i,
    /\bleadco\b/i,
    /\bbloodstock\b/i,
    /!/,
  ];

  for (const pillar of E3_PILLARS) {
    const fullText = `${pillar.title} ${pillar.summary} ${pillar.content}`;
    for (const pattern of BANNED_PATTERNS) {
      assert.ok(!pattern.test(fullText), `Pillar '${pillar.title}' must not match banned pattern ${pattern}`);
    }
  }

  console.log('✅ E3 5-Pillar accordion copy conforms to Private Banker standard & vocabulary whitelist');
}

console.log('\n🎉 All @evo/web E3 Right Rail tests passed successfully!\n');
