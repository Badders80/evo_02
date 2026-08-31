process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321';

// Service key comes from the operator's gitignored .env.local (local stack only — never commit).
import { readFileSync } from 'node:fs';
let envLocal: string;
try {
  envLocal = readFileSync(new URL('../../.env.local', import.meta.url), 'utf8');
} catch {
  throw new Error(
    'apps/mission_control/.env.local not found — create it with SUPABASE_SERVICE_ROLE_KEY=<local service key> to run integration tests'
  );
}
const svcKey = envLocal.split('\n').find((l) => l.startsWith('SUPABASE_SERVICE_ROLE_KEY='));
if (!svcKey) {
  throw new Error(
    'SUPABASE_SERVICE_ROLE_KEY missing — set it in apps/mission_control/.env.local (local Supabase sb_secret_…)'
  );
}
process.env.SUPABASE_SERVICE_ROLE_KEY = svcKey.slice('SUPABASE_SERVICE_ROLE_KEY='.length).trim();

import assert from 'node:assert/strict';
import { createCampaignFromIntake, type CampaignIntakePayload } from './campaign-pipeline';
import { getSupabaseServiceClient } from './supabase-server';

async function runTest() {
  console.log('Running Campaign Pipeline Integration Test...\n');

  const slug = `e2e-wire-test-${Date.now()}`;

  const payload: CampaignIntakePayload = {
    slug,
    legalName: 'E2E Wire Test',
    barnName: 'E2E Wire Test',
    wholesaleMonthlyNzd: 76,
    totalSyndicateStakePct: 5,
    pedigree: {
      sire: 'Test Sire',
      dam: 'Test Dam',
      gender: 'Filly',
      breeder: 'Test Breeder',
    },
    trainer: {
      name: 'Test Trainer',
      stable: 'Test Stable',
      location: 'Test Location',
    },
    owner: {
      entity: 'Evolution Stables',
    },
    softLegal: {
      aboutHorse: 'Test story paragraph for the E2E wire test horse.',
      trainerBio: 'Test trainer biography.',
      racingOutlookAndPedigree: 'Test racing outlook and pedigree summary.',
      campaignNarrative: 'Test campaign narrative about the horse\'s journey and recent achievements.',
      trainerQuote: 'Test trainer quote about working with this horse.',
      nextUp: 'Next race: Canterbury Cup, 2000m',
      latestUpdateUrl: 'https://evolution.stables/horses/test/update',
      updateCount: 3,
    },
    marketing: {
      marketplaceHook: 'Test marketplace hook line.',
      highlightTags: ['Tag One', 'Tag Two'],
    },
    closeStyle: 'fourteen_day',
    paymentModel: 'subscription_float',
  };

  const supabase = getSupabaseServiceClient();

  try {
    const result = await createCampaignFromIntake(payload);

    assert.ok(result.inventoryId, 'Should return inventoryId');
    assert.ok(typeof result.inventoryId === 'string', 'inventoryId should be a string');

    assert.ok(result.legalPack, 'Should return legalPack');
    assert.ok(result.legalPack.pdsHash, 'legalPack should have pdsHash');
    assert.ok(result.legalPack.saHash, 'legalPack should have saHash');
    assert.match(result.legalPack.pdsHash, /^[0-9a-f]{64}$/, 'pdsHash must be 64-char hex');
    assert.match(result.legalPack.saHash, /^[0-9a-f]{64}$/, 'saHash must be 64-char hex');

    // Locked share invariant (2026-08-26): 5% stake / 0.5% step = 10 shares, in BOTH the
    // legal context and the persisted DB row.
    const { data: row, error: rowError } = await (supabase.from('inventory') as any)
      .select('listed_stake_pct, stake_step_pct, total_shares')
      .eq('slug', slug)
      .single();
    assert.ok(!rowError, `Row fetch failed: ${rowError?.message}`);
    assert.equal(row?.listed_stake_pct, 5, 'listed_stake_pct should be 5');
    assert.equal(row?.stake_step_pct, 0.5, 'stake_step_pct should be 0.5');
    assert.equal(row?.total_shares, 10, 'total_shares should be 10 (5 / 0.5)');

    console.log(`✅ PASS: campaign-pipeline test — inventoryId=${result.inventoryId} pdsHash=${result.legalPack.pdsHash.slice(0, 8)}… saHash=${result.legalPack.saHash.slice(0, 8)}…`);
  } finally {
    await supabase.from('inventory').delete().eq('slug', slug);
  }

  console.log('\n🎉 Campaign Pipeline Integration Test PASSED!');
}

runTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});

// Reject-cases (locked rule: no auto-default stake)
async function runRejectCases() {
  const { toCampaignIntakePayload } = await import('./intake-adapter');
  const base = { ...validBase() };
  // missing stake
  const noStake: Record<string, unknown> = { ...base };
  delete noStake.totalSyndicateStakePct;
  assert.throws(
    () => toCampaignIntakePayload(noStake as never),
    /totalSyndicateStakePct/,
    'Adapter must reject payload missing totalSyndicateStakePct'
  );
  // zero/negative stake
  assert.throws(
    () => toCampaignIntakePayload({ ...base, totalSyndicateStakePct: 0 } as never),
    /totalSyndicateStakePct/,
    'Adapter must reject totalSyndicateStakePct <= 0'
  );
  // non-multiple of the 0.5% step (locked rule: whole multiples only — fractional shares would violate DB CHECK)
  for (const badStake of [5.1, 5.25, 3.33]) {
    assert.throws(
      () => toCampaignIntakePayload({ ...base, totalSyndicateStakePct: badStake } as never),
      /multiple of 0\.5%/,
      `Adapter must reject non-step-multiple stake ${badStake}`
    );
  }
  // valid half-steps accepted (no throw)
  toCampaignIntakePayload({ ...base, totalSyndicateStakePct: 5.5 } as never);
  console.log('✅ PASS: adapter rejects missing/invalid/non-step-multiple totalSyndicateStakePct');
}

function validBase(): Record<string, unknown> {
  return {
    slug: `adapter-reject-${Date.now()}`,
    legalName: 'Adapter Reject Test',
    barnName: 'Adapter Reject Test',
    wholesaleMonthlyNzd: 76,
    totalSyndicateStakePct: 5,
    pedigree: { sire: 'S', dam: 'D', gender: 'Filly', breeder: 'B' },
    trainer: { name: 'T', stable: 'St', location: 'L' },
    owner: { entity: 'Evolution Stables' },
  };
}

runRejectCases().catch((err) => {
  console.error('Reject-case test failed:', err);
  process.exit(1);
});

// Required story fields (locked 2026-08-31): aboutHorse + racingOutlookAndPedigree.
// createCampaignFromIntake must reject BEFORE any DB write — the guard runs ahead of
// pricing/legal-pack compilation and the Supabase client, so no live stack is needed.
async function runRequiredStoryFieldCases() {
  const base: CampaignIntakePayload = {
    slug: `story-guard-${Date.now()}`,
    legalName: 'Story Guard Test',
    barnName: 'Story Guard Test',
    wholesaleMonthlyNzd: 76,
    totalSyndicateStakePct: 5,
    pedigree: { sire: 'S', dam: 'D', gender: 'Filly', breeder: 'B' },
    trainer: { name: 'T', stable: 'St', location: 'L' },
    owner: { entity: 'Evolution Stables' },
    softLegal: {
      aboutHorse: 'A proper story paragraph.',
      trainerBio: 'Bio.',
      racingOutlookAndPedigree: 'A proper racing outlook summary.',
    },
  };

  // Missing aboutHorse -> throw aboutHorse
  await assert.rejects(
    createCampaignFromIntake({ ...base, softLegal: { ...base.softLegal!, aboutHorse: '' } }),
    /aboutHorse/,
    'createCampaignFromIntake must reject missing/empty aboutHorse'
  );

  // Missing racingOutlookAndPedigree -> throw racingOutlookAndPedigree
  await assert.rejects(
    createCampaignFromIntake({
      ...base,
      softLegal: { ...base.softLegal!, racingOutlookAndPedigree: '   ' },
    }),
    /racingOutlookAndPedigree/,
    'createCampaignFromIntake must reject missing/empty racingOutlookAndPedigree'
  );

  // No softLegal at all -> throw aboutHorse (first required field)
  await assert.rejects(
    createCampaignFromIntake({ ...base, softLegal: undefined }),
    /aboutHorse/,
    'createCampaignFromIntake must reject payload with no softLegal'
  );

  console.log('✅ PASS: createCampaignFromIntake rejects missing story fields (aboutHorse + racingOutlookAndPedigree)');
}

runRequiredStoryFieldCases().catch((err) => {
  console.error('Required-story-field test failed:', err);
  process.exit(1);
});