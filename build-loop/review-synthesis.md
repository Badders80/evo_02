# Plan Review Synthesis — Horse Page Depth (build-loop Stage 2)

**Date:** 2026-08-31 · **Status:** REVIEWED — awaiting founder Gate 1 approval
**Reviewers:** A = opencode nemotron-3-ultra-free (free) · B = ollama deepseek-v4-pro:cloud (paid)
**Plan:** `build-loop/plan.md` + `build-loop/plan-graph.json`

---

## 🔥 Both agree (real problems — all fixed)

| # | Finding | Fix applied |
|---|---------|-------------|
| 1 | **TDD edge direction wrong** — `race-summary-lib → race-summary-test` implies lib depends on test; test must be written first | Edge reversed: `race-summary-test → race-summary-lib` (A#4, B#12) |
| 2 | **Chunk 1 missing `scripts/sync-race-log.py` from files list** | Added to files list + graph node (B#2) |
| 3 | **No node for applying approved content to inventory** — graph jumped from founder-gate straight to page render | Added `sql:apply-content` node + edges: `gate:founder-folder → sql:apply-content → file:reader` (A#6, B#13) |
| 4 | **Chunk 6 render target wrong** — story-block.tsx is a pure RSC (storyParagraphs only), overview-tab.tsx takes highlights+racingOutlook; neither receives new fields | Chunk 6 now specifies a NEW component (e.g. `campaign-status-block.tsx`) or page-level props (A#1) |
| 5 | **Chunk 3 must update `horses-data.ts` HorseCampaign type + reader** — plan said "reader" but didn't call out the interface | Chunk 3 now explicitly includes HorseCampaign interface + dual-shape reads (A#2) |
| 6 | **Missing edge: chunk-6 needs chunk-3's reader output** | Added `file:reader → file:page-tsx-render` edge; chunk-6 depends_on now includes chunk-3 (A#3) |

## 🟠 One flagged (fixed)

| # | Finding | Flagged by | Fix |
|---|---------|-----------|-----|
| 7 | Sync script path is outside evo_02 (knowledge repo) — runtime assumption | A#7 | Chunk 1: absolute path or env var for knowledge repo root |
| 8 | RaceLogEntry optional fields — sync must handle missing keys gracefully | A#8 | Chunk 1 Step 2: handle missing optional fields |
| 9 | `philosophy` already used as bio fallback — adding `bio` is only useful if content differs | A#9 | Chunk 4: keep philosophy short (PDS), bio carries long form |
| 10 | detail-tabs wins/placed props may be used elsewhere — removal could break | B#5 | Chunk 2 Step 5: verify no other usages before removing |
| 11 | isPlace definition ambiguous (NZ top-3 vs top-4) | B#3 | Chunk 2 test: isPlace = 1st/2nd/3rd explicitly |
| 12 | prizemoney may be null/string — sum must handle | B#16 | Chunk 2 test covers null/string |
| 13 | null/undefined raceLog must not crash page | B#18 | Chunk 2 test covers null; DoD: empty state not crash |
| 14 | Dollar-lead check only at audit (post-apply) — needs pre-apply | B#21 | Chunk 5 Step 2: dollar-lead scan BEFORE apply; new `cmd:dollar-lead-check` gate in chunk-7 |
| 15 | TrainerProfile consumers may break with new field | B#20 | Chunk 4 Step 1: check other consumers |
| 16 | Migration must be mirrored in `packages/db_models/src/schema/` | A#14 | Chunk 1: create both migration files |
| 17 | `hermes verify` — is it a real command? | A#15 | Verified: Hermes CLI binary exists (used in prior sprints) |
| 18 | Chunk 4 page edit (bio line) overlaps chunk-2's page edit | A#13 | Folded bio line into chunk-2's page edit; chunk-2 depends_on chunk-4 |

## 🔵 Contested (resolved by orchestrator)

| # | Item | A says | B says | Resolution |
|---|------|--------|--------|------------|
| 19 | `file:writer → file:reader` edge | (not flagged) | Spurious — reader doesn't import writer | **Kept** — it's a data-shape dependency (reader must read what writer writes), documented as such in the edge reason. Not a code import edge. |
| 20 | `file:legal-types → content-drafts` edges | Wrong — drafts are markdown, don't depend on types | (not flagged) | **Removed** — content drafts don't need types to exist; only apply does. Replaced with `gate:founder-folder → sql:apply-content → file:reader`. |
| 21 | `file:detail-tabs → file:page-tsx` edge direction | Wrong — page imports detail-tabs | (not flagged) | **Kept as-is** — the edge documents the data flow (page passes raceLog to detail-tabs), not the import. Reason updated. |

## 🟣 Edge gaps (both missed — orchestrator)

| # | Gap | Fix |
|---|-----|-----|
| 22 | **Same-physical-file split (page-tsx edit 1 / edit 2) needs explicit serialization** | chunk-6 depends_on chunk-2 — already in graph; now also documented in plan.md dependency section |
| 23 | **`updateCount` semantics undefined** — count of what? | Defined in chunk-3: count of investor updates for the horse (from knowledge repo investor-updates.md index) |
| 24 | **Coco has 0 starts — race summary shows "0 Wins · 0 Places"** — is that a dial-mover problem? | No — Coco is coming_soon; the empty state copy already handles it (race-tab EMPTY_COPY). Chunk 2's null-safe handling covers it. |

## Orchestrator gap analysis (what BOTH missed)

1. **The `just check` gate runs `turbo run lint typecheck test` — but the plan's chunks each commit after their own gate.** The build-loop rule "dirty tree = chunk not done" applies; each chunk must leave the repo green. Already in plan (each chunk has Gate step).
2. **`hermes verify` needs the dev server context** — it's a Hermes CLI command, not a repo script. Chunk 7 runs it from the session, not the repo. Noted in plan.
3. **The knowledge repo is a SEPARATE git repo (evo_01)** — content drafts in `01_evolution/horses/{slug}/` are outside evo_02's git. The folder-gate approval happens there; the apply step (sql:apply-content) writes to evo_02's local Supabase. Cross-repo flow documented in chunk-5.

---

## Verdict

**Both reviewers found real issues; all agreed fixes applied. Plan v2 is ready for founder Gate 1 approval.**

**Remaining founder decisions:** none — all §8 questions resolved. Gate 1 is the approval itself.

**Next:** founder approves → Stage 3 (chunk graph already built) → Stage 4 dispatch.
