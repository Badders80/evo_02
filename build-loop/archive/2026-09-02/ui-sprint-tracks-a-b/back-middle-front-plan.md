# HANDOFF — Back Office → Middle Office → Front Office
## Sprint e2e-wire delta: finish, audit, merge

**Written:** 2026-08-26 · **Branch:** `sprint-1-nellie-loop` · **Base ref for diffs:** `2e5bc31`
**Executor model:** host agent dispatches SUBAGENTS per chunk (`delegate_task`, self-contained briefs), then audits each chunk with the `kimi-code-audit` procedure before moving on.

---

## FOUNDER DIRECTIVES (2026-08-26 — binding)

1. **Three-layer order, do not invert:**
   - **BACK OFFICE** = pure system/build logic: publish pipeline, legal pack, share math, operator auth. Verified by tests + curl. No UI.
   - **MIDDLE OFFICE** = data & infra: Supabase (schema/seeds/grants/RPC), Cloudflare R2/CDN media. Verified by REST queries + existing test suite.
   - **FRONT OFFICE** = the website. Last. Already proven rendering from Supabase (fin-walk-proof); investor copy made percentage-based this sprint. Nothing new this cycle except audit confirmation.
2. **Mission Control is NOT a priority.** It is internal back-office tooling. Do not style it, do not extend it, do not browser-test it. Its only job this cycle: the publish write-path must be correct and authorized. Polish comes later.
3. **NO Playwright / Chromium / any browser automation.** Founder directive. All verification is deterministic: unit tests, `just check`, curl against APIs/REST. Server-action internals are verified by source-read during audit, not by driving a browser.
4. **Merge remains founder-gated.** Audit PASS → founder reviews locally → founder says merge.

---

## CURRENT STATE SNAPSHOT (verified 2026-08-26)

Done and gate-green (`just check` 10/10 PASSED):

- **Share-math lock (canonical, founder-locked):** lot/share/unit = increment (0.5%); min investment = floor (1%), never a divisor; units = stake ÷ step (5% ÷ 0.5% = 10); investor-facing percentages only, word "Lots" banned from term sheet/PDS/storefront; no auto-default stake (publish rejects missing/≤0).
  Implemented in: `packages/legal_engine/src/types.ts` (SHARE_MATH), `term_sheet.ts`, `pds.ts`, `validator.ts` (SHARE_MATH_MISMATCH invariant), `apps/mission_control/src/lib/campaign-pipeline.ts` (both builders aligned), `intake-adapter.ts` (stake required), `horse-workspace.tsx`, `apps/web` pricing-card/cap-table copy, MC seed contexts (page.tsx ×7), fixtures in `packages/legal_engine/tests/legal_engine.test.ts`.
- **F9 secret hygiene:** no hardcoded `sb_secret_` literals — both apps' tests load service key from gitignored `.env.local`, fail-loud if absent.
- **F4 adapter:** rejects missing/stake≤0 with reject-case tests (PASS observed).
- **F5 operator gate (code done):** `src/lib/operator-auth.ts` (sha256 cookie compare, timing-safe, fail-closed), `src/app/api/operator/login/route.ts` (curl-walked: no-token 401 / wrong 401 / correct 200 + httpOnly `mc_op` cookie), guard-FIRST in `publish-campaign.ts`, `/operator` sign-in page, workspace hint on unauthorized. **Remaining:** unit tests for the pure helpers (chunk BACK-1). Browser walk was started and CANCELLED per directive 3.
- Dev servers were killed for clean handoff. Relaunch when needed:
  `cd /home/evo/new/evo_02 && (pnpm --filter @evo/web dev -p 3010 > /tmp/web-dev.log 2>&1 &) && (pnpm --filter @evo/mission_control dev -p 3011 > /tmp/mc-dev.log 2>&1 &)`

Prior-round audit artifacts: `build-loop/paid-audit-deepseek-v4-pro.out` (R1 FAIL → fixed), `paid-audit-deepseek-v4-pro-r2.out` (R2 FAIL: F1/F2/F12 were stale-diff artifacts, F4/F5/F9 real → all now fixed).

---

## ENVIRONMENT FACTS (for the executing session)

- Gate command: `just check` (turbo lint+typecheck+test; must be 10/10 PASSED).
- Paid auditor: `deepseek-v4-pro:cloud` via Ollama API — `POST http://localhost:11434/api/chat`, JSON `{model, messages, stream:false}`. Runner script provided: `build-loop/scripts/run_round3_audit.py` (regenerates evidence fresh at run time — USE IT, do not hand-build packs).
- `opencode` binary (if ever needed): `/home/evo/.nvm/versions/node/v24.14.0/bin/opencode` — background shells lose nvm PATH, never call bare.
- Local Supabase: 127.0.0.1:54321 · service key from `apps/*/​.env.local` (`SUPABASE_SERVICE_ROLE_KEY`) — NEVER print or commit keys.
- Canonical names: owner/lessor = Evolution Stables (never Ltd/Bloodstock). Tokinvest banned everywhere except `brand_dna/voice.ts` compliance list.
- Applied migrations are immutable (checksum rule): seed/data fixes are additive; never edit applied migration SQL.

