# investor-flow-build — chunk-1 audit

**Date:** 2026-09-03
**Auditor:** kimi-k2.7-code:cloud (diff embedded — ollama CLI has no filesystem access)
**Scope:** commit b4790d2 (base 5449f3b) + fix commit efb4437

## Round 1 — FAIL (2 BLOCKER + 1 WARN)

| # | Finding | Severity | Fix applied |
|---|---|---|---|
| 1 | f6b: `useState` initializer reads `window` — SSR renders min, hydration never re-runs → `?units=` lost on full-browser login/Stripe returns | BLOCKER | Moved to `useEffect` (right-rail.tsx), step guarded `Math.max(step, 0.01)` |
| 2 | f8: same SSR/hydration defect — success banner never appears on `success_url` navigation | BLOCKER | Moved to `useEffect` (mystable-dashboard.tsx), `useEffect` imported |
| 3 | f7: cancel_url → `/horses/` (legacy page, PricingCard/CapTableCard) not the investor journey `/marketplace/` | WARN | cancel_url → `/marketplace/${slug}?units=` (route.ts:106) |

Gates re-run after fixes: typecheck PASS, just check 10/10 PASS.

## Round 2 — PASS-WITH-WARNINGS (commit efb4437)

| # | Finding | Severity | Disposition |
|---|---|---|---|
| 1 | f6b now SSR-safe (useEffect, initial state = min matches SSR) | OK | — |
| 2 | f6b dep array omits `window.location.search` — no resync if query changes while mounted | WARN | **ACCEPTED** (founder): redirect paths are full page loads; card always mounts fresh. `useSearchParams` fix would require Suspense boundary — not worth it for this edge |
| 3 | f8 SSR-safe, imports/hook order valid | OK | — |
| 4 | f7 cancel_url matches investor path | OK | — |
| 5 | No new lint/hooks regressions | OK | — |

**Verdict: PASS-WITH-WARNINGS (1 WARN accepted by founder 2026-09-03).** Chunk-1 complete → chunk-2.
