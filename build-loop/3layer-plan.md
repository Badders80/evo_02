# 3-Layer Horse Storytelling — Execution Plan

**Goal:** Make every horse-story string pull from the correct inventory jsonb field at each of the 3 content layers (L1 card / L2 story / L3 overview), ship the page, no visual redesign.

**Status:** FOUNDER-APPROVED 2026-08-31 (verbal: "go for it, don't stop until done")
**Branch:** design-alignment · **Surface:** LEFT ⅔ of /marketplace/[slug] (RIGHT rail untouched)

## Locked decisions
1. Overview tab heading stays "About [Horse]" — NO rename.
2. `aboutHorse` + `racingOutlookAndPedigree` REQUIRED at intake (throw).
3. Hook fallback = first sentence of aboutHorse, never full story.
4. JSONB key shape: camelCase canonical; reader gets snake_case backward-compat fallback.
5. Meta description (SEO base) = `getMarketplaceHook(campaign)` (hook → first sentence). Full-story desc deferred.
6. No visual formatting changes, no pedigree component changes.

## Files to modify
- `apps/mission_control/src/lib/campaign-pipeline.ts` (writer: camelCase keys + required-field guard)
- `apps/mission_control/src/lib/campaign-pipeline.test.ts` (reject cases + enrich valid payload)
- `apps/web/src/lib/horses-data.ts` (reader dual-shape + `firstSentence` + `getMarketplaceHook`)
- `apps/web/src/app/marketplace/page.tsx` (card hook via helper)
- `apps/web/src/app/marketplace/[slug]/page.tsx` (meta description via helper + OG via campaignShareMetadata)
- Create: `apps/web/src/app/sitemap.ts`, `apps/web/src/app/robots.ts`

## Verification
- `pnpm exec turbo run test typecheck` green after each chunk
- Supabase local :54321 responds 200
- Dev server :3010 currently 500 → NOT a blocker (pre-existing; will validate via build/typecheck + optional boot)

## Out of scope
Visual formatting, pedigree components, highlight_tags chips on cards (separate task), per-horse JSON-LD, race-date smart fallback in MC.

[verified: all file paths read 2026-08-31; key-shape mismatch confirmed writer=snake vs reader+seed=camel]
