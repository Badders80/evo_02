# Horse Page Depth — Implementation Plan (build-loop Stage 1)

**Goal:** Make /marketplace/[slug] horse pages deep enough that a potential investor says "they know this horse well enough for my money" — via race-record wiring (logic), MC schema + authored content (content), and the investor-updates loop (capture).

**Architecture:** Knowledge repo (`01_evolution/horses/{slug}/`) is the canonical content source → synced into evo_02 inventory jsonb → rendered by the page. New MC fields carry the authored narrative (dial-movers, trainer quote, what's-next, update link). Race summary is computed from race_log, never hardcoded.

**Tech Stack:** Next.js 15 (apps/web), Supabase local (:54321), pnpm turbo monorepo, TypeScript, JSONB columns (soft_legal, marketing, pedigree_data, race_log).

**Gate:** `just check` (= `turbo run lint typecheck test`) must pass. `hermes verify --json --skip-start` ok:true.

**Branch:** design-alignment (local-only, never push — purge-then-push later).

---

## Verified schema facts (2026-08-31)

- `race_log` column: **in TS types (`database.types.ts:190`) but NOT in any migration** — added ad-hoc to local DB by `scripts/migrate-pedigree-racelog.py`. **Needs migration 00008.**
- `RaceLogEntry` shape: `{date, venue, race, trackCondition, result, margin, distance_m, race_class, jockey, prizemoney_nzd, starting_price}` (`database.types.ts:14-26`).
- Knowledge repo `race-record.json` uses **snake_case** keys (`track_condition`, `race_name`, `prizemoney_nzd`) — needs mapping to RaceLogEntry camelCase.
- `soft_legal` / `marketing` are JSONB — **new fields need no schema change**, just writer/reader/types.
- `TrainerProfile` (`knowledge.types.ts:30-44`): slug, name, stableName, location, base, philosophy, highlightTags — **no bio field**. Needs `bio` added.
- `HorseSoftLegalContent` (`legal_engine/src/types.ts:47-51`): aboutHorse, trainerBio, racingOutlookAndPedigree — needs campaignNarrative, trainerQuote, nextUp, latestUpdateUrl, updateCount.
- Writer: `apps/mission_control/src/lib/campaign-pipeline.ts` (buildSoftLegal/buildMarketing).
- Reader: `apps/web/src/lib/horses-data.ts` (rowToCampaign, dual-shape read).
- Page: `apps/web/src/app/marketplace/[slug]/page.tsx` — **`wins="0" placed="0"` hardcoded at lines 242-243**.
- Stable links already wired: `apps/web/src/lib/stable-links.ts` (wexfordstables.co.nz, stephengrayracing.com).
- Data: Prudentia 10 starts / $36,585 / rating 66 (knowledge repo) vs 6 starts in evo_02. First Gear 11 starts / $24,975 / rating 57 vs 2 in evo_02. Coco 0 starts, coming_soon.
- Investor updates: `02_website/public/updates/` — prudentia_campaign_update_22july2026, prudentia_stable_report_21august2026, hottathanafantasy_stable_report_21august2026 (Andrew Scott quote: "A snappy little filly who came a long way very quickly.").

## Locked rules (founder, 2026-08-31)

1. **$$$$ rule:** never lead with dollar figures. "Owners turned down an attractive offer from Australia" NOT "$300k". Dollars only in derived full record.
2. **Hook principle:** dial-movers bait the click, values-aligned, no info-dump.
3. **Scope:** Prudentia (racing-now) + Coco (coming-soon) + First Gear (completed showcase).
4. **Loop:** Option A (manual capture) now; Option B (pipeline automation) later.
5. **Race log SSOT:** knowledge repo canonical → sync to inventory.
6. **Authoring:** subagent drafts → folder-gate approval (knowledge repo `01_evolution/horses/{slug}/`).
7. **First Gear buyer:** Australia (Herald 31 May 2024), NOT Hong Kong.

## Phase E — Quick wins (founder-confirmed 2026-08-31, post-audit)

### E1 — Full marketplace card clickable
**Files:** `apps/web/src/components/marketplace-listing-grid.tsx`
Currently only the image + "Explore Offering" link navigate. Make the FULL card (name, hook, tags, whole pill) clickable → `/marketplace/{slug}`. Wrap the `<article>` in a Link or add onClick navigation. Keep the inner links working (nested-link a11y: use onClick on article + cursor-pointer, or restructure).

### E2 — Wire MediaDeck into the horse page (carousel is BUILT, not wired)
**Files:** `apps/web/src/app/marketplace/[slug]/page.tsx` (lines 148-166 static hero → MediaDeck)
`apps/web/src/components/horse/media-deck.tsx` already implements: hero + scrollable thumbnail row (overflow-x-auto, same as "AS FEATURED IN"), video thumbnails with play-logo overlay, 1s-delay muted autoplay when video becomes main slide, lightbox, arrows, slide counter. Replace the static hero with `<MediaDeck heroImage gallery videoUrl sex colour sire dam breadcrumbName />`. Gallery from `getCampaignMedia`/HORSE_STILLS (all 6 horses have 2-6 images on disk).

### E3 — Right-rail terms/conditions workflow (next high-value build — separate planning pass, see below)

## Out of scope

Marketplace L1 redesign, right rail/pricing, video, per-horse JSON-LD, Option B automation, Nellie/TML/Manolo content depth.

---

## Chunks

### Chunk 1 — Migration 00008: race_log column + seed sync

**Files:**
- Create: `supabase/migrations/00008_race_log_and_content_fields.sql`
- Create: `packages/db_models/src/schema/00008_race_log_and_content_fields.sql` (mirrored — reviewer A#14)
- Create: `scripts/sync-race-log.py` (reviewer B#2 — was missing from files list)

**Step 1:** Write migration (both locations):
```sql
BEGIN;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS race_log JSONB;
COMMIT;
```

**Step 2:** Sync race_log from knowledge repo (Prudentia 10 starts, First Gear 11 starts, Coco 0) — `scripts/sync-race-log.py` reads `01_evolution/horses/{slug}/race-record.json` (ABSOLUTE path or env var — knowledge repo is outside evo_02, reviewer A#7) and maps snake_case → RaceLogEntry camelCase (`race_name`→`race`, `track_condition`→`trackCondition`), upserts into inventory.race_log. Handle missing optional fields gracefully (reviewer A#8).

**Step 3:** Verify: `SELECT slug, jsonb_array_length(race_log) FROM inventory;` → prudentia=10, first-gear=11, hottathanafantasy=0.

**Step 4:** Commit: `feat(db): race_log column + knowledge-repo race sync`

**DoD:** migration applies clean (both locations), race_log populated from knowledge repo, counts verified.

### Chunk 2 — Race summary computation (fix hardcoded wins/places)

**Files:**
- Create: `apps/web/src/lib/race-summary.test.ts` (TDD — written FIRST, reviewer A#4/B#12)
- Create: `apps/web/src/lib/race-summary.ts`
- Modify: `apps/web/src/components/marketplace/detail-tabs.tsx` (compute summary from raceLog internally; **verify no other usages of wins/placed props before removing** — reviewer B#5)
- Modify: `apps/web/src/app/marketplace/[slug]/page.tsx` (edit 1: remove hardcoded `wins="0" placed="0"` lines 242-243, wire raceLog, trainer bio line `bio ?? philosophy`)

**Step 1:** Write failing test: `computeRaceSummary(raceLog)` returns {wins, places, earnings}. **Cover null/undefined raceLog** (reviewer B#18), isPlace = 1st/2nd/3rd (reviewer B#3), prizemoney null/string handling (reviewer B#16).
**Step 2:** Run test — verify FAIL.
**Step 3:** Implement `apps/web/src/lib/race-summary.ts` (null-safe).
**Step 4:** Run test — verify PASS.
**Step 5:** Wire: page passes raceLog; detail-tabs computes summary internally; remove wins/placed props (after usage check).
**Step 6:** Gate: `just check`.
**Step 7:** Commit: `fix(web): race summary computed from race_log, never hardcoded`

**DoD:** Prudentia page shows "2 Wins · 1 Place · $36,585" — computed, not hardcoded. First Gear shows "1 Win · 2 Places". Null race_log renders empty state, not crash.

### Chunk 3 — MC schema: new content fields

**Files:**
- Modify: `packages/legal_engine/src/types.ts` (HorseSoftLegalContent: add campaignNarrative?, trainerQuote?, nextUp?, latestUpdateUrl?, updateCount?)
- Modify: `apps/mission_control/src/lib/campaign-pipeline.ts` (buildSoftLegal: carry new fields)
- Modify: `apps/mission_control/src/lib/intake-adapter.ts` (RawPublishPayload softLegal: add new fields)
- Modify: `apps/web/src/lib/horses-data.ts` (rowToCampaign dual-shape read of new fields + **HorseCampaign type** — reviewer A#2)

**Step 1:** Update types (legal_engine).
**Step 2:** Update writer (campaign-pipeline buildSoftLegal) to pass through new fields.
**Step 3:** Update reader (horses-data rowToCampaign) dual-shape read + HorseCampaign interface.
**Step 4:** Update intake-adapter RawPublishPayload.
**Step 5:** Tests: campaign-pipeline.test.ts — enrich payload with new fields, assert written to jsonb.
**Step 6:** Gate: `just check`.
**Step 7:** Commit: `feat(mc): campaign narrative, trainer quote, next-up, update-link fields`

**DoD:** New fields flow writer → jsonb → reader → HorseCampaign. Tests green.

### Chunk 4 — Trainer bio: full bios on trainer tab

**Files:**
- Modify: `packages/db_models/src/types/knowledge.types.ts` (TrainerProfile: add `bio?: string`; **check other consumers of TrainerProfile** — reviewer B#20)
- Modify: `packages/db_models/src/data/trainers.ts` (add full bios from evo_01 trainers.json; **keep philosophy short for PDS, bio carries the long form** — reviewer A#9)
- Modify: `apps/web/src/app/marketplace/[slug]/page.tsx` (bio line: `bio: trainerProfile?.bio ?? trainerProfile?.philosophy` — folded into chunk-2's page edit, reviewer A#13)

**Step 1:** Add bio field to TrainerProfile type.
**Step 2:** Populate trainers.ts with the two full bios (Wexford 600+ wins / Lance O'Sullivan 12× champion jockey / 2,479 wins / 1989 Japan Cup / Waitak / Molly Bloom / Rocket Spade; Stephen Gray 825+ wins / 6 Gr.1s / 2× Singapore Derby / Gold Cup / QEII Cup / 2× Lion City Cup / Royal Ascot / HK / Dubai).
**Step 3:** Wire page bio line (in chunk-2 edit).
**Step 4:** Gate: `just check`.
**Step 5:** Commit: `feat(web): full trainer bios on trainer tab`

**DoD:** Trainer tab shows the full Wexford/Stephen Gray bios, not 1-line philosophy.

### Chunk 5 — Content authoring: Prudentia + Coco + First Gear (subagent-drafted, folder-gated)

**Files (drafts — NOT applied to DB):**
- Create: `01_evolution/horses/prudentia/content-draft.md`
- Create: `01_evolution/horses/hottathanafantasy/content-draft.md`
- Create: `01_evolution/horses/first-gear/content-draft.md`
- Create: `scripts/apply-content.sql` (or MC apply — reviewer B#9: exact mechanism specified)

**Step 1:** Dispatch subagent to draft content per horse from knowledge repo + investor updates, following locked rules (dial-movers, no dollar leads, hook principle).
**Step 2:** ⛔ **FOUNDER FOLDER-GATE** — drafts sit in knowledge repo for founder approval. **Dollar-lead check BEFORE apply** (reviewer B#21): scan drafts for "$" in story/hook/nextUp.
**Step 3:** After approval: apply approved content to inventory jsonb (soft_legal.campaignNarrative, trainerQuote, nextUp, latestUpdateUrl, updateCount) via `scripts/apply-content.sql` or MC.

**DoD:** Approved content in knowledge repo; applied to inventory after gate; dollar-lead check clean.

### Chunk 6 — Page render: what's-next, update link, update count

**Files:**
- Create or modify: `apps/web/src/components/horse/` — **story-block.tsx is a pure RSC receiving only storyParagraphs; overview-tab.tsx is a client component taking highlights + racingOutlook. Neither receives the new fields. Need a NEW component (e.g. `campaign-status-block.tsx`) or extend the page to pass new props** (reviewer A#1)
- Modify: `apps/web/src/app/marketplace/[slug]/page.tsx` (edit 2: render what's-next + update link — serialized after edit 1)

**Step 1:** Create the what's-next/update-link component (or extend page).
**Step 2:** Wire new fields into page render (what's-next block, "Read the latest investor update →" link, update count).
**Step 3:** Gate: `just check`.
**Step 4:** Commit: `feat(web): what's-next + investor update link on horse page`

**DoD:** Page shows what's-next from latest update, links to hosted update, shows update count.

### Chunk 7 — Final gates + kimi audit

**Step 1:** `just check` full pass.
**Step 2:** `hermes verify --json --skip-start` ok:true (Hermes CLI — exists as a binary, reviewer A#15).
**Step 3:** **Dollar-lead check** (reviewer A#10/B#21): automated scan — no "$" in story/hook/nextUp fields.
**Step 4:** Browser walk: /marketplace/prudentia, /marketplace/hottathanafantasy, /marketplace/first-gear — all tabs, no empty states where data exists, no stale copy, no dollar leads.
**Step 5:** kimi-code-audit on the full diff (claims from this plan) → audit-report.md + audit-graph.json in build-loop/.
**Step 6:** Update CONTINUE.md.

**DoD:** Audit PASS (or WARNs accepted by founder). Branch still local-only.

---

## Dependency graph

```
chunk-1 (migration + race sync) → chunk-2 (race summary) [needs race_log populated]
chunk-3 (MC schema) → chunk-5 (content authoring) [needs fields to exist] → chunk-6 (page render)
chunk-4 (trainer bio) — independent, but chunk-2's page edit includes the bio line (A#13)
chunk-2 depends on chunk-4 (page edit 1 needs trainers data for bio line)
chunk-6 depends on chunk-2 + chunk-3 + chunk-5 (page edit 2 serialized after edit 1; reader must expose fields)
chunk-7 (final gates) — depends on all
```

Parallelizable wave 1: chunk-1 + chunk-3 + chunk-4 (no file overlap — verified structurally).
Wave 2: chunk-2 (after chunk-1 + chunk-4). Wave 3: chunk-5 (after chunk-3). Wave 4: chunk-6 (after chunk-5 + chunk-2 + chunk-3). Wave 5: chunk-7.

## Risks

- **race_log not in migrations** — local DB has it, prod won't. Migration 00008 fixes; do NOT apply to prod (founder-gated).
- **Knowledge repo snake_case vs RaceLogEntry camelCase** — mapping in sync script; verify counts after.
- **Content quality** — subagent drafts need founder folder-gate; no auto-apply.
- **Dollar leads** — audit checks for "$" in story/hook fields.
- **Branch push** — remains blocked (dead sb_secret in old commits); purge-then-push later.
