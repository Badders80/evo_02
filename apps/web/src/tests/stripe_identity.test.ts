import { strict as assert } from 'node:assert';
import { createHash } from 'node:crypto';
import { canonicalReportJson } from '../lib/stripe-identity';
import {
  isIdentityEvent,
  evaluateIdentityGates,
  computeAuditDigest,
} from '../lib/identity-webhook';

/**
 * 007 T3 chunk 3: Stripe Identity webhook handling.
 * Event routing, digest math, gate logic. (401 guards on /api/kyc/* are
 * requireUserId's HttpError(401) — covered by the nellie_loop tests' shape.)
 */

function test_event_routing() {
  assert.ok(isIdentityEvent('identity.verification_session.verified'), 'verified is identity event');
  assert.ok(isIdentityEvent('identity.verification_session.canceled'), 'canceled is identity event');
  assert.ok(isIdentityEvent('identity.verification_session.requires_input'), 'requires_input is identity event');
  assert.ok(!isIdentityEvent('checkout.session.completed'), 'checkout passthrough unaffected');
  assert.ok(!isIdentityEvent('charge.succeeded'), 'unrelated events unaffected');
  console.log('✅ event routing: identity events recognized, checkout events untouched');
}

function test_digest_math() {
  // Deterministic canonical JSON → stable lowercase 64-hex digest.
  const report = { document: { dob: { day: 1, month: 1, year: 1990 }, issuing_country: 'NZ' }, type: 'document' };
  const a = canonicalReportJson({ verification_report: report });
  const b = canonicalReportJson({ verification_report: { type: 'document', document: { issuing_country: 'NZ', dob: { year: 1990, month: 1, day: 1 } } } });
  assert.equal(a, b, 'canonical JSON is key-order independent');
  assert.ok(!a.includes(' '), 'canonical JSON has no whitespace');

  const digest = computeAuditDigest({ verification_report: report });
  assert.match(digest, /^[a-f0-9]{64}$/, 'digest is lowercase 64-hex (chk_kyc_audit_digest_sha256)');
  const expected = createHash('sha256').update(a).digest('hex');
  assert.equal(digest, expected, 'digest equals sha256 of canonical JSON');
  console.log('✅ digest math: deterministic, canonical, 64-hex');
}

function test_gate_logic() {
  const dobFor = (age: number) => {
    const d = new Date();
    return { year: d.getUTCFullYear() - age, month: d.getUTCMonth() + 1, day: d.getUTCDate() };
  };

  // Pass: NZ + 18+
  assert.equal(
    evaluateIdentityGates({ document: { dob: dobFor(30), issuing_country: 'NZ' } }),
    null,
    'NZ 30-year-old passes'
  );
  // Exactly 18 today → pass (calendar-accurate)
  assert.equal(
    evaluateIdentityGates({ document: { dob: dobFor(18), issuing_country: 'NZ' } }),
    null,
    'NZ 18th-birthday passes'
  );
  // One day shy of 18 (birthday is tomorrow) → reject
  const almost = dobFor(18);
  almost.day += 1;
  assert.equal(
    evaluateIdentityGates({ document: { dob: almost, issuing_country: 'NZ' } }),
    'UNDER_18',
    'day-before-18th rejects'
  );
  // Under 18
  assert.equal(
    evaluateIdentityGates({ document: { dob: dobFor(16), issuing_country: 'NZ' } }),
    'UNDER_18',
    '16-year-old rejects'
  );
  // Non-NZ
  assert.equal(
    evaluateIdentityGates({ document: { dob: dobFor(30), issuing_country: 'US' } }),
    'NON_NZ_RESIDENCY',
    'US document rejects'
  );
  // Alpha-3 defensively accepted
  assert.equal(
    evaluateIdentityGates({ document: { dob: dobFor(30), issuing_country: 'NZL' } }),
    null,
    'alpha-3 NZL accepted'
  );
  // Missing pieces
  assert.equal(evaluateIdentityGates(null), 'MISSING_REPORT', 'null report rejects');
  assert.equal(evaluateIdentityGates({ document: {} }), 'MISSING_DOB', 'missing dob rejects');
  assert.equal(
    evaluateIdentityGates({ document: { dob: { year: 1990, month: 13, day: 1 } } }),
    'INVALID_DOB',
    'month=13 → invalid ISO → INVALID_DOB'
  );
  console.log('✅ gate logic: NZ+18 pass, under-18/non-NZ/missing reject, alpha-3 tolerated');
}

test_event_routing();
test_digest_math();
test_gate_logic();

console.log('\n🎉 All @evo/web Stripe Identity tests passed successfully!\n');
