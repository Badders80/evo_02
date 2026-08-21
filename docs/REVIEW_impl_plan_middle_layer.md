# Review: Middle Layer & Frontend Full-Loop Integration Plan

**Reviewer:** Agent (root)
**Date:** against live repo at `/home/evo/new/evo_02`
**Baseline verified:** `pnpm typecheck` ✅ 10/10, `pnpm test` ✅ 9/9, `pnpm --filter @evo/web build` ✅

---

## Verdict

**Approve the direction, but the plan needs 4 hardening edits before implementation.** The objective is correct, the existing DB concurrency primitives are well-designed, and the frontend scaffolding is mostly in place. The main risks are: (1) the atomic reservation RPC is not actually wired into the current checkout flow, (2) guest/demo mode will break the RPC's foreign-key assumptions, (3) vault responsibilities are misattributed, and (4) the test harness needs a mock/live decision.

---

## What's already in place and solid

1. **Database concurrency engine exists.** `packages/db_models/src/schema/00002_cap_table_and_reservations.sql` defines `reserve_campaign_shares()` (row-lock, 15-min TTL, idempotency) and `release_expired_reservations()` with correct `75/25` and `5×M` invariants enforced elsewhere.
2. **Frontend pages exist.** Storefront (`/`), PDP (`/horses/[slug]`), About (`/horses/[slug]/about`), MyStable (`/mystable`), Login, Checkout, Webhook, and Legal Download routes are all present.
3. **Legal engine integration exists.** `apps/web/src/lib/horses-data.ts` already computes compiled legal packs with SHA-256 hashes via `@evo/legal_engine`.
4. **Vault storage exists.** `@evo/storage/vault` provides R2 upload + presigned download helpers. No need for a new `legal_engine/src/vault.ts`.
5. **Pricing numbers in the plan are correct:** Nellie $76/month, Mulan $65/month (`ceil(wholesale × 1.05 × 1.03) × 0.01`).

---

## 🔴 Must-fix before implementation

### M1. Checkout route does NOT use the atomic RPC today
`apps/web/src/app/api/checkout/create-session/route.ts` currently does this:
```ts
await adminClient.from('checkout_reservations').insert({ ... });
```
It never decrements `inventory.shares_available`. The 15-minute lock is therefore **not preventing over-subscription** — it just logs intent.

**Required fix:** replace the direct insert with a call to `reserve_campaign_shares()`.

**Two blockers to resolve:**
- **A. horseSlug → inventory_id mapping.** The RPC takes a UUID `p_inventory_id`. The web `CAMPAIGNS_DATA` only has `slug`. The SQL seed (00003) assigns fixed UUIDs to inventory rows for Nellie, Mulan, Prudentia, etc. You must either:
  - add `inventoryId` to `HorseCampaign` in `horses-data.ts`, or
  - add a lookup RPC/table `get_inventory_id_by_slug(p_slug UUID)`.
  The plan doesn't mention this mapping.
- **B. Authenticated user UUID.** The RPC inserts into `checkout_reservations(user_id)` with a FK to `profiles(id)`. It also validates `auth.uid() = p_user_id`. The current checkout route uses `userId = user?.id ?? 'usr_guest_demo'`, which is **not a valid UUID/profile**. The code catches the DB error and silently continues, so reservation never actually works. If you wire the real RPC, guest checkout will fail loudly. You must either:
  - require auth before checkout (recommended), or
  - create a deterministic guest profile row with a real UUID and use that.

