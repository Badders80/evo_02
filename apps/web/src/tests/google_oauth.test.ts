import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  buildOAuthState,
  getGoogleOAuthConfig,
  newNoncePair,
  parseOAuthState,
  resolveRedirectUri,
  safeEqual,
} from '../lib/google-oauth';

// 1. Nonce pair: hash(raw) === hashed, raw never leaks the hash, unique per call
const a = newNoncePair();
const b = newNoncePair();
assert.strictEqual(createHash('sha256').update(a.raw).digest('hex'), a.hashed);
assert.notStrictEqual(a.raw, a.hashed);
assert.notStrictEqual(a.raw, b.raw);

// 2. safeEqual: equal strings pass, differing/length-mismatched fail
assert.strictEqual(safeEqual('abc', 'abc'), true);
assert.strictEqual(safeEqual('abc', 'abd'), false);
assert.strictEqual(safeEqual('abc', 'abcd'), false);

// 3. State roundtrip: "<csrfHash>.<next>" survives encode/parse
const state = buildOAuthState('deadbeef', '/horses/nellie');
assert.deepStrictEqual(parseOAuthState(state), { csrfHash: 'deadbeef', next: '/horses/nellie' });

// 4. Legacy/no-dot state parses with next=null
assert.deepStrictEqual(parseOAuthState('deadbeef'), { csrfHash: 'deadbeef', next: null });

// 5. Config gate: absent env -> null; present env -> parsed with override
delete process.env.GOOGLE_OAUTH_CLIENT_ID;
delete process.env.GOOGLE_OAUTH_CLIENT_SECRET;
delete process.env.GOOGLE_OAUTH_REDIRECT_URI;
assert.strictEqual(getGoogleOAuthConfig(), null);
process.env.GOOGLE_OAUTH_CLIENT_ID = 'test-client-id';
process.env.GOOGLE_OAUTH_CLIENT_SECRET = 'test-secret';
assert.deepStrictEqual(getGoogleOAuthConfig(), {
  clientId: 'test-client-id',
  clientSecret: 'test-secret',
  redirectUriOverride: '',
});

// 6. Redirect URI: override wins (local shim), otherwise derived from origin
assert.strictEqual(
  resolveRedirectUri(getGoogleOAuthConfig()!, 'http://localhost:3010'),
  'http://localhost:3010/api/auth/google/callback',
);
process.env.GOOGLE_OAUTH_REDIRECT_URI = 'http://localhost:3000/api/auth/callback/google';
assert.strictEqual(
  resolveRedirectUri(getGoogleOAuthConfig()!, 'http://localhost:3010'),
  'http://localhost:3000/api/auth/callback/google',
);

console.log('✅ google-oauth: nonce pairs, safeEqual, state roundtrip, config gate, redirect override');
