# CONTINUE — evo_02

**Date:** 2026-08-21  
**Branch:** `sprint-1-nellie-loop` (not merged, not pushed)  
**HEAD:** `89989f0`  
**Live site:** still `main`. This branch is the full website; when Nellie test-buy works, merge the whole branch.

**SSOT:** `evo_00/doc/ASSET_LOCK.md`  
**Legal pack = PDS/SA** (per horse). Site terms/privacy/FAQ are summaries only.

**Deferred (2026-08-25):** Brand triad alignment in `apps/web` — old triad still present in footer.tsx (3 gold lines) + layout.tsx meta description. Locked wording: *Grounded in Heritage. / Evolved Through Tradition. / Own the Experience.* Canonical: `evo_00/doc/IDENTITY.md` (ADR-007) + `@evo/brand_dna/identity`. Swap all together before cutover.

---

## Next action

Finish the **local** Nellie test-card buy. Local Supabase is already up. Next + `stripe listen` were killed mid-run. Do not touch live Evolution-3.0.

Resume:

1. `cd evo_02 && supabase status` (must be healthy).
2. From `apps/web`: `pnpm exec next dev -H 0.0.0.0 -p 3010` (3000 is LibreChat).
3. `stripe listen --forward-to localhost:3010/api/webhooks/stripe --events checkout.session.completed` then paste printed `whsec_` into gitignored `apps/web/.env.local` (`STRIPE_WEBHOOK_SECRET` + `STRIPE_CHECKOUT_WEBHOOK_SECRET`) and restart Next if the secret changed.
4. Login at `http://127.0.0.1:3010/login?next=/horses/nellie` — Password tab — test user `nellie.buyer@example.com` (KYC already `verified` on local DB).
5. Join Syndicate → Stripe test card `4242 4242 4242 4242` / any future expiry / any CVC / NZ.
6. **Done when** `/mystable` shows a Nellie holding row with real 64-hex PDS/SA hashes (not a demo card). SQL check: `select * from holdings;` on local `:54322`.

Do **not** apply `00001`–`00004` to Evolution-3.0. Merge/push only after this proof.

Full procedure: section “Nellie test-buy plan” below. Code notes: `docs/plans/SPRINT1_RESULT.md`.

---

## Nellie test-buy plan (what we were executing)

**Goal:** one paid Nellie row in **local** new-schema DB. Not production. Not Firebase.

**Why local:** live Evolution-3.0 is old schema (`inventory`/`holdings`/`leads`, no `profiles`). New RPCs (`reserve_campaign_shares`, `consume_campaign_reservation`) and `profiles.kyc_status` do not exist there. Applying `00001`–`00004` to it is forbidden this sprint.

1. **Local DB** — `supabase init` in `evo_02`; copy `00001` `00002` `00004` plus inventory-only seed (no investor PII from `00003`). Quote `"placing"` (Postgres reserved). `supabase start`. Point gitignored `apps/web/.env.local` at `http://127.0.0.1:54321` + local anon/service. Keep Stripe **test** key + `PURCHASES_ENABLED=true`.
2. **Buyer stub** — admin-create `nellie.buyer@example.com`; `update profiles set kyc_status='verified'` (no Stripe Identity).
3. **Servers** — Next `:3010`; `stripe listen` → `whsec_` into `.env.local`.
4. **Click path** — login (Password) → `/horses/nellie` → Join Syndicate (1%) → Checkout `4242…` → webhook `checkout.session.completed` HMAC → insert `holdings` + `consume_campaign_reservation`.
5. **Proof** — `/mystable` row + `select slug, status from inventory where slug='nellie'; select user_id, horse_id, stake_percentage, signed_pds_hash from holdings;`.
6. **After proof** — merge branch to `main` is a **later** decision. Not this step.

**Already done (interrupted):** local stack healthy (`:54321`/`:54322`); Nellie listed, 10 shares available; test user KYC verified; `.env.local` local; `placing` quoted in `00001`. Next + stripe listen were killed. **Buy not run. Holdings still 0.**

## DONE — Nellie E2E walked 2026-08-23 ✅

Full click-path executed via headless Chromium: login `nellie.buyer@example.com` → `/horses/nellie` → Join Syndicate 1% → Stripe test checkout `4242…` → redirect `/mystable?checkout=success`.

**Bug found & fixed:** webhook 500'd with `permission denied for table events`. Root cause: RLS policies existed for `service_role` but base table GRANTs are a separate privilege layer and were missing. Fixed live via SQL grants, then codified in `00001_initial_schema.sql` (service_role DML grants on profiles/holdings/events/checkout_reservations/inventory/race_results).

**Proof:**
- `holdings`: 1 row — user `7b1f62e2…`, horse `11111111-…-0001`, stake 1.00%, status active, real PDS hash `fe5238ae66c266a86db7…`, SA hash `7ffe726a2fece56877c3…`
- `/mystable`: Active Syndicates 1 Thoroughbred, $380 float held, $76/mo keep
- Idempotency proven: event replay (`stripe events resend`) deduped, `events.processed = t`
- Cap table: nellie shares_available 10 → 9
- `pnpm turbo run typecheck test` green after fix (16/16)

**Next:** merge branch to `main` is a later decision (see Locked).

## Done on this branch

- Nellie loop in code: no guest, KYC stub, `reserve_campaign_shares`, Stripe Checkout, HMAC webhook, real hashes, MyStable from DB. Kimi audit `36a4790`. Tests: `pnpm typecheck && pnpm test` green at audit.
- Public SEO: sitemap (FAQ/privacy/terms/learn + horse about), OG `public/og/default.png`, JSON-LD. `4f9e5b9`.
- Hydration warning on `<body>`: `89989f0`.
- Hub rule: this chat plans/dispatches; Kimi at end of code slices; no production drip.

---

## Locked (don’t reopen)

- One site. Branch replaces `main` later — do not splice pages into a separate landing.
- Nellie only for buy. Others visible, not buyable. No all-horses loop. No MC restyle. No `:3005` cloner.
- Prudentia + Hotta: who-owns-what is locked in seed/MC (5% each, fully sold). Payouts = **v2**. First Gear = KYC names only, no stakes.
- Tokinvest horses = one-time/`upfront`. New DSLs = `subscription_float`.

---

## Do not

- Merge/push until the test card path works.
- Apply `00001`–`00004` to Evolution-3.0.
- Restart the killed `:3010` / `stripe listen` unless the human asks.
- Treat website Terms as the legal pack.