### M2. Webhook legal-pack storage needs a clear contract
The plan says the webhook should "compile the legal pack and save SHA-256 stamped PDS and SA records." Currently `create-session` already pre-compiles the pack and passes `pds_hash`/`sa_hash` in Stripe metadata. Recompiling in the webhook is safe because the compiler is deterministic, but you should clarify:
- **Where do the documents live?** `holdings` already stores `signed_pds_hash` and `signed_sa_hash`. For the full document bytes, use `@evo/storage/vault` (R2). The plan references `packages/legal_engine/src/vault.ts` — **that file does not exist**. Vault is in `@evo/storage`.
- **Recommended contract:** write the holding record to Supabase with hashes; upload the rendered PDS/SA Markdown/PDF to R2 with key `{horse_slug}/{user_id}/{pdsHash}.md`. MyStable downloads via presigned URL or the existing `/api/legal/download` route.

### M3. Test file location is outside the TypeScript project
`apps/web/tests/full_loop_simulation.test.ts` will not be picked up by `tsc` because `apps/web/tsconfig.json` includes only `src/**/*` and `.next/types`. You must either:
- add `"tests/**/*.ts"` to `include`, or
- place the test under `apps/web/src/tests/`.

### M4. Full-loop simulation needs a mock/live decision
The plan says the test executes Supabase RPC + Stripe webhook + legal compilation. Running this against a real Supabase project requires a test database, service role key, and Stripe test secret. The current `pnpm test` runs entirely offline (SQL file validation + unit tests). The plan doesn't specify the environment for the full-loop test.

**Recommended approach:** make the test a **mock-based integration test** by default:
- Mock `reserve_campaign_shares` to return a fake reservation.
- Mock Stripe webhook payload.
- Assert that `holdings` insert shape, legal pack hashes, and cap-table math are correct.
This keeps the test runnable in CI without secrets. Add an optional `E2E_SUPABASE_URL` live-mode flag for manual runs.

---

## 🟡 Should-fix / clarify

### S1. Storefront "From $M/month" is already dynamic
The current `page.tsx` computes `pricing.monthlyKeepUnitNzd` per campaign, so the "$76" / "$65" pills will appear automatically. No code change needed unless you want to hard-code them (not recommended).

### S2. Local image resolution
The plan references `01_hero.png` and "local image resolution." I did not verify that these assets exist in the repo. If they are missing, the SSG build will still pass but images will 404 at runtime. Confirm assets before implementing.

### S3. MyStable "real-time" scope
`/mystable` currently has hard-coded demo content (yard memos, audio player, Nellie PDS/SA downloads). The plan wants real investor holdings. This requires fetching from `holdings` table by `user_id`. Clarify whether this milestone makes MyStable fully data-driven or just wires the contract download vault.

### S4. Stripe SDK refactor
The current checkout uses raw `fetch` to Stripe. The plan proposes a new `stripe-server.ts` using the Stripe SDK. This is a nice refactor but not required to close the loop. If you do it, keep the existing fallback for missing `STRIPE_SECRET_KEY` so local dev still works.

---

## Suggested revised verification plan

```bash
# 1. Green floor (offline)
cd /home/evo/new/evo_02 && pnpm typecheck && pnpm test

# 2. Web production build
cd /home/evo/new/evo_02 && pnpm --filter @evo/web build

# 3. Full-loop mock test (runnable in CI, no secrets)
cd /home/evo/new/evo_02 && pnpm --filter @evo/web exec tsx src/tests/full_loop_simulation.test.ts

# 4. Optional live e2e (requires env)
E2E_SUPABASE_URL=... E2E_SERVICE_ROLE=... STRIPE_TEST_SECRET=... pnpm --filter @evo/web exec tsx src/tests/full_loop_simulation.test.ts --live
```

---

## Bottom line

The plan is directionally correct and the pieces mostly exist. Land M1–M4 before writing code:
1. Map `horseSlug` → `inventory_id` and call `reserve_campaign_shares` from checkout.
2. Decide guest-auth strategy (require login or real guest profile UUID).
3. Use `@evo/storage/vault` (not a new `legal_engine/src/vault.ts`) and define the DB + R2 contract.
4. Put the test under `src/tests/` or update tsconfig, and make it mock-first.

With those four edits, implementation is straightforward.
