// apps/web/src/tests/eligibility.test.ts
import { strict as assert } from 'node:assert';
import { isEligibleForRace } from '../lib/eligibility';

function test_eligibility() {
  const invest = new Date('2026-09-01T00:00:00Z');
  // Exactly 2 calendar months later → eligible
  assert.equal(isEligibleForRace(invest, new Date('2026-11-01T00:00:00Z')), true);
  // 1 day short of 2 calendar months → not eligible
  assert.equal(isEligibleForRace(invest, new Date('2026-10-31T00:00:00Z')), false);
  // 3 months later → eligible
  assert.equal(isEligibleForRace(invest, new Date('2026-12-01T00:00:00Z')), true);
  // Race before investment → not eligible
  assert.equal(isEligibleForRace(invest, new Date('2026-08-01T00:00:00Z')), false);
  // Month-end boundary: invest 31 Jan → eligible from 31 Mar (clamped to 31 Mar)
  const jan31 = new Date('2026-01-31T00:00:00Z');
  assert.equal(isEligibleForRace(jan31, new Date('2026-03-31T00:00:00Z')), true);
  assert.equal(isEligibleForRace(jan31, new Date('2026-03-30T00:00:00Z')), false);
  console.log('✅ eligibility: race_date - investment_date >= 2 calendar months');
}

test_eligibility();
console.log('\n🎉 eligibility tests passed\n');
