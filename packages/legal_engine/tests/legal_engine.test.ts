import {
  compileLegalPack,
  validateLegalPack,
  generatePdsMarkdown,
  generateSaMarkdown,
  southernHemisphereAge,
  formatFoalingDate,
  type SyndicateLegalContext,
} from '../src';

const nellieContext: SyndicateLegalContext = {
  syndicateName: 'Lady Ketchikan Racing Syndicate',
  campaignSlug: 'nellie',
  ownerName: 'Bax Bloodstock',
  horse: {
    legalName: 'Lady Ketchikan',
    barnName: 'Nellie',
    foalingYear: 2023,
    gender: 'Filly',
    breeder: 'Mrs H G & W G Bax',
    microchip: '985125000137408',
    sire: 'Almanzor (FR)',
    dam: 'Night Danza (AUS)',
  },
  trainer: {
    name: 'Barbara Kennedy',
    location: 'Karaka, NZ',
    managerEntity: 'Evolution Stables',
  },
  pricing: {
    costMonthlyNzd: 7000,
    listPriceNzd: 7571,
    monthlyKeepUnitNzd: 76,
    joinFloatUnitNzd: 380,
    stakePercentage: 1.0,
    evolutionMarginPercent: 5.0,
    processingBufferPercent: 3.0,
    gstInclusive: true,
  },
  closeStyle: 'fourteen_day',
  totalHorsePercentage: 5.0,
  totalShares: 10,
  sharesAvailable: 10,
  minInvestmentPct: 1.0,
  stakeStepPct: 0.5,
  paymentModel: 'subscription_float',
  distributionSplit: '75% Investor Pool / 25% Owner Retention',
  distributionSchedule: 'Quarterly (2-month paid-up qualification prior to race date)',
  pdsVersion: '1.0.0',
  saVersion: '1.0.0',
  effectiveDate: '2026-08-17',
};

const mulanContext: SyndicateLegalContext = {
  syndicateName: 'Turn Me Loose x Yearn 2023 Racing Syndicate',
  campaignSlug: 'tml-x-yearn',
  ownerName: 'Stephen Gray Racing',
  horse: {
    legalName: 'Turn Me Loose x Yearn 2023',
    barnName: 'Mulan',
    foalingYear: 2023,
    gender: 'Filly',
    breeder: 'C W Kwok',
    microchip: '985125000128426',
    sire: 'Turn Me Loose',
    dam: 'Yearn',
  },
  trainer: {
    name: 'Stephen Gray Racing',
    location: 'Karaka, NZ',
    managerEntity: 'Stephen Gray Racing',
  },
  pricing: {
    costMonthlyNzd: 6000,
    listPriceNzd: 6489,
    monthlyKeepUnitNzd: 65,
    joinFloatUnitNzd: 325,
    stakePercentage: 1.0,
    evolutionMarginPercent: 5.0,
    processingBufferPercent: 3.0,
    gstInclusive: true,
  },
  closeStyle: 'fourteen_day',
  totalHorsePercentage: 5.0,
  totalShares: 10,
  sharesAvailable: 10,
  minInvestmentPct: 1.0,
  stakeStepPct: 0.5,
  paymentModel: 'subscription_float',
  pdsVersion: '1.0.0',
  saVersion: '1.0.0',
  effectiveDate: '2026-08-17',
};

