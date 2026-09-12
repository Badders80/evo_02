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

import { getAllCampaigns, getCompiledLegalPackForCampaign, isCheckoutOpen, areLegalDocsApproved } from '../lib/horses-data';
import { NELLIE_INVENTORY_ID, getInventoryId } from '../lib/inventory-ids';
import {
  HttpError,
  assertCampaignBuyable,
  assertCampaignSettleable,
  assertCheckoutCampaign,
  assertLegalDocsApproved,
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
  // Founder-locked 2026-09-10: Manolo's DSL walk completed (3/3 docs approved) but
  // the flip was reverted same-day — checkout isn't live yet, so all stay brochure.
  const open = (await getAllCampaigns()).filter(isCheckoutOpen).map((c: { slug: string }) => c.slug);
  assert.deepEqual(open, []);
  assert.rejects(async () => assertCheckoutCampaign('tml-x-yearn'), (err: unknown) => err instanceof HttpError && (err as HttpError).status === 409);
  assert.rejects(async () => assertCheckoutCampaign('nellie'), (err: unknown) => err instanceof HttpError && (err as HttpError).status === 409);
  assert.equal(getInventoryId('nellie'), NELLIE_INVENTORY_ID);
  console.log('✅ no campaign is buyable (brochure mode)');
}

{
  // Per-horse checkout gate (2026-09-12, replaces assertNellieOnly): a horse is
  // buyable ONLY when its campaign is open AND all three legal docs are approved.
  // Tested on staged campaign slices (pure predicates) so no DB flip is needed —
  // the DB stays brochure. The three workflow slugs are nellie (3/3 docs approved
  // in seed), tml-x-yearn and i-stole-a-manolo.
  const buyable = (slug: string) => ({
    slug,
    listingStatus: 'listed' as const,
    termSheetStatus: 'approved' as const,
    pdsStatus: 'approved' as const,
    saStatus: 'approved' as const,
  });
  for (const slug of ['nellie', 'tml-x-yearn', 'i-stole-a-manolo']) {
    const c = buyable(slug);
    assert.equal(isCheckoutOpen(c), true, `${slug} must be open when listed`);
    assert.equal(areLegalDocsApproved(c), true, `${slug} must have 3/3 docs approved`);
    assertCampaignBuyable(c); // must not throw
  }
  // (b) wrong status → 409 (the old pin's code shape: a non-buyable horse 409s).
  assert.throws(
    () => assertCampaignBuyable({ ...buyable('nellie'), listingStatus: 'coming_soon' }),
    (err: unknown) => err instanceof HttpError && (err as HttpError).status === 409 && (err as HttpError).code === 'CHECKOUT_CLOSED'
  );
  // (c) legal-lock rule: listed but one doc NOT approved → 409 LEGAL_LOCK.
  assert.throws(
    () => assertCampaignBuyable({ ...buyable('nellie'), saStatus: 'draft' }),
    (err: unknown) => err instanceof HttpError && (err as HttpError).status === 409 && (err as HttpError).code === 'LEGAL_LOCK'
  );
  assert.throws(
    () => assertLegalDocsApproved({ termSheetStatus: 'approved', pdsStatus: 'pending', saStatus: 'approved' }),
    (err: unknown) => err instanceof HttpError && (err as HttpError).status === 409 && (err as HttpError).code === 'LEGAL_LOCK'
  );
  // (d) unknown slug → 404 CAMPAIGN_NOT_FOUND through the resolve+gate path.
  assert.rejects(async () => assertCheckoutCampaign('__no-such-horse__'), (err: unknown) => err instanceof HttpError && (err as HttpError).status === 404);
  console.log('✅ per-horse gate: buyable slugs pass, closed / legal-lock / unknown fail');
}

{
  // Settlement gate (founder option A, 2026-09-12): the webhook settles on
  // LEGAL state — RAW DB status + 3/3-docs lock — never the availability-
  // derived sold-out flag. A buyer's own purchase can zero shares_available,
  // flipping a 'listed' row to DERIVED 'fully_subscribed' before the webhook
  // runs; that display flag must not 409 a paid, settled charge. Staged
  // campaign slices (pure predicates) — no DB flip.
  const soldOutButRawListed = {
    slug: 'nellie',
    listingStatus: 'fully_subscribed' as const, // DERIVED: what the catalog/UI sees
    rawListingStatus: 'listed' as const, // RAW DB status: what the webhook settles on
    termSheetStatus: 'approved' as const,
    pdsStatus: 'approved' as const,
    saStatus: 'approved' as const,
  };
  // (a) RAW 'listed' + 3/3 docs approved → the settlement gate PASSES even
  //     when the derived status is fully_subscribed (the sold-out 409 bug).
  assertCampaignSettleable(soldOutButRawListed); // must not throw
  // (d) the derived status is untouched: create-session/catalog still see a
  //     never-buyable horse — isCheckoutOpen false and the buyable gate 409s.
  assert.equal(isCheckoutOpen(soldOutButRawListed), false);
  assert.throws(
    () => assertCampaignBuyable(soldOutButRawListed),
    (err: unknown) =>
      err instanceof HttpError && (err as HttpError).status === 409 && (err as HttpError).code === 'CHECKOUT_CLOSED'
  );
  // (b) RAW status not purchasable (not 'listed') → settlement 409 CHECKOUT_CLOSED.
  assert.throws(
    () => assertCampaignSettleable({ ...soldOutButRawListed, rawListingStatus: 'coming_soon' as const }),
    (err: unknown) =>
      err instanceof HttpError && (err as HttpError).status === 409 && (err as HttpError).code === 'CHECKOUT_CLOSED'
  );
  // (c) legal-lock: RAW 'listed' but a doc not approved → settlement 409 LEGAL_LOCK.
  assert.throws(
    () => assertCampaignSettleable({ ...soldOutButRawListed, saStatus: 'draft' }),
    (err: unknown) =>
      err instanceof HttpError && (err as HttpError).status === 409 && (err as HttpError).code === 'LEGAL_LOCK'
  );
  console.log('✅ settlement gate settles on raw status + 3/3 docs; derived sold-out stays a display/start block');
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
    // Review-branch preview constant (PREVIEW_USER_EMAIL) is flag-guarded and
    // deleted with the branch — allowed only where the preview guard exists.
    const previewGuarded = src.includes('PREVIEW_USER_EMAIL') && src.includes('isWorkflowPreview');
    assert.equal(src.includes('investor@evolutionstables.nz') && !previewGuarded, false, 'demo email leftover');
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