---

## CHUNKS (dispatch order; each = subagent → verify → kimi-code-audit)

### BACK-1 — Operator auth: testable guards [backend, closes F5 properly]
Dispatch brief: In `/home/evo/new/evo_02` create `apps/mission_control/src/lib/operator-auth.test.ts`: unit-test the PURE helpers only —
`isValidOperatorToken` (correct token true, wrong false, empty/undefined false; set `process.env.OPERATOR_API_TOKEN` in-test),
cookie derivation determinism (sha256 of token), fail-closed when env unset.
Append the file to the MC test chain in `apps/mission_control/package.json` (`tsx … && tsx …`).
Do NOT touch the server action or login route (already correct). Run `just check`.
DOD: new tests PASS inside the gate; no browser anything.
Audit (kimi-code-audit, diff-scope chunk files): guard-first ordering in `publish-campaign.ts:11-14`; login route fail-closed before parse; timing-safe compares; no raw token stored/logged.

### BACK-2 — Back-office walk evidence [backend]
Dispatch brief: Run and CAPTURE REAL OUTPUT into `build-loop/back-office-walk.md`:
1. `just check` tail (10/10).
2. Login-route curl trio against :3011 (relaunch MC first): no-token→401, wrong→401, correct→200+Set-Cookie `mc_op=` (mask cookie value in the file).
3. `pnpm --filter @evo/mission_control test` tail showing: adapter-reject cases + pipeline integration (inventoryId + 64-hex hashes + DB row assert 5/0.5/10) + cleanup.
4. `grep -rn "sb_secret" apps/*/[src|tests] packages/*/src` → zero literals (error-message mentions allowed).
DOD: file exists with real pasted outputs, no invented numbers.
Audit: every number in the file traceable to a rerun command.

### MID-1 — Supabase alignment to locked share rule [data layer]
Dispatch brief: Against local stack :54321 (key from `.env.local`, never printed):
REST-query `inventory` rows; assert EVERY row satisfies `total_shares = round(listed_stake_pct / stake_step_pct, 2)`; specifically nellie + tml-x-yearn = stake 5 / step 0.5 / shares 10.
Read `packages/db_models/src/schema/00001_initial_schema.sql` inventory CHECK constraints (line ~134) + grants migration (00006 service_role SELECT,INSERT,UPDATE,DELETE) — confirm intact, unedited.
If live data drifts from the invariant: DO NOT edit applied migrations; write corrective SQL into `build-loop/mid-office-fixes.sql` + report.
Write results to `build-loop/mid-office-walk.md` (real query outputs).
DOD: zero invariant violations (or documented fix file); grants confirmed.
Audit: row-by-row math checked; no migration edits in diff.

### MID-2 — Storage/CDN (Cloudflare R2) sanity [infra]
Dispatch brief: Confirm media path is env-driven and safe: `apps/web` tests already cover "R2 skipped unless env exists" + placeholder fallback (`media-fallback.ts`, `placeholder-hero.svg`). Re-run `pnpm --filter @evo/web test`, confirm those two assertions in output; verify no hardcoded R2 credentials anywhere (`grep -rn "R2\|cloudflare" apps packages --include="*.ts"` → env references only). Append findings to `build-loop/mid-office-walk.md`.
DOD: no gaps found (or gap documented, no silent fixes).
Audit: trivial — grep + test output.

### FRONT-CONFIRM — website untouched-except-copy [front office, minimal]
No dispatch needed. Auditor confirms during final audit: storefront renders from Supabase (fin-walk-proof §4 stands), investor-facing copy percentage-based (pricing-card `{units}%`, cap-table "% available"), zero "Lots"/units language in `apps/web` investor surfaces. Anything visual/prettiness = OUT OF SCOPE, later cycle.

### AUDIT-R3 — Deepseek round 3 (gate to merge)
Run `python3 build-loop/scripts/run_round3_audit.py` (regenerates fresh diff + ALL untracked sprint files + reports + round-2 disposition table automatically). Verdict must be **VERDICT: PASS**. On FAIL: fix loop max 2 retries (same discipline), then stop and report to founder.

### REVIEW + MERGE (founder-gated)
Relaunch both servers; founder clicks through. On founder GO:
commit all on `sprint-1-nellie-loop` → merge to `main` → push origin.
Update `CONTINUE.md`, `final-sprint-report.md`, and feed gbrain (`fact/e2e-wire-pipeline` update: locked share rule + operator cookie gate; MCP: `POST localhost:3456/mcp`, Bearer `GBRAIN_API_KEY` from Hermes env file, header `Accept: application/json, text/event-stream`).

---

## HARD RULES (every subagent brief inherits these)
1. No browser automation (Playwright/Chromium/CDP) — founder directive.
2. `just check` green or the chunk is not done. Real output only — invented exit codes are FAIL.
3. No commits, no pushes, no merges inside chunks. Merge is a single founder-gated stage.
4. Never print/commit secrets; keys come from gitignored `.env.local`.
5. No edits to applied migrations; no prod (Evolution-3.0) contact.
6. Every audit finding cites file:line or command output — no shared source, no edge.
