# C3 re-run notes (orchestrator, 2026-08-25)

Original opencode executor died mid-fix (EXIT:143, top-level await in tsx — fixed by executor's
runTest() wrap, present on disk). Gate re-run found TWO real blockers, fixed by orchestrator:

1. **GRANT gap** — `service_role` had only SELECT, UPDATE on `inventory`; pipeline INSERT + test DELETE
   denied ("permission denied for table inventory").
   Fix: new `supabase/migrations/00006_service_role_inventory_write.sql`
   (GRANT SELECT, INSERT, UPDATE, DELETE) + same grant updated in
   `packages/db_models/src/schema/00001_initial_schema.sql:299` + applied live to local DB.
   Verified: `\dp public.inventory` → `service_role=arwdDxtm`.

2. **Shares invariant violation** — `inventory_check2`: `total_shares = listed_stake_pct / stake_step_pct`
   (and `<= 100`). Builder used `floor(totalStakePct / minStakePct)` → wrong; default 100.0 stake
   would compute 200 shares > 100 cap.
   Fix: `campaign-pipeline.ts` → `totalShares = totalStakePct / stakeStepPct`, default
   `totalSyndicateStakePct ?? 5.0` (matches listing convention + Nellie seed: 5.00 / 0.50 = 10).
   Test payload passes `totalSyndicateStakePct: 5` explicitly.

Gate result: `just check` → "✅ [evo_02] All lint, typecheck, and test gates PASSED."
Test proof: `inventoryId=1f67eada-… pdsHash=4c1024db… saHash=64a1dff6…` then row deleted (try/finally).
