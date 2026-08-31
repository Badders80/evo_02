# E3 Pre-Purchase Terms — Chunks

**Approved Date:** 2026-09-01
**Branch:** `design-alignment` (LOCAL-ONLY)
**Decision SSOT:** `build-loop/e3-right-rail-deepdive.md`
**Scope Fence:** `.agents/rules/e3-sprint.md`

---

### Chunk 1: E3 Unit Test Suite (TDD)
- **Node:** `file:apps/web/src/tests/e3_right_rail.test.ts`
- **Depends On:** none
- **Files:** `apps/web/src/tests/e3_right_rail.test.ts`
- **Description:** Tests for share-math (1% floor, 0.5% step), `pricingForUnits` calculations, 5 pillars copy compliance (whitelist vocabulary, 0 exclamation marks), and legal pack hash invariants.
- **Commit Message:** `test(web): e3 right rail invariants and slider pricing unit tests`

---

### Chunk 2: Right-Rail Accordion & Acceptance Gate Component
- **Node:** `file:apps/web/src/components/horse/right-rail.tsx`
- **Depends On:** `chunk-1`
- **Files:** `apps/web/src/components/horse/right-rail.tsx`
- **Description:** Implement 5-pillar accordion drop-downs (The Deal, What's Included, What If, Your Return, Exit & Transfer), interactive stake slider with live NZD pricing via `pricingForUnits`, and the dark glassmorphic Acceptance Gate modal with PDS/SA scrollable viewports, dual checkboxes, and disabled checkout button.
- **Commit Message:** `feat(web): e3 right-rail 5-pillar accordion and acceptance gate modal`

---

### Chunk 3: Marketplace Page Integration
- **Node:** `file:apps/web/src/app/marketplace/[slug]/page.tsx`
- **Depends On:** `chunk-2`
- **Files:** `apps/web/src/app/marketplace/[slug]/page.tsx`
- **Description:** Wire server-compiled legal pack (`getCompiledLegalPackForCampaign`) and stake parameters to `<RightRail />`.
- **Commit Message:** `feat(web): wire compiled legal pack and stake parameters to marketplace right-rail`

---

### Chunk 4: Verification & Gate Pass
- **Node:** `cmd:just_check`
- **Depends On:** `chunk-3`
- **Commands:** `just check`, `pnpm --filter @evo/web typecheck`, dev server walk on :3010.
- **DOD:** 10/10 gates PASS, typecheck clean, live walk verified with zero errors on active and adjacent screens.
