# Audit Report — sprint e2e-wire (Stage 5)

**Auditor:** Hermes (kimi-code-audit procedure, diff-scope vs `2e5bc31` + uncommitted tree)
**Date:** 2026-08-25 · **Verdict: PASS** (0 FAIL, 0 WARN)

## Claims verified

| # | Claim | Result | Evidence |
|---|-------|--------|----------|
| 1 | C1 server action `publish-campaign.ts` exists, `'use server'`, maps through adapter, returns {ok, inventoryId, pdsHash, saHash} | PASS | `apps/mission_control/src/app/actions/publish-campaign.ts:1,7-22` |
| 2 | Adapter validates required fields (slug/legalName/barnName/wholesaleMonthlyNzd + pedigree.sire/dam/gender/breeder + trainer.name/stable/location + owner.entity) | PASS | `intake-adapter.ts:29-80` |
| 3 | C1 smoke walked: `ok:true`, 64-hex hashes, row deleted | PASS | `build-loop/fin-walk-proof.md` §3 (tsx eval output) |
| 4 | C2 auth fail-closed: token check BEFORE parsing, timing-safe compare | PASS | `route.ts:12-25` |
| 5 | Curl pair: no token 401, wrong token 401, correct 201 | PASS | `fin-walk-proof.md` §1-2 |
| 6 | Token never in client bundles | PASS | grep `OPERATOR_API_TOKEN` in `apps/mission_control/src/components` + `apps/web/src` = 0 |
| 7 | C3 test in `pnpm test` with unique slug + try/finally cleanup | PASS | `mission_control/package.json:11`; `campaign-pipeline.test.ts:11,50-52` |
| 8 | C4 media fallback wired (horses-data.ts uses fallback; placeholder SVG exists) | PASS | `horses-data.ts:15`; `media-fallback.ts:3` |
| 9 | C5 Tokinvest purge: only `brand_dna/voice.ts` remains | PASS | grep -ril tokinvest = `packages/brand_dna/src/voice.ts` |
| 10 | Shares invariant: `total_shares = totalStakePct / stakeStepPct`, default 5.0 | PASS | `campaign-pipeline.ts:169-172` |
| 11 | Service-role grants on inventory | PASS | `00001_initial_schema.sql:299` |
| 12 | Gate green at audit time | PASS | `just check` tail: 10/10 PASSED |
| 13 | Envs gitignored | PASS | `git check-ignore -v` both `.env.local` → `.gitignore:21` |
| 14 | FIN walked proof + cleanup (0 e2e rows) | PASS | `fin-walk-proof.md` §4-5 |
| 15 | No commits this sprint (per rules) | PASS | `git log --oneline -2` = baseline only; 40 modified/untracked files |

## Cross-cutting invariants checked

- **Shares invariant:** `total_shares = listed_stake_pct / stake_step_pct` (`campaign-pipeline.ts:171-172`); FIN row showed `total_shares: 10.0` for 5.0% @ 0.5 step ✓
- **Hash format:** pds/sa hashes asserted 64-hex in smoke + observed in REST row ✓
- **Schema vs types:** `database.types.ts` regenerated alongside `00001` change (git status) ✓
- **No prod contact, no pushes, no merges:** verified via git status + branch `sprint-1-nellie-loop` ✓

## Notes / caveats

- The C1 executor's original attempt was killed (exit 143); its JSX/type errors were repaired by the orchestrator — covered in plan-graph chunk-C1 state and this report.
- Stage 5 here is the **build-loop audit** (self-run with evidence). A paid-model independent audit was left founder-gated (per handoff).
- `tsconfig.tsbuildinfo` churn in git status is expected (tsc incremental), not code.
