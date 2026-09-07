import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Set Supabase env vars for test context. Service key loads from the app's gitignored
// .env.local (local stack only) — never hardcoded here.
import * as fs0 from 'node:fs';
const envLocalWeb = fs0.readFileSync(new URL('../../.env.local', import.meta.url), 'utf8');
const svcLine = envLocalWeb.split('\n').find((l) => l.startsWith('SUPABASE_SERVICE_ROLE_KEY='));
if (!svcLine || !svcLine.split('=').slice(1).join('=').trim()) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY missing — set it in apps/web/.env.local (local Supabase sb_secret_…)');
}
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || svcLine.split('=').slice(1).join('=').trim();
process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_URL;
process.env.SUPABASE_SERVICE_ROLE_KEY = SERVICE_KEY;

import { getAllCampaigns, getCompiledLegalPackForCampaign, isCheckoutOpen } from '../lib/horses-data';
import { NELLIE_INVENTORY_ID, getInventoryId } from '../lib/inventory-ids';
import {
  HttpError,
  assertCheckoutCampaign,
  assertNellieOnly,
  buildHoldingInsert,
  interpretConsumeResult,
  interpretReserveResult,
  isSha256Hex,
  purchasesAreEnabled,
  r2ConfigFromEnv,
  requirePaidCheckoutSession,
  requireUserId,
  requireVerifiedKyc,
  resolveLegalHashes,
  resolvePaidAmountNzd,
  stakePctToStepUnits,
  stepUnitsToStakePct,
} from '../lib/nellie-loop';
import { safeNextPath } from '../lib/safe-next-path';
import { signStripePayload, verifyStripeSignature } from '../lib/stripe-signature';

console.log('Running @evo/web Nellie loop tests...\n');

