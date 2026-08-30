# Verdict: WARN

## Findings (numbered, severity, chunk-ref)

1. **CRITICAL** — Chunk map contradicts prose: `plan.md` lists chunk 9 as **rail-contents** (the real status-driven RIGHT CTA), but `plan-graph.json` makes chunk 9 the **gate-audit** and stuffs `right-rail.tsx` into `chunk-1-skeleton` as a “placeholder.” The status-driven investment rail is founder-locked; its DOD, dependencies, and sequencing are undefined in the graph. *chunk-ref: chunk-1-skeleton, chunk-9-gate-audit, right-rail.tsx*

2. **HIGH** — Unverified data assumptions will block execution. The plan relies on `aboutHorse`/`trainerBio`, PDS/SA URLs, trainer socials/website in evo_02, inventory `status` enum (`listed`/`fully_subscribed`), slug-to-campaign mapping, and video sources, but none are in the verified-assumptions list. *chunk-ref: chunk-1-skeleton, chunk-2-story, chunk-4-tabs-shell-overview-docs, chunk-8-tab-trainer*

3. **HIGH** — Missing type/schema chunk. Adding `race_log` jsonb and a 4-gen `pedigree_data` shape requires regenerating Supabase types and updating TypeScript interfaces; without that, `just check` will fail. Prod also lacks `race_log`, so the code needs nullable fallbacks until founder-gated prod migration. *chunk-ref: chunk-5-data, chunk-6-tab-pedigree, chunk-7-tab-race*

4. **MEDIUM** — `/horses/[slug]` redirect likely violates the founder-locked **CUT=hide** rule (“don’t show, never delete logic”). Replacing the 295-line existing page with a redirect deletes the old page logic unless a founder exception is recorded or the redirect is implemented in `next.config.js` while the old file is archived. *chunk-ref: chunk-1-skeleton, file:apps/web/src/app/horses/[slug]/page.tsx*

5. **MEDIUM** — `cmd:walk` is gate theater. Curl 200s prove the server responds but cannot verify sticky RIGHT rail, status-driven state switching, muted video autoplay after 1s, lightbox behavior, tab navigation, or guest-gating blur. *chunk-ref: chunk-9-gate-audit, cmd:walk*

6. **MEDIUM** — Route/SEO scope gap. No `generateMetadata`, `not-found.tsx`, `loading.tsx`, sitemap update, or canonical/redirect config for `/marketplace/[slug]` and `/horses/[slug]`. *chunk-ref: chunk-1-skeleton*

7. **LOW** — Reuse edges are pattern-only, not real component matches. `LogoCarousel` is a logo strip, not a media thumb carousel; `CtaLeadModal` is a lead modal, not an image/video lightbox. Their APIs must be spiked before reuse. *chunk-ref: chunk-3-media*

8. **LOW** — `marketplace-listing-grid.tsx` path is not verified; only `apps/web/src/app/marketplace/page.tsx` was checked. If the card grid lives elsewhere, chunk 1 repointing will miss. *chunk-ref: chunk-1-skeleton*

## Edge check (dependencies confirmed/doubted, with reasons)

- **Confirmed:** `page.tsx` → `media-deck.tsx` / `story-block.tsx` / `right-rail.tsx`; `tabs.tsx` → all tab panels; SQL seeds → `pedigree-tab.tsx` / `race-tab.tsx`; `/horses/[slug]` redirect → `/marketplace/[slug]`; `marketplace-listing-grid.tsx` → new route; `just-check` → `walk` → `audit:kimi`.
- **Doubted:** `LogoCarousel.tsx` → `media-deck.tsx` and `CtaLeadModal.tsx` → `media-deck.tsx` are “pattern” edges, not actual import-compatible components. `horses-data.ts` → new page assumes a single-slug lookup exists; it does not. `right-rail.tsx` inside `chunk-1-skeleton` has no dependency on status data or migration, yet it is supposed to be status-driven. No edge covers Supabase type regeneration, sitemap/redirect config, or SEO metadata.

## Pre-empt list (max 5, concrete)

1. **Reconcile the chunk map.** Make `right-rail.tsx` its own chunk (e.g., `chunk-9-rail-contents`) with a DOD covering both `listed` and `fully_subscribed` states; move the gate to `chunk-10`. Add edges from data layer + status enum verification into the rail chunk.

2. **Data-shape spike before skeleton.** Verify or add: `getCampaignBySlug`, inventory `status` enum, `aboutHorse`/`trainerBio`, PDS/SA URLs, trainer socials schema, and video sources. If any are missing, add a spike chunk and update `horses-data.ts` before chunk 1.

3. **Add a `types + schema` chunk after chunk-5.** Run `supabase gen types`, update inventory interfaces for 4-gen `pedigree_data` and new `race_log` jsonb, and add nullable/runtime fallbacks so prod does not crash before the founder-gated migration.

4. **Replace curl-only walk with real verification.** Add a Playwright or manual screenshot checklist for LEFT/RIGHT ratio, sticky rail, video autoplay/pause, lightbox, tab switch, guest-gating blur, plus psql assertions for migrated data. Keep curl as a smoke test only.

5. **Resolve redirect vs. CUT rule.** Get a founder-written exception for deleting the old `/horses/[slug]` page, or implement the redirect in `next.config.js` and archive the old page. Also add `not-found.tsx`, `loading.tsx`, `generateMetadata`, and sitemap updates for the new route.