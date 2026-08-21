# CONTINUE — evo_02

**Date:** 2026-08-21  
**Branch:** `sprint-1-nellie-loop` (not merged, not pushed)  
**HEAD:** `89989f0`  
**Live site:** still `main`. This branch is the full website; when Nellie test-buy works, merge the whole branch.

**SSOT:** `evo_00/doc/ASSET_LOCK.md`  
**Legal pack = PDS/SA** (per horse). Site terms/privacy/FAQ are summaries only.

---

## Next action

Prove one Nellie test purchase on this branch:

1. Database with **new** tables (`00001`–`00004` in `packages/db_models/src/schema/`). Do **not** apply those to live Evolution-3.0 (old website schema; 0 holdings; no `profiles`). Use a preview/branch DB.
2. Site already has gitignored `apps/web/.env.local`: Stripe **test** keys + `PURCHASES_ENABLED=true` + Supabase URL/anon/service from vault. Do not commit it.
3. Create a test user; set `profiles.kyc_status='verified'` by hand (no Stripe Identity this sprint).
4. Run web on a **free** port (3000 is LibreChat, not this app). Last run: `pnpm exec next dev -H 0.0.0.0 -p 3010` from `apps/web`.
5. `stripe listen --forward-to localhost:<port>/api/webhooks/stripe --events checkout.session.completed` then rewrite `STRIPE_WEBHOOK_SECRET` / `STRIPE_CHECKOUT_WEBHOOK_SECRET` in `.env.local` from the printed `whsec_`.
6. Login → `/horses/nellie` → pay `4242…` → `/mystable` shows the row.

Docs: `docs/plans/SPRINT1_RESULT.md`

---

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
