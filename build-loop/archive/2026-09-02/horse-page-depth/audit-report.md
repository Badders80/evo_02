# Horse Page Depth Audit Report — chunks 1-7 + E1/E2 (Stage 5)

**Date:** 2026-08-31 · **Auditor:** `kimi-k2.7-code:cloud` (paid) + orchestrator deterministic verification
**Scope:** `git diff faa6632~1..8fe7eaa` — 26 files, +1491/−549 (10 commits, branch `design-alignment`, local-only)
**Commits audited:** `faa6632` (chunk-1 migration+sync) → `8fe7eaa` (session wrap)

## Verdict: **PASS with 1 FAIL + 1 WARN** — 13/15 claims verified; 2 findings, both confirmed by independent re-verification

| # | Claim | Result | Evidence |
|---|---|---|---|
| C1 | Migration 00008 adds race_log JSONB, both locations | PASS | `supabase/migrations/00008_*.sql` + `packages/db_models/src/schema/00008_*.sql` both contain `ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS race_log JSONB;` |
| C2 | sync-race-log.py maps snake→camel + upserts | PASS | `scripts/sync-race-log.py` SNAKE_TO_CAMEL_MAP (race_name→race, track_condition→trackCondition); header documents mapping |
| C3 | race_log populated to FULL knowledge-repo record (PR=10, FG=11) | **FAIL** | psql `jsonb_array_length`: prudentia=**6**, first-gear=**2**, hottathanafantasy=0. Root cause: knowledge repo `race-record.json` `starts` arrays are PARTIAL (prudentia total_starts=10 but len(starts)=6; first-gear total_starts=11 but len(starts)=2) — totals are metadata only. Sync copied what exists; not a sync bug, a source-data gap. |
| C4 | Race summary computed, never hardcoded | PASS | `race-summary.ts` computeRaceSummary (null-safe, 1st=win, 2nd/3rd=place, earnings skips non-numbers); detail-tabs.tsx wins/placed props removed; live HTML "Summary: 2 Wins · 1 Place" |
| C5 | MC content fields flow writer→jsonb→reader | PASS | legal_engine types + campaign-pipeline buildSoftLegal/buildInventoryInsert + intake-adapter + horses-data dual-shape read; round-trip test passed (forced run) |
| C6 | Trainer full bios (bio ?? philosophy) | PASS | trainers.ts bio for Wexford (600+ winners, 12× champion jockey, 2,479 wins, Japan Cup 1989, Waitak/Molly Bloom/Rocket Spade) + Stephen Gray (825+ wins, 6 Gr.1s, 2× Singapore Derby, Royal Ascot/HK/Dubai); live HTML shows full Wexford bio |
| C7 | Founder-approved content applied | PASS | psql: all 3 horses have campaignNarrative/trainerQuote/nextUp/latestUpdateUrl; updateCount prudentia=31, hottathanafantasy=11, first-gear=null; drafts in evo_01 knowledge repo |
| C8 | $$$$ rule: no dollar leads | PASS | `grep -F '$'` over hook/story/nextUp/narrative × 3 horses = 0 matches |
| C9 | CampaignStatusBlock renders all present blocks | PASS | blocks array composition; live prudentia shows all 3; first-gear link block gated by updateCount=null |
| C10 | E1: full card clickable | PASS | marketplace-listing-grid.tsx article onClick router.push + role="link" + aria-label; inner Links preserved |
| C11 | E2: MediaDeck carousel wired | **WARN** | Wired + component complete (deck/counter/thumbnails/lightbox/arrows/1s autoplay) but live render = **1 slide** (`01 · 01`, one thumbnail). `getGalleryImages` reads `public/images/content/horses/{slug}` (EMPTY — only flat -BG.png/-cover.png) while the 4 real images live at `public/horses/{slug}/01-04` (listed in `HORSE_STILLS` cdn.ts). `getCampaignMedia().horse.paradeGallery` would supply them. |
| C12 | Gates green | PASS | `just check` 10/10; forced `turbo run lint typecheck test --force` → 22/22, 0 cached; lint 0 errors / 17 warnings (2 new: page.tsx:4 `Image`, page.tsx:25 `PedigreeLine` — dead imports from MediaDeck swap); live walk 4× 200 |
| C13 | Branch local-only, tree clean | PASS | `design-alignment`, no upstream, `git status --short` empty |
| C14 | [DRAFT — verify with trainer] markers present | PASS | psql trainerQuote: prudentia + first-gear carry markers; documented founder action |
| C15 | first-gear latestUpdateUrl is prose, not URL | PASS (content defect) | psql confirms malformed value; hidden by updateCount=null gate — fix content |

## Findings (both independently re-verified)

1. **F1 (FAIL, C3) — race_log incomplete vs DoD.** Prudentia 6/10 starts, First Gear 2/11. The sync script is correct; the knowledge repo `starts` arrays are partial (totals in metadata). DoD required full records. **Fix path:** backfill knowledge repo `starts` arrays from loveracing.nz (source of truth, `loveracing_id` + `performance_profile_url` present), re-run sync. Data task, not code.
2. **F2 (WARN, C11) — MediaDeck renders hero only.** Gallery loader points at empty dir; real assets in `public/horses/{slug}/` + `HORSE_STILLS`. **Fix:** source gallery from `media.horse.paradeGallery`; drop dead `Image`/`PedigreeLine` imports.

## Audit-of-the-auditor

Kimi's FAIL/WARN both match orchestrator's independent verification (psql counts, live HTML counter). No false positives this run. Kimi's C3 verdict (FAIL vs WARN) is the strict reading — DoD explicitly claimed 10/11, so FAIL is correct.

## Walk evidence

- `/marketplace` 200 · `/marketplace/prudentia` 200 · `/marketplace/hottathanafantasy` 200 · `/marketplace/first-gear` 200
- Prudentia live HTML: story, What's Next, investor update link (31 sent), trainer quote, "2 Wins · 1 Place" summary, full Wexford bio — all server-rendered
- MediaDeck counter `01 · 01` + single thumbnail (F2)

**Structured graph:** `build-loop/audit-graph.json` (15 findings, evidence edges).
