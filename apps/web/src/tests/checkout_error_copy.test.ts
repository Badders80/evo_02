import { strict as assert } from 'node:assert';
import {
  CHECKOUT_ERROR_COPY,
  CHECKOUT_ERROR_UNKNOWN,
  investorCheckoutError,
} from '../lib/nellie-loop';

/**
 * Chunk-5 (f10): server code → investor copy mapping (spec purchase-content-spec.md:215-228).
 * Investor must NEVER see a raw code or raw server string.
 */
function test_error_copy_mapping() {
  // Every locked spec row maps to the exact locked copy.
  const expect = [
    ['KYC_REQUIRED', 'Identity verification is required before checkout. This is a one-time check under New Zealand law.'],
    ['INVALID_STAKE', 'Stake must be a multiple of 0.5%'],
    ['CAMPAIGN_NOT_FOUND', 'This campaign is no longer available.'],
    ['CHECKOUT_CLOSED', 'This campaign is no longer open for subscription.'],
    ['RESERVE_FAILED', 'That stake was just acquired by another co-owner. Available stake is now 5%.'],
    ['PURCHASES_DISABLED', 'Checkout is temporarily unavailable — please try again shortly.'],
    ['SUPABASE_NOT_CONFIGURED', 'Checkout is temporarily unavailable — please try again shortly.'],
    ['RESERVE_RPC_ERROR', 'Checkout is temporarily unavailable — please try again shortly.'],
    ['STRIPE_DECLINE', 'Your payment could not be processed by your card provider. Please try a different card, or contact your bank.'],
  ];
  for (const [code, copy] of expect) {
    const step = code === 'INVALID_STAKE' ? 0.5 : undefined;
    const max = code === 'RESERVE_FAILED' ? 5 : undefined;
    assert.equal(investorCheckoutError(code, 'fallback', { step, max }), copy, `code ${code}`);
  }

  // Unknown code → safe generic copy, NEVER the code or a raw server string (audit WARN-b).
  assert.equal(
    investorCheckoutError('MYSTERY_CODE', 'Raw server detail that must never surface', {}),
    CHECKOUT_ERROR_UNKNOWN,
    'unknown code → generic investor copy'
  );
  // Raw internal detail (the dev kill-switch wording) must never surface.
  assert.ok(
    !investorCheckoutError('PURCHASES_DISABLED', 'fallback').includes('PURCHASES_DISABLED'),
    'raw code never surfaces'
  );
  assert.ok(!investorCheckoutError('PURCHASES_DISABLED', 'fallback').includes('fallback'), 'server fallback never surfaces');
  // No code at all → generic investor copy, never the raw string.
  assert.equal(investorCheckoutError(null, 'Raw server string'), CHECKOUT_ERROR_UNKNOWN, 'null code → generic copy');
  assert.equal(investorCheckoutError(undefined, 'Raw server string'), CHECKOUT_ERROR_UNKNOWN, 'undefined code → generic copy');

  console.log('✅ f10: 7-code Stripe error→copy mapping (9 codes incl. decline) exact-match + fallback guard');
}

/**
 * Chunk-5 (f9): the map's investor copy is whitelist-clean — no exclamation marks,
 * British English, no raw server jargon leaking into locked copy.
 */
function test_whitelist() {
  const banned = [/!/, /\bunits\b/i, /\bPURCHASES_DISABLED\b/, /\bINVALID_STAKE\b/, /\bSUPABASE\b/, /\bRESERVE\b/i, /\bStripe error\b/i];
  for (const [code, copy] of Object.entries(CHECKOUT_ERROR_COPY)) {
    for (const pattern of banned) {
      assert.ok(!pattern.test(copy), `copy for '${code}' must not match ${pattern}`);
    }
  }
  console.log('✅ f10: locked investor copy is whitelist-clean (no codes, no banned terms, no !)');
}

test_error_copy_mapping();
test_whitelist();

console.log('\n🎉 All @evo/web checkout error-copy mapping tests passed successfully!\n');
