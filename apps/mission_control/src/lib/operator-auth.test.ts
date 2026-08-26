import assert from 'node:assert/strict';
import * as op from './operator-auth';
import { createHash } from 'node:crypto';

function setupEnv(token?: string | null) {
  const prev = process.env.OPERATOR_API_TOKEN;
  if (token === undefined || token === null) {
    delete process.env.OPERATOR_API_TOKEN;
  } else {
    process.env.OPERATOR_API_TOKEN = token;
  }
  return prev;
}

function resetEnv(prev: string | undefined | null) {
  if (prev === undefined || prev === null) {
    delete process.env.OPERATOR_API_TOKEN;
  } else {
    process.env.OPERATOR_API_TOKEN = prev;
  }
}

function sha256hex(s: string): string {
  return createHash('sha256').update(s).digest('hex');
}

// --- isValidOperatorToken tests ---

// correct token → true
const p1 = setupEnv('my-secret-token');
assert.strictEqual(op.isValidOperatorToken('my-secret-token'), true);
resetEnv(p1);

// wrong token → false
const p2 = setupEnv('my-secret-token');
assert.strictEqual(op.isValidOperatorToken('wrong-token'), false);
resetEnv(p2);

// empty → false
const p3 = setupEnv('my-secret-token');
assert.strictEqual(op.isValidOperatorToken(''), false);
resetEnv(p3);

// env unset → fail-closed false
const p4 = setupEnv('my-secret-token');
delete process.env.OPERATOR_API_TOKEN;
assert.strictEqual(op.isValidOperatorToken('anything'), false);
resetEnv(p4);

// non-string → false
const p5 = setupEnv('my-secret-token');
assert.strictEqual(op.isValidOperatorToken(undefined as never), false);
assert.strictEqual(op.isValidOperatorToken(null as never), false);
assert.strictEqual(op.isValidOperatorToken(123 as never), false);
resetEnv(p5);

console.log('✅ operator-auth: isValidOperatorToken tests PASSED');

// --- cookie derivation tests ---

// deterministic sha256 → 64-char lowercase hex
const p6 = setupEnv('token-123');
const cookie1 = op.operatorCookieFor('token-123');
assert.strictEqual(typeof cookie1.value, 'string');
assert.strictEqual(cookie1.value.length, 64);
assert.match(cookie1.value, /^[0-9a-f]{64}$/, 'must be lowercase hex');
assert.strictEqual(cookie1.value, sha256hex('token-123'));
resetEnv(p6);

// differs per token
const p7 = setupEnv('token-abc');
const a = op.operatorCookieFor('token-abc');
const b = op.operatorCookieFor('token-def');
assert.strictEqual(a.value, sha256hex('token-abc'));
assert.strictEqual(b.value, sha256hex('token-def'));
assert.notStrictEqual(a.value, b.value);
resetEnv(p7);

// never equals raw token
const p8 = setupEnv('my-token');
const cookie2 = op.operatorCookieFor('my-token');
assert.notStrictEqual(cookie2.value, 'my-token');
assert.strictEqual(cookie2.value, sha256hex('my-token'));
resetEnv(p8);

console.log('✅ operator-auth: cookie derivation tests PASSED');

console.log('🎉 All operator-auth tests PASSED!');