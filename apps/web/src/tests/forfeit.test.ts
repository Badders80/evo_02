// apps/web/src/tests/forfeit.test.ts
import { strict as assert } from 'node:assert';
import { forfeitOutcome } from '../lib/forfeit';

function test_forfeit_outcome() {
  const o = forfeitOutcome({ floatMonthsHeld: 3, monthlyKeepNzd: 76 });
  assert.equal(o.shouldForfeit, true);
  assert.equal(o.forfeitedDepositNzd, 228, '3 * 76 = 228');
  assert.equal(o.stakeRepossessed, true);
  assert.equal(o.depositDisposition, 'manual_review_to_owner');
  assert.equal(o.requiresHumanApproval, true);
  console.log('✅ forfeit outcome: deposit forfeited, stake repossessed, human approval required');
}

function test_no_forfeit_above_floor() {
  const o = forfeitOutcome({ floatMonthsHeld: 4, monthlyKeepNzd: 76 });
  assert.equal(o.shouldForfeit, false);
  console.log('✅ no forfeit above the 3-month floor');
}

test_forfeit_outcome();
test_no_forfeit_above_floor();
console.log('\n🎉 forfeit tests passed\n');
