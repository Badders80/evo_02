// apps/web/src/tests/float_decay.test.ts
import { strict as assert } from 'node:assert';
import { decayFloat, FloatState } from '../lib/float-decay';

function test_decay() {
  assert.equal(decayFloat(5), 4, '5 -> 4');
  assert.equal(decayFloat(4), 3, '4 -> 3');
  assert.equal(decayFloat(3), 3, 'floor at 3 (default, not below)');
  assert.equal(decayFloat(2), 3, 'never below 3');
  console.log('✅ float decay: 5->4->3, floor at 3');
}

function test_state() {
  assert.equal(FloatState.fromMonths(5), 'healthy');
  assert.equal(FloatState.fromMonths(4), 'in_fault');
  assert.equal(FloatState.fromMonths(3), 'default');
  console.log('✅ float state: healthy / in_fault / default');
}

test_decay();
test_state();
console.log('\n🎉 float-decay tests passed\n');