(async () => {

{
  assert.throws(() => requireUserId(null), (err: unknown) => err instanceof HttpError && err.status === 401);
  assert.throws(() => requireUserId({}), (err: unknown) => err instanceof HttpError && err.status === 401);
  assert.equal(requireUserId({ id: 'user-1' }), 'user-1');
  console.log('✅ create-session 401 without user.id');
}

{
  assert.throws(() => requireVerifiedKyc('unverified'), (err: unknown) => err instanceof HttpError && err.status === 403);
  assert.throws(() => requireVerifiedKyc(null), (err: unknown) => err instanceof HttpError && err.status === 403);
  requireVerifiedKyc('verified');
  console.log('✅ KYC stub 403 unless verified');
}

{
  assert.throws(
    () => interpretReserveResult({ success: false, error: 'INSUFFICIENT_SHARES_AVAILABLE' }, null),
    (err: unknown) => err instanceof HttpError && err.status === 409
  );
  assert.throws(
    () => interpretReserveResult(null, { message: 'rpc down' }),
    (err: unknown) => err instanceof HttpError && err.status === 503
  );
  const ok = interpretReserveResult(
    { success: true, reservation_id: 'res-1', expires_at: '2026-08-21T00:00:00Z' },
    null
  );
  assert.equal(ok.reservationId, 'res-1');
  console.log('✅ reserve_campaign_shares fail closed');
}

{
  assert.equal(purchasesAreEnabled({}), false);
  assert.equal(purchasesAreEnabled({ STRIPE_SECRET_KEY: 'sk_test' }), false);
  assert.equal(purchasesAreEnabled({ STRIPE_SECRET_KEY: 'sk_test', PURCHASES_ENABLED: 'true' }), true);
  console.log('✅ purchases gated unless Stripe key + PURCHASES_ENABLED');
}

{
  const hashes = await resolveLegalHashes('nellie');
  assert.ok(isSha256Hex(hashes.pdsHash));
  assert.ok(isSha256Hex(hashes.saHash));
  assert.ok(!hashes.pdsHash.includes('placeholder'));
  assert.ok(!hashes.saHash.includes('placeholder'));
  const campaigns = await getAllCampaigns();
  const campaign = campaigns.find((c: { slug: string }) => c.slug === 'nellie');
  assert.ok(campaign);
  const pack = getCompiledLegalPackForCampaign(campaign);
  assert.equal(pack.metadata.ownerName, campaign.owner.entity);
  assert.equal(pack.pdsHash, hashes.pdsHash);
  console.log('✅ compiled Nellie hashes are 64-hex, same ownerName as checkout');
}

{
  const holding = buildHoldingInsert({
    userId: '22222222-0000-0000-0000-000000000099',
    inventoryId: NELLIE_INVENTORY_ID,
    units: 1,
    amountPaidNzd: 380,
    monthlyKeepNzd: 76,
    pdsHash: (await resolveLegalHashes('nellie')).pdsHash,
    saHash: (await resolveLegalHashes('nellie')).saHash,
    subscriptionId: null,
  });
  assert.equal(holding.horse_id, '11111111-0000-0000-0000-000000000001');
  assert.equal(holding.signed_pds_hash.length, 64);
  assert.throws(
    () =>
      buildHoldingInsert({
        userId: 'u',
        inventoryId: NELLIE_INVENTORY_ID,
        units: 1,
        amountPaidNzd: 380,
        monthlyKeepNzd: 76,
        pdsHash: 'sha256_placeholder',
        saHash: 'sha256_placeholder',
        subscriptionId: null,
      }),
    (err: unknown) => err instanceof HttpError
  );
  console.log('✅ holdings insert shape rejects placeholder hashes');
}

{
  const payload = JSON.stringify({ id: 'evt_test', type: 'checkout.session.completed' });
  const secret = 'whsec_test';
  const header = signStripePayload(payload, secret);
  assert.equal(verifyStripeSignature(payload, header, secret), true);
  assert.equal(verifyStripeSignature(payload, header, 'wrong'), false);
  assert.equal(verifyStripeSignature(payload + 'tamper', header, secret), false);
  console.log('✅ Stripe HMAC verification');
}

{
  assert.equal(safeNextPath('/mystable'), '/mystable');
  assert.equal(safeNextPath('/horses/nellie'), '/horses/nellie');
  assert.equal(safeNextPath('https://evil.example'), '/mystable');
  assert.equal(safeNextPath('//evil.example'), '/mystable');
  console.log('✅ login ?next= is path-safe');
}

{
  // Founder-locked 2026-09-07: all live campaigns flipped to coming_soon (brochure
  // mode) — no campaign is buyable until the purchase workflows land.
  const open = (await getAllCampaigns()).filter(isCheckoutOpen).map((c: { slug: string }) => c.slug);
  assert.deepEqual(open, []);
  assert.throws(() => assertNellieOnly('tml-x-yearn'), (err: unknown) => err instanceof HttpError && err.status === 409);
  assert.rejects(async () => assertCheckoutCampaign('tml-x-yearn'), (err: unknown) => err instanceof HttpError && (err as HttpError).status === 409);
  assert.rejects(async () => assertCheckoutCampaign('nellie'), (err: unknown) => err instanceof HttpError && (err as HttpError).status === 409);
  assert.equal(getInventoryId('nellie'), NELLIE_INVENTORY_ID);
  console.log('✅ no campaign is buyable (brochure mode)');
}

{
  assert.equal(r2ConfigFromEnv({}), null);
  assert.ok(
    r2ConfigFromEnv({
      R2_ACCOUNT_ID: 'acct',
      R2_ACCESS_KEY_ID: 'key',
      R2_SECRET_ACCESS_KEY: 'secret',
      R2_BUCKET_NAME: 'vault',
    })
  );
  console.log('✅ R2 skipped unless env exists');
}

{
  const srcRoot = path.join(__dirname, '..');
  const files = [
    'app/api/checkout/create-session/route.ts',
    'app/api/webhooks/stripe/route.ts',
    'app/mystable/page.tsx',
    'components/mystable-dashboard.tsx',
    'lib/nellie-loop.ts',
  ].map((rel) => fs.readFileSync(path.join(srcRoot, rel), 'utf8'));
  for (const src of files) {
    assert.equal(src.includes('usr_guest_demo'), false, 'guest leftover');
    assert.equal(src.includes('sha256_placeholder'), false, 'placeholder hash leftover');
    assert.equal(src.includes('investor@evolutionstables.nz'), false, 'demo email leftover');
  }
  const checkout = fs.readFileSync(path.join(srcRoot, 'app/api/checkout/create-session/route.ts'), 'utf8');
  assert.ok(checkout.includes("rpc('reserve_campaign_shares'"));
  const webhook = fs.readFileSync(path.join(srcRoot, 'app/api/webhooks/stripe/route.ts'), 'utf8');
  assert.ok(webhook.includes("rpc('consume_campaign_reservation'"));
  assert.ok(webhook.includes('p_reservation_id'), 'consume must pass reservation_id');
  assert.ok(webhook.includes('WEBHOOK_SECRET_MISSING'), 'HMAC required fail-closed');
  assert.ok(!webhook.includes('catch {\n          // Fallback gracefully'));
  console.log('✅ source audit: no guest, no placeholder, RPC wired, consume fail-loud');
}

{
  assert.throws(
    () => interpretConsumeResult({ success: false, error: 'RESERVED_UNDERFLOW' }, null, false),
    (err: unknown) => err instanceof HttpError && err.status === 500
  );
  assert.throws(
    () => interpretConsumeResult({ success: true, consumed_count: 0 }, null, false),
    (err: unknown) => err instanceof HttpError && (err as HttpError).code === 'RESERVATION_MISSING'
  );
  const ok = interpretConsumeResult({ success: true, consumed_count: 1, units: 1 }, null, false);
  assert.equal(ok.consumedCount, 1);
  const replay = interpretConsumeResult({ success: true, consumed_count: 0, already_consumed: true }, null, true);
  assert.equal(replay.alreadyConsumed, true);
  requirePaidCheckoutSession({ payment_status: 'paid' });
  assert.throws(
    () => requirePaidCheckoutSession({ payment_status: 'unpaid' }),
    (err: unknown) => err instanceof HttpError && err.status === 400
  );
  assert.equal(resolvePaidAmountNzd(38000), 380);
  assert.throws(() => resolvePaidAmountNzd(undefined), (err: unknown) => err instanceof HttpError);
  assert.equal(isSha256Hex('A'.repeat(64)), false, 'kyc/legal hashes must be lowercase hex');
  console.log('✅ consume/payment fail closed');
}

function runBoundaryUnitTests() {
  // percent → step-units: 1% floor = 2 units; every half-step maps cleanly
  assert.equal(stakePctToStepUnits(1), 2);
  assert.equal(stakePctToStepUnits(1.5), 3);
  assert.equal(stakePctToStepUnits(5.5), 11);
  for (const bad of [0.75, 1.25, 3.33]) {
    assert.throws(() => stakePctToStepUnits(bad), /multiple of/, `must reject ${bad}%`);
  }
  // inverse mapping round-trips (units → pct)
  assert.equal(stepUnitsToStakePct(2), 1);
  assert.equal(stepUnitsToStakePct(3), 1.5);
  assert.equal(stepUnitsToStakePct(11), 5.5);
  // campaign-specific step honored (0.25% closed campaigns)
  assert.equal(stakePctToStepUnits(1.25, 0.25), 5);
  console.log('✅ boundary units: percent↔step-units conversions locked (1%=floor=2×0.5%)');
}

runBoundaryUnitTests();

console.log('\n🎉 All @evo/web Nellie loop tests passed successfully!');
})();