function assertEqual(actual: unknown, expected: unknown, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

function assertIncludes(haystack: string, needle: string, message: string): void {
  if (!haystack.includes(needle)) {
    throw new Error(`${message}: missing "${needle}"`);
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function runTests(): void {
  console.log('Running legal_engine tests...\n');

  // 1. Deterministic Pack generation (Term Sheet, PDS, SA)
  const nelliePack = compileLegalPack(nellieContext);
  const nelliePack2 = compileLegalPack(nellieContext);
  assertEqual(
    nelliePack.pack.termSheetHash,
    nelliePack2.pack.termSheetHash,
    'Term Sheet output must be deterministic'
  );
  assertEqual(
    nelliePack.pack.pdsHash,
    nelliePack2.pack.pdsHash,
    'PDS output must be deterministic'
  );
  assertEqual(
    nelliePack.pack.saHash,
    nelliePack2.pack.saHash,
    'SA output must be deterministic'
  );
  console.log('✅ Deterministic Term Sheet / PDS / SA generation');

  // 2. Term Sheet structure & anchors
  assertIncludes(nelliePack.pack.termSheetMarkdown, 'DSL Term Sheet', 'Term Sheet title');
  assertIncludes(nelliePack.pack.termSheetMarkdown, 'Owner:** Bax Bloodstock', 'Nellie Owner');
  assertIncludes(nelliePack.pack.termSheetMarkdown, 'Trainer:** Barbara Kennedy (Karaka, NZ)', 'Nellie Trainer');
  assertIncludes(nelliePack.pack.termSheetMarkdown, '5.0% available', 'Nellie total syndicated %');
  assertIncludes(nelliePack.pack.termSheetMarkdown, 'Minimum Investment:** 1.0% — increments of 0.5% thereafter', 'Nellie min investment / step wording');
  assertIncludes(nelliePack.pack.termSheetMarkdown, '$76.00 / month per 1% stake', 'Nellie keep rate');
  assertIncludes(nelliePack.pack.termSheetMarkdown, '3 mo reserve deposit + 2 mo advance keep', 'Nellie join float');
  assertIncludes(nelliePack.pack.termSheetMarkdown, '75% Investor Pool / 25% Owner Retention', 'Prize split');
  assertIncludes(nelliePack.pack.termSheetMarkdown, '**Bax Bloodstock** (Owner)', 'Owner signature block');
  console.log('✅ Term Sheet generation & anchors verified');

  // 3. Mandatory PDS sections
  assertIncludes(nelliePack.pack.pdsMarkdown, '§1. Title & Structure', 'PDS section 1');
  assertIncludes(nelliePack.pack.pdsMarkdown, '§2. Asset Specifics', 'PDS section 2');
  assertIncludes(nelliePack.pack.pdsMarkdown, '§3. Commercial Model', 'PDS section 3');
  assertIncludes(nelliePack.pack.pdsMarkdown, '§4. Deposit & Billing', 'PDS section 4');
  assertIncludes(nelliePack.pack.pdsMarkdown, '§5. Investor Return', 'PDS section 5');
  assertIncludes(nelliePack.pack.pdsMarkdown, '§6. Exit & Termination', 'PDS section 6');
  console.log('✅ All mandatory PDS sections present');

  // 4. Mandatory SA clauses
  assertIncludes(nelliePack.pack.saMarkdown, 'Clause 6: Equine Welfare Supremacy', 'SA clause 6');
  assertIncludes(nelliePack.pack.saMarkdown, 'Clause 8: Default & Forfeiture', 'SA clause 8');
  assertIncludes(nelliePack.pack.saMarkdown, 'Clause 11: Syndicate Management Fee', 'SA clause 11');
  assertIncludes(nelliePack.pack.saMarkdown, 'Clause 12: Manager Removal', 'SA clause 12');
  assertIncludes(nelliePack.pack.saMarkdown, 'Clause 13: Governing Law', 'SA clause 13');
  console.log('✅ All mandatory SA clauses present');

  // 4b. Full-document skeleton: extended PDS sections + full SA clause series
  const fullPdsSections = [
    'Key Information Summary',
    'About Evolution Stables',
    '§1. Title & Structure',
    '§2. Asset Specifics',
    '§3. Commercial Model',
    '§4. Deposit & Billing',
    '§5. Investor Return',
    '§6. Exit & Termination',
    '§7. Taxes',
    '§8. Insurance',
    '§9. Valuation',
    '§10. Veterinary Report',
    '§11. Material Interests',
    '§12. Risk Disclosure',
    '§13. Responsible Investment',
    '§14. Records & Financial Reporting',
    '§15. Complaints',
    '§16. Transfer of Interest',
    '§17. Investment Details',
    '§18. Investor Declaration',
    '§19. Promoter Declaration',
  ];
  for (const sec of fullPdsSections) {
    if (!nelliePack.pack.pdsMarkdown.includes(sec)) {
      throw new Error(`Full PDS skeleton: missing section "${sec}"`);
    }
  }
  console.log(`✅ Full PDS skeleton present (${fullPdsSections.length} sections)`);

  const fullSaClauses = [
    'Clause 1: Formation',
    'Clause 2: Object',
    'Clause 3: Agreement and Parties',
    'Clause 4: Syndicate Shares',
    'Clause 5: Lease Duration',
    'Clause 6: Equine Welfare Supremacy',
    'Clause 7: Manager\'s Powers and Duties',
    'Clause 8: Default & Forfeiture',
    'Clause 9: Financial Contributions and Fees',
    'Clause 10: Revenue Streams and Distribution',
    'Clause 11: Syndicate Management Fee',
    'Clause 12: Manager Removal — NZTR Code of Practice Rule 22.1',
    'Clause 13: Governing Law & Jurisdiction',
    'Clause 14: Insurance and Early Termination',
    'Clause 15: Transfer of Shares',
    'Clause 16: Dispute Resolution',
    'Clause 17: Winding Up and Post-Lease Arrangements',
    'Clause 18: Notices',
    'Schedule 1: NZTR Statutory Member Declarations',
    'Execution',
  ];
  for (const cl of fullSaClauses) {
    if (!nelliePack.pack.saMarkdown.includes(cl)) {
      throw new Error(`Full SA skeleton: missing clause "${cl}"`);
    }
  }
  console.log(`✅ Full SA skeleton present (${fullSaClauses.length} clauses + execution)`);

  // 5. Pricing anchors
  assertIncludes(nelliePack.pack.pdsMarkdown, 'fixed rate of **$76.00 per month per 1% stake**', 'Nellie retail keep rate');
  assertIncludes(nelliePack.pack.pdsMarkdown, '$76.00', 'Nellie monthly keep');
  assertIncludes(nelliePack.pack.pdsMarkdown, '$380.00', 'Nellie join float');
  assertIncludes(nelliePack.pack.saMarkdown, '**Owner:** Bax Bloodstock', 'SA Schedule 1 owner');
  console.log('✅ Nellie pricing anchors & SA schedule correct');

  const mulanPack = compileLegalPack(mulanContext);
  assertIncludes(mulanPack.pack.pdsMarkdown, 'fixed rate of **$65.00 per month per 1% stake**', 'Mulan retail keep rate');
  assertIncludes(mulanPack.pack.pdsMarkdown, '$65.00', 'Mulan monthly keep');
  assertIncludes(mulanPack.pack.pdsMarkdown, '$325.00', 'Mulan join float');
  console.log('✅ Mulan pricing anchors correct');

  // 6. Compliance validator
  const validation = validateLegalPack(
    nelliePack.pack.pdsMarkdown,
    nelliePack.pack.saMarkdown,
    nellieContext,
    nelliePack.pack.termSheetMarkdown
  );
  assert(validation.valid, 'Nellie pack should validate clean');
  console.log('✅ Compliance validator passes clean pack');

  // 7. Banned term detection (crypto, lead lessor, micro-ownership)
  const badPds = nelliePack.pack.pdsMarkdown + '\n\nThis is not a crypto token or blockchain investment.';
  const badReport = validateLegalPack(badPds, nelliePack.pack.saMarkdown);
  assert(!badReport.valid, 'Pack with banned terms should fail');
  assert(badReport.issues.some((i) => i.code === 'BANNED_TERM'), 'Should flag BANNED_TERM');

  const badTermSheet = nelliePack.pack.termSheetMarkdown + '\n* **Role:** Lead Lessor';
  const badTermSheetReport = validateLegalPack(nelliePack.pack.pdsMarkdown, nelliePack.pack.saMarkdown, undefined, badTermSheet);
  assert(!badTermSheetReport.valid, 'Term sheet with lead lessor should fail');
  assert(badTermSheetReport.issues.some((i) => i.code === 'BANNED_TERM'), 'Should flag BANNED_TERM on lead lessor');
  console.log('✅ Banned term detection works (crypto, lead lessor, micro-ownership)');

  // 8. Pricing mismatch detection
  const badContext: SyndicateLegalContext = {
    ...nellieContext,
    pricing: { ...nellieContext.pricing, listPriceNzd: 8000 },
  };
  const mismatchReport = validateLegalPack(
    generatePdsMarkdown(badContext),
    generateSaMarkdown(badContext),
    badContext
  );
  assert(!mismatchReport.valid, 'Pricing mismatch should fail');
  assert(
    mismatchReport.issues.some((i) => i.code === 'PRICING_MISMATCH'),
    'Should flag PRICING_MISMATCH'
  );
  console.log('✅ Pricing invariant validation works');

  // 9. Upfront payment model pack
  const upfrontContext: SyndicateLegalContext = {
    ...nellieContext,
    paymentModel: 'upfront',
    termMonths: 12,
  };
  const upfrontPack = compileLegalPack(upfrontContext);
  assertIncludes(upfrontPack.pack.termSheetMarkdown, 'Upfront', 'Upfront term sheet title');
  assertIncludes(upfrontPack.pack.termSheetMarkdown, '$912.00 per 1% stake', 'Upfront cost');
  assertIncludes(upfrontPack.pack.pdsMarkdown, 'upfront payment of $912.00 per 1% stake', 'Upfront PDS §4');
  console.log('✅ Upfront payment model pack verified');

  // 10. Hash length
  assertEqual(nelliePack.pack.termSheetHash.length, 64, 'Term Sheet SHA-256 hex length');
  assertEqual(nelliePack.pack.pdsHash.length, 64, 'PDS SHA-256 hex length');
  assertEqual(nelliePack.pack.saHash.length, 64, 'SA SHA-256 hex length');
  console.log('✅ SHA-256 digests are 64-char hex');

  // 11. Soft Content PDS Section 2 Rendering & Pure Lock
  const prudentiaSoftContext: SyndicateLegalContext = {
    ...nellieContext,
    campaignSlug: 'prudentia',
    softLegal: {
      aboutHorse: 'Prudentia (NZ) is a New Zealand-bred four-year-old mare who recorded a maiden victory over 1400m at Tauranga.',
      trainerBio: 'Prudentia is trained by Wexford Stables under the leadership of Lance O\'Sullivan ONZM and Andrew Scott in Matamata.',
      racingOutlookAndPedigree: 'Prudentia carries a pedigree built for performance, by champion sire Proisir.',
      raceExpectation: 'Prudentia is spelling and expected back in work early in the new year.',
    },
  };
  const prudentiaPack = compileLegalPack(prudentiaSoftContext);
  assertIncludes(prudentiaPack.pack.pdsMarkdown, 'Prudentia (NZ) is a New Zealand-bred', 'PDS §2.1 About Horse');
  assertIncludes(prudentiaPack.pack.pdsMarkdown, 'Wexford Stables', 'PDS §2.1 Trainer Bio');
  assertIncludes(prudentiaPack.pack.pdsMarkdown, '### §2.1 About Horse & Trainer', 'PDS §2.1 About Horse & Trainer Header');
  assertIncludes(prudentiaPack.pack.pdsMarkdown, '### §2.2 Key Details', 'PDS §2.2 Key Details Table Header');
  assertIncludes(prudentiaPack.pack.pdsMarkdown, '### §2.3 Racing Outlook & Pedigree', 'PDS §2.3 Racing Outlook Header');
  assertIncludes(prudentiaPack.pack.pdsMarkdown, 'by champion sire Proisir', 'PDS §2.3 Racing Outlook Content');
  assertIncludes(prudentiaPack.pack.pdsMarkdown, '### §2.4 Racing Expectation', 'PDS §2.4 Racing Expectation Header');
  assertIncludes(prudentiaPack.pack.pdsMarkdown, 'expected back in work early in the new year', 'PDS §2.4 Racing Expectation Content');
  console.log('✅ Soft content PDS Section 2 layout verified');

  // 12. Hash determinism across trailing spaces and CRLF
  const whitespaceContext: SyndicateLegalContext = {
    ...nellieContext,
    campaignSlug: 'prudentia',
    softLegal: {
      aboutHorse: 'Prudentia (NZ) is a New Zealand-bred four-year-old mare who recorded a maiden victory over 1400m at Tauranga.   \r\n\r\n',
      trainerBio: 'Prudentia is trained by Wexford Stables under the leadership of Lance O\'Sullivan ONZM and Andrew Scott in Matamata.  \r\n',
      racingOutlookAndPedigree: 'Prudentia carries a pedigree built for performance, by champion sire Proisir.   ',
      raceExpectation: 'Prudentia is spelling and expected back in work early in the new year.   \r\n',
    },
  };
  const whitespacePack = compileLegalPack(whitespaceContext);
  assertEqual(prudentiaPack.pack.pdsHash, whitespacePack.pack.pdsHash, 'PDS hash should be identical despite CRLF/trailing spaces');
  console.log('✅ PDS SHA-256 hash invariant to whitespace and CRLF line endings');

  // 13. Compliance validator checks for arbitrary text
  const { validateSyndicateContent } = require('../src');
  const cleanContentCheck = validateSyndicateContent('A top class 3YO targeting the Autumn Stakes.');
  assert(cleanContentCheck.ok, 'Clean text should pass compliance');

  const dirtyContentCheck = validateSyndicateContent('Invest in this crypto token with guaranteed returns and micro-ownership.');
  assert(!dirtyContentCheck.ok, 'Prohibited text must fail compliance');
  assert(dirtyContentCheck.hits.includes('crypto'), 'Must flag crypto');
  assert(dirtyContentCheck.hits.includes('guaranteed return claim'), 'Must flag guaranteed return');
  assert(dirtyContentCheck.hits.includes('micro-ownership'), 'Must flag micro-ownership');
  console.log('✅ validateSyndicateContent successfully gates prohibited terminology');

  // 14. Unified banned-term gate: 'opaque' fails validateLegalPack
  {
    const opaqueContext: SyndicateLegalContext = {
      ...nellieContext,
      softLegal: {
        aboutHorse: 'The syndicate structure is intentionally opaque.',
        trainerBio: '',
        racingOutlookAndPedigree: '',
      },
    };
    const opaquePds = generatePdsMarkdown(opaqueContext);
    const opaqueSa = generateSaMarkdown(opaqueContext);
    const opaqueValidation = validateLegalPack(opaquePds, opaqueSa, opaqueContext);
    assert(!opaqueValidation.valid, 'PDS containing "opaque" must fail validation');
    assert(
      opaqueValidation.issues.some((i) => i.code === 'BANNED_TERM' && i.message.toLowerCase().includes('opaque')),
      'Validation issue must cite "opaque"'
    );
    console.log('✅ "opaque" is rejected by unified legal banned-term gate');
  }

  // 15. Fixed-input SHA-256 determinism across repeated compiler runs
  {
    const fixedContext: SyndicateLegalContext = JSON.parse(JSON.stringify(nellieContext));
    const run1 = compileLegalPack(fixedContext);
    const run2 = compileLegalPack(fixedContext);
    assertEqual(run1.pack.pdsHash, run2.pack.pdsHash, 'Repeated PDS compile must produce identical SHA-256');
    assertEqual(run1.pack.saHash, run2.pack.saHash, 'Repeated SA compile must produce identical SHA-256');
    assertEqual(run1.pack.termSheetHash, run2.pack.termSheetHash, 'Repeated term-sheet compile must produce identical SHA-256');
    console.log('✅ Fixed-input SHA-256 digests are deterministic across compiler runs');
  }

  // 16. Litmus rule: missing data renders blank marker, never a hardcoded default
  {
    const blankContext: SyndicateLegalContext = {
      ...nellieContext,
      distributionSplit: undefined,
      distributionSchedule: undefined,
      termStartDate: undefined,
      termEndDate: undefined,
      termMonths: undefined,
    };
    const blankPack = compileLegalPack(blankContext);
    assertIncludes(blankPack.pack.termSheetMarkdown, '[not filled in yet]', 'Blank marker present when distribution split missing');
    assert(!blankPack.pack.termSheetMarkdown.includes('75% Investor Pool'), 'No hardcoded 75/25 when split is absent');
    assert(!blankPack.pack.termSheetMarkdown.includes('Quarterly (2-month'), 'No hardcoded schedule when absent');
    console.log('✅ Litmus rule: missing data renders blank marker, no hardcoded fallback');
  }

  // 17. Live age off the DOB (SH rule): 1 Aug birthday, never a hardcoded number
  {
    assertEqual(southernHemisphereAge('2023-08-30', new Date('2026-07-31')), 2, 'Manolo is 2 on 31 Jul 2026');
    assertEqual(southernHemisphereAge('2023-08-30', new Date('2026-08-01')), 3, 'Manolo is 3 on 1 Aug 2026');
    assertEqual(southernHemisphereAge('2023-08-30', new Date('2026-09-09')), 3, 'Manolo is 3 on 9 Sep 2026');
    assertEqual(southernHemisphereAge('garbage'), null, 'Garbage DOB returns null');
    assertEqual(formatFoalingDate('2023-08-30'), '30 Aug 2023', 'DOB formats as 30 Aug 2023');
    const agedContext: SyndicateLegalContext = {
      ...nellieContext,
      horse: { ...nellieContext.horse, foalingDate: '2023-08-30' },
    };
    const agedPds = generatePdsMarkdown(agedContext);
    assertIncludes(agedPds, '30 Aug 2023 (age ', 'PDS §2.2 renders live DOB-derived age');
    assert(!agedPds.includes('Foaling Year'), 'PDS no longer renders static Foaling Year row');
    const agedSa = generateSaMarkdown(agedContext);
    assertIncludes(agedSa, '30 Aug 2023 (age ', 'SA renders live DOB-derived age');
    console.log('✅ Live age off the DOB (SH rule), rendered in PDS + SA');
  }

  console.log('\n🎉 All legal_engine tests passed.');
}

if (require.main === module) {
  runTests();
}
