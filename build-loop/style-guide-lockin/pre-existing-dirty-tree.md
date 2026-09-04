# Pre-existing dirty/untracked files — reference (NOT part of style-guide-lock-in)

**Captured 2026-09-04 at head `6b7da76` (before SG-1).** These 39 files were already
modified/untracked before the style-guide cycle started. The sandbox branch
`style-guide-lock-in` never touched them — they are the pre-existing "terminology
sweep + build-loop artifacts" noted in the format-pass wrap-up. Handle them in a
separate session; do not fold them into the style-guide merge.

## Modified (25)

### Docs / process
- `AGENTS.md`
- `GEMINI.md`
- `build-loop/README.md`
- `build-loop/e3-content-tree.md`
- `build-loop/e3-right-rail-deepdive.md`
- `build-loop/e3-rung4/carry-on-prompt-rung4.md`
- `build-loop/e3-rung4/e3-flow-map.md`
- `build-loop/e3-rung4/purchase-journey-report.md`
- `build-loop/e3-rung4/review-synthesis.md`

### apps/web
- `apps/web/src/app/faq/page.tsx`
- `apps/web/src/app/horses/[slug]/page.tsx`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/learn/returns/page.tsx`
- `apps/web/src/components/cap-table-card.tsx`
- `apps/web/src/components/pricing-card.tsx`
- `apps/web/src/dna/content/press.json`
- `apps/web/src/lib/seo.ts`

### apps/mission_control
- `apps/mission_control/src/app/page.tsx`

### packages
- `packages/brand_dna/src/voice.ts`
- `packages/brand_dna/tests/voice.test.ts`
- `packages/db_models/src/data/sires.ts`
- `packages/db_models/src/data/trainers.ts`
- `packages/legal_engine/src/pds.ts`
- `packages/legal_engine/src/sa.ts`
- `packages/legal_engine/src/types.ts`

## Untracked (14)

- `apps/web/components.json`
- `build-loop/audit-graph-investor-flow.json`
- `build-loop/ds101/` (directory)
- `build-loop/format-pass/chunkF8-audit-output.txt`
- `build-loop/format-pass/chunkF8-plan-audit-output.txt`
- `build-loop/format-pass/chunkF8-plan-audit.txt`
- `build-loop/format-pass/chunkF10-audit-output.txt`
- `build-loop/format-pass/chunkF11-audit-output.txt`
- `build-loop/format-pass/chunkF13-F15-audit-output.txt`
- `build-loop/investor-flow-build/chunk3-audit-clean.txt`
- `build-loop/investor-flow-build/chunk3-audit-output.txt`
- `build-loop/investor-flow-build/chunk4-kyc-prompt.png`
- `build-loop/investor-flow-build/chunk5-stepper-errors.png`
- `build-loop/investor-flow-build/format-pass/live-rail-locked.png`

## Suggested handling (separate session)

1. **Terminology sweep (the ` M` code files):** review + commit on `design-alignment`
   (or wherever they belong) — they are the Units→Stakes / voice / legal copy sweep.
2. **Build-loop artifacts (the `??` files):** decide keep-vs-archive; they are audit
   outputs and screenshots from prior cycles (format-pass, investor-flow-build, ds101).
3. Do NOT include them in the style-guide-lock-in merge — keep that diff to the 6 SG commits.
