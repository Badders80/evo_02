# Delta Sprint — Audit Round-2 Fixes (share-math locked; auth + hygiene)

**Date:** 2026-08-26 · **Parent:** sprint e2e-wire (plan.md APPROVED 2026-08-25)
**Approval:** founder pre-approved execution + evidence regen + deepseek round 3 + local view + merge-on-pass (2026-08-26, this chat).

## Canonical share logic (locked, already implemented & gate-green)
Listed stake = fraction of whole horse (5%; other 95% irrelevant) → min investment = floor (1%) →
increment = lot size (0.5%) → units = stake ÷ step = 10 → investor-facing percentages only, never lots/units.
Enforced: SHARE_MATH constants, validator SHARE_MATH_MISMATCH, DB CHECK constraint, integration-test row assert.

## Chunks

### chunk-F5 — Operator auth on publish server-action [BLOCKER]
Files:
- NEW `apps/mission_control/src/app/api/operator/login/route.ts` — POST {token}, timingSafeEqual vs `OPERATOR_API_TOKEN`, sets httpOnly cookie `mc_op` = sha256(token), 8h
- NEW `apps/mission_control/src/lib/operator-auth.ts` — `isOperator()`: cookies() vs sha256(env token), timing-safe
- `apps/mission_control/src/app/actions/publish-campaign.ts` — guard: `if (!(await isOperator())) return {ok:false,error:'unauthorized'}`
- NEW `apps/mission_control/src/app/operator/page.tsx` — minimal operator sign-in (posts token)
- `horse-workspace.tsx` — on `error==='unauthorized'` show sign-in hint linking /operator
DOD: action returns unauthorized without cookie; login 401/200 pair walks via curl; `just check` green.

### chunk-F4 — Adapter rejects missing stake [MAJOR]
Files: `intake-adapter.ts` (+REQUIRED_FIELDS, numeric>0 check), `campaign-pipeline.test.ts` (+reject-case assert)
DOD: publish without stake throws 'totalSyndicateStakePct is required'; gate green.

### chunk-F9 — Test secret hygiene [MAJOR]
Files: `campaign-pipeline.test.ts` — replace hardcoded `sb_secret_…` literal with read from gitignored `.env.local` (fail-loud if absent).
DOD: grep finds no `sb_secret` literal in src; gate green.

Order: F9 → F4 (shared test file, sequential) → F5 → full gate → evidence regen → deepseek round 3 → local launch → founder views → merge on PASS.
