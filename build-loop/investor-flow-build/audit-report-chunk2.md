# investor-flow-build — chunk-2 audit

**Date:** 2026-09-03
**Auditor:** kimi-k2.7-code:cloud (diff embedded)
**Scope:** commit a3d53c7 (base efb4437) + fix commit 861b183

## Verdict: PASS-WITH-WARNINGS

| # | Finding | Severity | Disposition |
|---|---|---|---|
| 1 | Modal shell matches mockup (max-w-lg, h-[720px], rounded-3xl, border-border, bg-surface, p-8, space-y-6, shadow) | OK | — |
| 2 | f12 4-row summary: label left · value right · sub-note below, dividers | OK | — |
| 3 | f11 Investor Return GREEN text-status-active | OK | — |
| 4 | Step 2 header "Digital-Syndication Terms" exact | OK | — |
| 5 | Stepper opens at min, 0.5% steps, clamps at max | OK | — |
| 6 | ▲ green / ▼ red / limit notes on min-max | OK | — |
| 7 | Numbers from pricingForUnits, no mockup placeholders | OK | — |
| 8 | CTA "Invest in {Horse}", onProceed hands modal stake back (setStakePct) | OK | — |
| 9 | Vocabulary/tone/tokens clean | OK | — |
| 10 | Overlay double scrollbar (overflow-y-auto on overlay + panel) | WARN | **FIXED** — removed from overlay (861b183) |
| 11 | noteTimer not cleared on unmount | WARN | **FIXED** — cleanup effect (861b183) |
| 12 | horseSlug dead prop in Step2TermSheet | WARN | **FIXED** — removed (861b183) |
| 13 | ModalShell exported but unused elsewhere | WARN | **FIXED** — export removed (861b183) |
| 14 | `wholesaleMonthlyNzd ?? 3800` hidden fallback | WARN | **ACCEPTED** — matches existing rail pattern (right-rail.tsx:500), page always passes real value |
| 15 | bg-black/85 non-token backdrop | WARN | **ACCEPTED** — matches existing AcceptanceGateModal (right-rail.tsx:314), consistent |

Gates re-run after fixes: typecheck PASS, just check 10/10 PASS.

**Chunk-2 complete → chunk-3.**
