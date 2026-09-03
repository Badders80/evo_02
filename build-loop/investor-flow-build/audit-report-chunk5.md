# investor-flow-build — chunk-5 audit

**Date:** 2026-09-04
**Auditor:** kimi-k2.7-code:cloud (diff embedded — 5 files incl. new test suite)
**Scope:** commit 7023c8f (base 48310b7) — f9 stepper error states + f10 Stripe error mapping

## Verdict: PASS-WITH-WARNINGS → re-audited concerns FIXED (gates green, re-walked)

| # | Finding | Severity | Disposition |
|---|---|---|---|
| 1 | `commitStake` never lets non-multiple/out-of-range reach `setStakePct` (all branches return before set) | OK | — |
| 2 | Fallback path can leak raw server text for unknown/null codes | WARN | **FIXED** — `investorCheckoutError` now returns `CHECKOUT_ERROR_UNKNOWN` (generic copy) for any unknown/null code; raw fallback param is dead (`_fallback`). Test suite updated to lock this. |
| 3 | Response shape change (adding `code` to 400/500) — additive, only consumer updated | OK | — |
| 4 | No dead code/type/eslint issues; minor: stale alert after arrow clicks + Escape didn't clear error | WARN (minor) | **FIXED** — `stepUp`/`stepDown` now `setStakeError(null)`; Escape clears error. Re-walked: error shown 1 → ▲ click → alerts 0, stake 1.5%. |
| 5 | Scope fence — 5 files (5th = new test suite, content verified on disk) | OK | — |
| 6 | Map copy vs spec table — 9 codes exact, whitelist-clean | OK | — |

## What chunk-5 shipped

**f9 — 5 stepper error states** (purchase-flow-modal.tsx Step2TermSheet):
- Tap-to-edit stake value (button → input, Enter/blur commits, Escape reverts).
- Non-multiple → "Stake must be a multiple of 0.5%" (never sent to server).
- Over max → "Stake available is 5% — reduce your stake".
- Under min → "Minimum investment is 1% — increase your stake".
- Cleared/empty → reverts to min on blur, error cleared.
- Dull triangles (opacity-40 + cursor-not-allowed) at bounds; boundary note retained.

**f10 — code → investor copy mapping** (nellie-loop.ts + create-session/route.ts + modal):
- `CHECKOUT_ERROR_COPY` (9 codes: KYC_REQUIRED, INVALID_STAKE, CAMPAIGN_NOT_FOUND, CHECKOUT_CLOSED, RESERVE_FAILED, PURCHASES_DISABLED, SUPABASE_NOT_CONFIGURED, RESERVE_RPC_ERROR, STRIPE_DECLINE) + `investorCheckoutError()` with `{step}/{max}` interpolation.
- Route now tags 400 → INVALID_STAKE, Stripe 500 → STRIPE_DECLINE.
- Modal renders mapped copy for ALL non-OK paths (non-KYC 403s + JSON errors). Raw server strings/codes never reach the investor (incl. unknown-code path).
- New gated test suite `checkout_error_copy.test.ts` (exact copy match, fallback guard, whitelist), wired into `just check` (10/10).

## Walk evidence (headless Chromium :3010, authenticated)

Modal opens 1.0% ✓ · ▼ dull at min ✓ · ▲ → 1.5% ✓ · "1.3" → alert "Stake must be a multiple of 0.5%" (exactly 1 in-modal, baseline 0) ✓ · "8" → "Stake available is 5% — reduce your stake" ✓ · "0.5" → "Minimum investment is 1% — increase your stake" ✓ · clear → blur → 1.0% ✓ · "2" → 2.0% accepted ✓ · audit-fix re-walk: error → ▲ → error cleared, 1.5% ✓ · Step 3 h3 (C4 regression) ✓. Screenshot: `chunk5-stepper-errors.png`.

## Gates

- `pnpm --filter @evo/web typecheck` — PASS
- `just check` — 10/10 PASS (new suite in chain)

**All 5 chunks DONE.** Build complete → next: graphics/format pass (Claude + MiniMax M3, Stitch, pixel vs `flow-mock/*.png`).
