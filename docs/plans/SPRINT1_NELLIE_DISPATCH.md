# Sprint 1 dispatch — Nellie loop (branch only)

**Branch:** `sprint-1-nellie-loop`  
**Repo:** `/home/evo/new/evo_02`  
**Do not:** merge to `main`, push unless asked, Vercel production, Mission Control, other horses buyable, `website_cloner`.

## Done when

Authenticated test buyer can complete: login → `profiles.kyc_status=verified` (stub) → `reserve_campaign_shares` → Stripe **test** session created (or clearly gated if keys missing) → webhook writes `holdings` with **real** 64-hex PDS/SA hashes (no `sha256_placeholder`) → `/mystable` shows that row.

Local proof: `pnpm typecheck` and `pnpm test` green. Code complete even if live Stripe/Supabase env is missing — use `.env.example`, fail closed (no guest, no swallowed DB errors).

## Locked decisions

- Kill `usr_guest_demo`. 401 if no `user.id`.
- KYC **stub**: 403 unless `profiles.kyc_status === 'verified'`. No Stripe Identity product this slice.
- Nellie inventory UUID: `11111111-0000-0000-0000-000000000001`. Checkout already maps slug; keep Nellie-only via `isCheckoutOpen`.
- RPC exists in `packages/db_models/src/schema/00002_cap_table_and_reservations.sql`. Call it; do not raw-insert `checkout_reservations`.
- Vault: `@evo/storage/vault` only. Do **not** add `legal_engine/src/vault.ts`. Skip R2 upload if no R2 env; still persist real hashes on `holdings`.
- **Do not apply SQL to live Evolution-3.0.** Write migration files in `packages/db_models/src/schema/` only.
- Production website stays on `main`. This branch is the replacement candidate.

## Must implement

1. **Auth** — `create-session` 401 without user; login honors `?next=`; middleware redirects `/mystable` → `/login?next=/mystable`; SQL `00004_handle_new_user.sql` inserts `profiles` (`kyc_status` unverified) on `auth.users` insert.
2. **KYC stub** — checkout reads profile; 403 if not verified. Pricing card sends 401 → login with next, 403 → clear message.
3. **Reserve** — `adminClient.rpc('reserve_campaign_shares', { p_inventory_id, p_user_id, p_units, p_ttl_minutes: 15 })`. Fail closed on `success: false`.
4. **Webhook** — verify Stripe HMAC when secret present; drop `sha256_placeholder`; use `getCompiledLegalPackForCampaign` hashes (same context as checkout); `holdings` insert fail loud; consume reservation. Sandbox path when `STRIPE_SECRET_KEY` missing or `PURCHASES_ENABLED !== 'true'` must not pretend a holding exists.
5. **MyStable** — require session; query `holdings` for `auth.uid()`; empty state if none; stop hardcoded Verified / demo email / fake 1.0% card as the source of truth.

## Do not touch

- `apps/mission_control/**`
- Other horses `listingStatus`
- Guest checkout fallback
- Applying migrations via Supabase MCP to Evolution-3.0

## Verify

```bash
cd /home/evo/new/evo_02 && pnpm typecheck && pnpm test
```

Fix failures. Then audit the diff vs `main` for: guest leftover, placeholder hashes, swallowed catch, PII in seeds, cap-table invariants, scope creep.

## Return

Write `docs/plans/SPRINT1_RESULT.md` with: files changed, what’s proven, what’s blocked (env/keys), how to run locally. Commit on this branch if tests pass (`author:` prefix). Do not push.
