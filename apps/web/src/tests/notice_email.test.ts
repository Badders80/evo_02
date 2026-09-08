// apps/web/src/tests/notice_email.test.ts
import { strict as assert } from 'node:assert';
import { draftNoticeEmail } from '../lib/notice-email';

function test_draft() {
  const draft = draftNoticeEmail({
    kind: 'non_payment',
    firstName: 'Alex',
    horseName: 'Lady Ketchikan (NZ)',
    floatMonthsHeld: 4,
    amountOwedNzd: 76,
    deadline: '2026-10-31',
  });
  assert.ok(draft.subject.includes('Lady Ketchikan'), 'subject names the horse');
  assert.ok(draft.body.includes('Alex'), 'body addresses the investor');
  assert.ok(draft.body.includes('4'), 'body states the float state');
  assert.ok(draft.body.includes('76'), 'body states the amount owed');
  assert.ok(draft.body.includes('2026-10-31'), 'body states the deadline');
  assert.equal(draft.autoSend, false, 'never auto-sends in the short run');
  console.log('✅ draft email: template + data, autoSend=false');
}

test_draft();
console.log('\n🎉 notice-email tests passed\n');
