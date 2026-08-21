# Sprint 1 result — Nellie loop

**Branch:** `sprint-1-nellie-loop`  
**Not done:** merge, push, Vercel production, Mission Control, other-horse checkout, live SQL apply.

## Files changed

- `apps/web/src/app/api/checkout/create-session/route.ts` — 401 without `user.id`; KYC 403; `reserve_campaign_shares` RPC; no guest; 503 if Stripe/`PURCHASES_ENABLED` missing.
- `apps/web/src/app/api/webhooks/stripe/route.ts` — HMAC when secret set; compiled 64-hex hashes; holdings insert fail-loud; `consume_campaign_reservation`; R2 only if env set.
- `apps/web/src/components/pricing-card.tsx` — 401 → `/login?next=`; 403 message.
- `apps/web/src/middleware.ts` — unauthenticated `/mystable` → `/login?next=/mystable`.
- `apps/web/src/app/login/page.tsx` + `auth/callback/route.ts` — honor safe `?next=`.
- `apps/web/src/app/mystable/page.tsx` + `components/mystable-dashboard.tsx` — session required; holdings from DB; empty state (no demo 1.0% card).
- `apps/web/src/lib/nellie-loop.ts`, `inventory-ids.ts`, `stripe-signature.ts`, `safe-next-path.ts`.
- `apps/web/src/app/api/legal/download/route.ts` — same `getCompiledLegalPackForCampaign` / `ownerName` as checkout.
- `packages/db_models/src/schema/00004_handle_new_user.sql` — `auth.users` → `profiles` (`kyc_status` unverified). **Not applied to Evolution-3.0.**
- `packages/db_models/src/schema/00002_cap_table_and_reservations.sql` — `consume_campaign_reservation` (decrements `reserved_shares`, does not return units to available).
- `.env.example`, `apps/web/src/tests/nellie_loop.test.ts`.

## Proven (offline)

```bash
cd /home/evo/new/evo_02 && pnpm typecheck && pnpm test
```

Both green. Tests cover: 401/403, RPC fail-closed, 64-hex hashes (no `sha256_placeholder`), HMAC, Nellie-only checkout, no `usr_guest_demo`, R2 skip without env.

## Blocked (env / live)

Live buyer loop needs, in this order:

1. Apply `00001`–`00004` to a **non-prod** Supabase (not Evolution-3.0 from this sprint).
2. `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
3. Stripe **test** `STRIPE_SECRET_KEY`, webhook secret, `PURCHASES_ENABLED=true`.
4. Operator sets `profiles.kyc_status='verified'` for the test buyer (stub — no Stripe Identity).
5. Optional R2: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`.

Without 2–4, checkout 401/403/503s by design. Sandbox no longer pretends a holding exists.

## How to run locally

1. Copy `.env.example` → `apps/web/.env.local` (or repo `.env.local`) and fill keys.
2. `pnpm --filter @evo/web dev`
3. Sign in at `/login?next=/mystable`.
4. In SQL: `update profiles set kyc_status='verified' where email='<buyer>';`
5. Open `/horses/nellie` → Join Syndicate (Stripe test card `4242…`).
6. Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
7. `/mystable` should show the holdings row with real PDS/SA hashes.

## Audit vs main

| Check | Result |
|---|---|
| Guest leftover | Removed from checkout. |
| Placeholder hashes | Dropped; compiler hashes required. |
| Swallowed reservation/holdings errors | Fail-loud HttpError / 5xx. |
| PII in seeds | Unchanged 00003 (not expanded). |
| Cap table | Consume decrements reserved; expire still returns unused. |
| Scope | `apps/mission_control` untouched. Mulan still `coming_soon`. |

## Audit

End-of-chunk auditor vs `main...HEAD`. Gates: `pnpm typecheck && pnpm test` green. Refiner: Ollama Cloud `kimi-k2.7-code` + independent review (fail closed). SQL not applied to Evolution-3.0.

**HIGH (fixed):** consume by `p_reservation_id` only (no all-reservations loop); reserved underflow fails closed (no `GREATEST` clamp); webhook HMAC required (503 if secret missing); checkout/webhook hard-locked to Nellie.

**MED (fixed):** `payment_status === 'paid'`; missing `amount_total` fails; webhook unhandled errors 500; `handle_new_user` `search_path = public, pg_temp`; `kyc_audit_digest` CHECK `^[a-f0-9]{64}$` or null.

**LOW (not pinged):** Stripe session create failure leaves reservation until 15m TTL; no `stripe_checkout_session_id` stamp on reserve; one active holding per user-horse; `/api/legal/download` unauthenticated.
