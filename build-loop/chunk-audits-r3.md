# Chunk Audits — Round 3 (kimi-code-audit procedure)

**Branch:** sprint-1-nellie-loop · **Base ref:** 2e5bc31 · **Auditor:** orchestrator host, evidence independently re-verified (filesystem is truth; child summaries not trusted)

## BACK-1 — operator-auth unit tests — VERDICT: PASS

| # | Claim | Result | Evidence |
|---|---|---|---|
| 1 | Pure-helper tests: correct→true / wrong→false / empty→false / env-unset fail-closed / non-string false | PASS | `apps/mission_control/src/lib/operator-auth.test.ts:30-55` |
| 2 | Env set/restore hygiene in tests | PASS | `operator-auth.test.ts:5-21` (setupEnv/resetEnv) |
| 3 | Cookie derivation: deterministic sha256, 64-char lowercase hex, differs per token, never equals raw | PASS | `operator-auth.test.ts:62-84`; impl `operator-auth.ts:33-35` |
| 4 | Test file wired into MC test chain | PASS | `apps/mission_control/package.json:11` (4th `tsx` entry) |
| 5 | Guard-first ordering in publish action, before any payload handling | PASS | `src/app/actions/publish-campaign.ts:14-16` (isOperator gate precedes try/adapter) |
| 6 | Login route fail-closed before cookie issuance; httpOnly cookie carries digest only | PASS | `api/operator/login/route.ts:17-19` (401 pre-issue), `:24-31` (httpOnly, sha256 value) |
| 7 | timingSafeEqual compare; expected value derived fail-closed from env | PASS | `operator-auth.ts:20-22` (length guard + timingSafeEqual), `:12-13` (null when unset) |
| 8 | No raw token stored or logged anywhere in auth path | PASS | source-read of operator-auth.ts / login route / publish-campaign.ts — no logging of token or digest-to-console paths |
| 9 | Gate green with new tests executing (not cache-replay) | PASS | host rerun: `pnpm --filter @evo/mission_control test` → both operator-auth suites PASSED live; `just check` → Tasks 10 successful |

## MID-1 — Supabase share-invariant walk — VERDICT: PASS

| # | Claim | Result | Evidence |
|---|---|---|---|
| 1 | CHECK constraint enforces canonical rule | PASS | `packages/db_models/src/schema/00001_initial_schema.sql:134` — host re-read confirms `total_shares = round(listed_stake_pct / stake_step_pct, 2)` (+ >0, <=100) |
| 2 | service_role full DML grant on inventory | PASS | `supabase/migrations/00006_service_role_inventory_write.sql:5` — SELECT, INSERT, UPDATE, DELETE |
| 3 | Every inventory row satisfies invariant | PASS | host independent REST re-query: 6/6 rows OK — nellie 5/0.5/10 ✓, tml-x-yearn 5/0.5/10 ✓, prudentia & hottathanafantasy 5/0.25/20 ✓, i-stole-a-manolo 5/0.5/10 ✓, first-gear 10/1.0/10 ✓ |
| 4 | Walk evidence on disk, service key redacted | PASS | `build-loop/mid-office-walk.md` §3 (endpoint line redacted) |

**Host corrections during audit (chunk otherwise clean):**
1. Child wrote walk file to `/home/evo/new/build-loop/mid-office-walk.md` (session-cwd path bug) — relocated to `build-loop/mid-office-walk.md`.
2. Truncated redacted endpoint line repaired for clean evidence trail.

## MID-2 — Storage/CDN sanity — VERDICT: PASS (with host gap-closure)

| # | Claim | Result | Evidence |
|---|---|---|---|
| 1 | R2 skipped unless env exists (tested) | PASS | `apps/web/src/tests/nellie_loop.test.ts:164` assertion; host rerun reproduced fresh |
| 2 | Placeholder-fallback covered by tests | CLAIM WAS FALSE → CLOSED BY HOST | No such assertion existed; host added `apps/web/src/tests/media_fallback.test.ts`, chained into `apps/web/package.json` test script; gate rerun 10/10 PASSED |
| 3 | Fallback code correct (source-read) | PASS | `apps/web/src/lib/media-fallback.ts:10` — `cover ?? PLACEHOLDER_HERO`, placeholder = `/brand/placeholder-hero.svg` |
| 4 | No hardcoded R2/cloudflare credentials | PASS | Host independent grep: all hits are env reads (`nellie-loop.ts:65-68`), icon imports (`Loader2`), UI copy, storage-lib endpoint pattern (`client.ts:9`), or `'acct'/'key'/'secret'/'vault'` mock fixtures |

**Host corrections during audit:** plan-level overclaim documented + closed with a real test instead of a note (see mid-office-walk.md §5.1). Chunk executor output otherwise accurate.

## BACK-2 — Back-office walk evidence — VERDICT: PASS

