// apps/web/src/tests/subscription_webhook.test.ts
import { strict as assert } from 'node:assert';
import { isSubscriptionEvent, holdingStatusForSubscription } from '../lib/subscription-webhook';

function test_event_routing() {
  assert.ok(isSubscriptionEvent('customer.subscription.deleted'));
  assert.ok(isSubscriptionEvent('customer.subscription.updated'));
  assert.ok(!isSubscriptionEvent('checkout.session.completed'));
  assert.ok(!isSubscriptionEvent('identity.verification_session.verified'));
  console.log('✅ subscription event routing');
}

function test_status_mapping() {
  assert.equal(holdingStatusForSubscription('active'), 'active');
  assert.equal(holdingStatusForSubscription('trialing'), 'active');
  assert.equal(holdingStatusForSubscription('canceled'), 'cancelled');
  assert.equal(holdingStatusForSubscription('unpaid'), 'paused');
  assert.equal(holdingStatusForSubscription('past_due'), 'paused');
  assert.equal(holdingStatusForSubscription('paused'), 'paused');
  assert.equal(holdingStatusForSubscription('incomplete_expired'), 'cancelled');
  console.log('✅ subscription status → holding status mapping');
}

test_event_routing();
test_status_mapping();
console.log('\n🎉 subscription-webhook tests passed\n');
