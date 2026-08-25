# Stage 5 Audit Report — evo_02 Sprint

**Auditor:** subagent (kimi-k2.7-code:cloud)  
**Project:** `/home/evo/new/evo_02`  
**Command run:** `cd /home/evo/new/evo_02 && just check 2>&1 | tail -40` (full output captured)  
**Date:** 2026-08-25

## Verdict

**GATE FAIL.** `just check` does not pass because `@evo/web#test` crashes with a transform error (`Top-level await is currently not supported with the "cjs" output format`) in `apps/web/src/tests/nellie_loop.test.ts`. The website build, lint, and typecheck all pass, and the filesystem state matches most sprint claims. The failing test is build/test debt that must be resolved before sign-off.

## Claim-by-claim audit

| # | Claim | Result | Evidence |
|---|-------|--------|----------|
| 1 | `horses-data.ts`: no `CAMPAIGNS_DATA`, all functions async, uses Supabase service client | PASS | `apps/web/src/lib/horses-data.ts:16` imports `getSupabaseServiceClient`; lines 227-234 `export async function getAllCampaigns`; lines 236-244 `export async function getCampaignBySlug`; search for `CAMPAIGNS_DATA` under `apps/web/src` returned 0 results. |
| 2 | All 6 horses render via `generateStaticParams` | PASS | `apps/web/src/app/horses/[slug]/page.tsx:29-32` and `about/page.tsx:24-27` both use `await getAllCampaigns()`. Build output contains `.html` / `.rsc` / `.meta` for all 6 slugs: `nellie`, `tml-x-yearn`, `prudentia`, `hottathanafantasy`, `i-stole-a-manolo`, `first-gear` under `apps/web/.next/server/app/horses/`. |
| 3 | Schema has 3 new JSONB columns on `inventory` | PASS | `supabase/migrations/00005_extended_pedigree.sql:9-12` adds `pedigree_data`, `soft_legal`, `marketing`; `packages/db_models/src/types/database.types.ts:132-134` (Row), `:167-169` (Insert), `:202-204` (Update) all include the columns. |
| 4 | `listing_platform='evolution'` for all horses | WARN | Final DB state is forced to `'evolution'` by `supabase/migrations/00005_extended_pedigree.sql:15-17`. However, the legacy seed file `supabase/migrations/00003_seed_inventory_only.sql:121,150,208` still literal-inserts `'tokinvest'`; the cleanup is delegated to the later migration rather than being removed at the source. |
| 5 | Campaign pipeline compiles and exists at expected paths | PASS | `apps/mission_control/src/lib/campaign-pipeline.ts:233` exports `createCampaignFromIntake`; `apps/mission_control/src/app/api/campaign/create/route.ts:2` imports and wires it to `POST /api/campaign/create`; `pnpm run typecheck` passed for `@evo/mission_control`. |
| 6 | No `tokinvest` refs remain in active code | WARN | No runtime code sets or consumes `listingPlatform='tokinvest'`, but the literal string remains in active source: `packages/brand_dna/src/voice.ts:103` (banned-term list, intentional), `packages/legal_engine/src/types.ts:61`, `packages/db_models/src/types/database.types.ts:125,160,195`, `apps/web/src/lib/horses-data.ts:59`, and `apps/mission_control/src/lib/campaign-pipeline.ts:59` as type-union options. These are type definitions, not runtime references. |
| 7 | No build debt leftover (`CAMPAIGNS_DATA` refs, `validateCampaign` calls in data layer) | PASS | No `CAMPAIGNS_DATA` in `apps/web/src/` (0 matches); no `validateCampaign` in `apps/web/src/lib/` (0 matches). |
| 8 | `just check` passes | FAIL | `@evo/web#test` exited (1). Root cause: `apps/web/src/tests/nellie_loop.test.ts:66,71,87,88,129` use top-level `await`; `tsx` transpiles to CommonJS and esbuild rejects it (`Top-level await is currently not supported with the "cjs" output format`). Lint and typecheck are green; only the web test suite is red. |

## Additional observations

- **Lint warnings (non-blocking):** `apps/web/src/lib/horses-data.ts:12` unused `ownerDisplayName`, `:149` unused `totalShares`; `apps/web/src/components/mystable-dashboard.tsx:39` unused `slugForInventoryName`; `apps/web/src/components/thoroughbred-attributes.tsx:1` unused `CheckCircle2`; `apps/mission_control/src/lib/campaign-pipeline.ts:136` unused `stakeStepPct`. These are warnings, not errors.
- **Campaign endpoint coverage gap:** `POST /api/campaign/create` exists and typechecks, but `just check` does not include an integration test that verifies a Supabase row is actually written. The plan-graph expected `cmd:campaign-create-test`; it is not wired into the standard gate.
- **Archive task:** `/home/evo/_archive/tokinvest-2026-08-25/` exists with `HLT/`, `documents/`, and `listings/` subdirectories.

## Next action

Fix `apps/web/src/tests/nellie_loop.test.ts` so it does not rely on top-level `await` under `tsx`'s default CommonJS transform. Options: wrap the async assertions in an async IIFE and call `.then()`/`.catch()` at the bottom, or switch the test runner to a format that supports ESM top-level await, or add `"type": "module"` / `tsx --tsconfig` configuration. Re-run `just check` and confirm `@evo/web#test` passes.
