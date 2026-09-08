// apps/web/src/tests/float_reset.test.ts
import { strict as assert } from 'node:assert';
import { resetFloat } from '../lib/float-reset';

function test_reset() {
  assert.equal(resetFloat(4), 5, '4 -> 5 on payment');
  assert.equal(resetFloat(3), 5, '3 -> 5 on payment (cure from default)');
  assert.equal(resetFloat(5), 5, 'already at 5 stays 5');
  console.log('✅ float reset: paid -> back to 5m');
}

test_reset();
console.log('\n🎉 float-reset tests passed\n');
