// apps/web/src/tests/stripe_subscription.test.ts
import { strict as assert } from 'node:assert';
import { buildSubscriptionCheckoutParams } from '../lib/stripe-subscription';

function test_builds_subscription_params() {
  const params = buildSubscriptionCheckoutParams({
    userEmail: 'investor@example.com',
    legalName: 'Lady Ketchikan (NZ)',
    units: 2.5,
    monthlyKeepUnitNzd: 76,
    joinFloatUnitNzd: 380,
    origin: 'https://www.evolutionstables.nz',
    metadata: { horse_slug: 'nellie', units: '2.5', user_id: 'u1', reservation_id: 'r1', pds_hash: 'a'.repeat(64), sa_hash: 'b'.repeat(64), owner_name: 'B.A.X Bloodstock' },
  });

  assert.equal(params.get('mode'), 'subscription', 'mode is subscription');
  assert.equal(params.get('customer_email'), 'investor@example.com');
  assert.equal(params.get('line_items[0][price_data][recurring][interval]'), 'month');
  assert.equal(params.get('line_items[0][price_data][unit_amount]'), String(76 * 100));
  assert.equal(params.get('line_items[0][quantity]'), '1');
  assert.equal(params.get('subscription_data[add_invoice_items][0][price_data][unit_amount]'), String(380 * 100));
  assert.equal(params.get('subscription_data[add_invoice_items][0][quantity]'), '1');
  assert.equal(params.get('metadata[horse_slug]'), 'nellie');
  assert.equal(params.get('metadata[units]'), '2.5');
  console.log('✅ subscription params: recurring keep + one-time join float + metadata');
}

test_builds_subscription_params();
console.log('\n🎉 stripe-subscription tests passed\n');