| # | Claim | Result | Evidence |
|---|---|---|---|
| 1 | Gate 10/10 PASSED tail captured | PASS | `build-loop/back-office-walk.md` §1 (fresh run at capture time) |
| 2 | Login curl trio: no→401 / wrong→401 / correct→200+httpOnly mc_op digest cookie | PASS | §2; host executed the trio live and pasted verbatim headers (cookie masked) |
| 3 | MC test chain output shows adapter rejects + integration (inventoryId/64-hex/5-0.5-10) + cleanup + auth suites | PASS | §3 fresh run output |
| 4 | Zero sb_secret literals (error-message mentions allowed) | PASS | §4 grep output — only 2 fail-loud error strings |

**Host correction during audit:** chunk executor timed out twice (malformed curl burn → 600s stall, no durable output). Per build-loop fallback rules the evidence capture was executed host-side with live commands immediately before writing the walk file; nothing transcribed from memory or prior sessions. Stray dev servers from the failed attempt were killed afterwards.

## AUDIT-R3 — paid deepseek round 3 — VERDICT: FAIL → fix loop (retry 1 of 2)

Findings triaged against ground truth by host:
| R3 finding | Host disposition |
|---|---|
| SHARE-UI BLOCKER (pricing-card renders share count as %) | Auditor misread data flow BUT naming trap real: horses-data.ts:153 converts shares→percent before the call; both call sites pass availablePct into prop named sharesAvailable. Value was always correct percent ("5.0% Available" for Nellie). FIXED: prop renamed sharesAvailable→availablePct end-to-end (pricing-card.tsx + horses/[slug]/page.tsx:259); stale comments updated; just check 10/10 PASSED post-rename. |
| MIGRATION-EDIT MAJOR (00001 edited post-application) | RESOLVED as non-violation with evidence: git diff vs base touches only packages/db_models source template (1 line); supabase/migrations/* untouched; live DB constraint inventory_check2 read via psql = exact canonical rule. Documented in mid-office-walk.md §6. |
| AUTH-CODE-GAP MINOR/WARN (login route + publish action missing from pack) | RUNNER BUG real: git lists new dirs with trailing slash; runner skipped them. FIXED run_round3_audit.py to expand untracked directories via git ls-files --others; pack 17→20 sections incl. both auth sources verbatim; ROUND-3 DISPOSITION table added for R4 verification. |

Retry 1 dispatched: AUDIT-R4.

## AUDIT-R4 — paid deepseek round 4 — VERDICT: FAIL → fix loop (retry 2 of 2, FINAL)

All prior findings PASSed (R2 dispositions, R3 dispositions, auth end-to-end incl. both source files).
New sweep findings triaged by host:

| R4 finding | Host disposition |
|---|---|
| N1 BLOCKER: stake selector offers only integer %, violating "increments of 0.5% thereafter" | REAL → FIXED. Selector now emits every 0.5% multiple from the 1% floor (Nellie: 1.0–5.0% in half-steps), capped at availablePct. |
| N2 MAJOR: no validation that total stake is a multiple of step | REAL → FIXED. intake-adapter rejects non-multiples (5.1/5.25/3.33 rejected, 5.5 accepted) w/ reject-case tests. NOTE: DB CHECK already rejects fractional shares loudly (live constraint verified); this adds clean upstream failure. |
| N3 MINOR: raw ENOENT when .env.local missing | FIXED: try/catch with actionable message in campaign-pipeline.test.ts. |

HOST-FOUND ADDITION (deeper than auditor): checkout route passed investor-facing PERCENT directly
into reserve_campaign_shares whose contract (00002 migration) counts 0.5% STEP-UNITS vs shares_available —
investors were priced for X% but would reserve X/2 %. PRE-EXISTING on main (route not in sprint diff).
FIXED per founder directive (percent UI everywhere): pure helpers stakePctToStepUnits/stepUnitsToStakePct
in nellie-loop.ts; checkout converts at the RPC boundary only; Stripe metadata stays percent;
webhook parses float (no parseInt truncation of 1.5%) and compares mismatch-guard in matching dimensions.
Tests: boundary conversions locked in nellie_loop.test.ts (incl. 0.25%-step campaign case). Gate 10/10 PASSED.

## AUDIT-R5 — paid deepseek round 5 (FINAL) — VERDICT: FAIL on a single new finding (#27); fix budget exhausted → founder decision

Findings #1–26: ALL PASS (every prior fix from R2/R3/R4 verified, incl. boundary units + auth end-to-end).
Finding #27 (MAJOR): MC seed first-gear stakeStepPct 0.5 vs totalShares 10 at stake 10% — canonical 10/0.5=20.
HOST GROUND TRUTH: live DB row first-gear = stake 10 / step 1.0 / shares 10. The DB is right; the SEED was wrong.
Host applied the one-line data correction (stakeStepPct 0.5→1.0) so the tree carries no known-wrong value;
canonical invariant now holds in the seed AND matches production truth. Gate re-run green post-fix.
Also noted, NOT touched (locked track-record displays per CONTINUE.md): prudentia/hotta MC seeds show
simplified 5.0/10/0.5 while live closed rows use step 0.25/shares 20 — publish-gated off for those slugs.

Per plan §AUDIT-R3: "On FAIL: fix loop max 2 retries, then stop and report to founder." Fix loop used:
R3→R4 (retry 1), R4→R5 (retry 2). R5's residual single finding was corrected with evidence but NOT
re-audited by the paid gate — merge decision now rests with the founder.
