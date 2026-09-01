# Chunks — 3-Layer Storytelling

Sequential chain (each chunk leaves repo green). Audit (kimi-k2.7-code) after each chunk.

## chunk-1 — Writer canonicalizes + required-field guard
**Files:** apps/mission_control/src/lib/campaign-pipeline.ts, apps/mission_control/src/lib/campaign-pipeline.test.ts
**DoD:** JSONB insert keys camelCase (`aboutHorse`, `trainerBio`, `racingOutlookAndPedigree`, `marketplaceHook`, `highlightTags`); `createCampaignFromIntake` throws on missing/empty `aboutHorse`/`racingOutlookAndPedigree`; test proves throw; existing integration test payload enriched with softLegal + passes; `pnpm exec turbo run test typecheck` green.
**Commit:** `chore(mc): canonicalize jsonb keys to camelCase; require story fields at intake`

## chunk-2 — Reader dual-shape + helpers
**Files:** apps/web/src/lib/horses-data.ts
**DoD:** `rowToCampaign` reads `camel ?? snake` for softLegal+marketing; exports `firstSentence(text)` and `getMarketplaceHook(campaign)` (hook || firstSentence(aboutHorse) || ''); typecheck green.
**Commit:** `feat(web): read both jsonb key shapes; add first-sentence hook helper`

## chunk-3 — Wire L1 card + L3 page meta/OG
**Files:** apps/web/src/app/marketplace/page.tsx, apps/web/src/app/marketplace/[slug]/page.tsx
**DoD:** card hook = `getMarketplaceHook(campaign)` (no full-story dump); [slug] meta description = same helper; OG/twitter via `campaignShareMetadata(campaign, path, title)` in generateMetadata; typecheck green.
**Commit:** `feat(web): wire marketplace hook + page meta via first-sentence helper`

## chunk-4 — Minimal SEO base
**Files:** create apps/web/src/app/sitemap.ts, apps/web/src/app/robots.ts
**DoD:** sitemap = static routes (/, /marketplace, /horses/[slug]) + all campaigns from getAllCampaigns; robots.ts allows all + sitemap URL; build/typecheck green.
**Commit:** `feat(web): add sitemap + robots`

## chunk-5 — Final verification + audit
**DoD:** full `pnpm exec turbo run test typecheck` green; kimi-code-audit all claims PASS (WARNs accepted by founder); audit-report + audit-graph written to build-loop/.
