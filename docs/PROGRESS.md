# PROGRESS — Evolution Stables (evo_02)

## Current State

- **Frontend (apps/web):** marketplace + purchase flow + right rail live. Right rail now consumes `@evo/ui` primitives (SSR-identical). 2 exact P1 eyebrow offenders remain inline (Phase C targets).
- **Shared UI:** `@evo/ui` package created — 5 primitives (Eyebrow, BackLink, StatusPill, StatRow, WhitePillCTA), token-vocabulary-only, tested.
- **Enforcement:** `just check-style` guard flags inline eyebrow/stat-row class strings (currently red on 2 known files — by design until Phase C).
- **Style guide:** DRAFT at `build-loop/style-guide-lockin/STYLE_GUIDE-draft.md`; promotion to `evo_00/doc/STYLE_GUIDE.md` (LOCKED) pending founder go-live.
- **Backend/packages:** terminology sweep (Units→Stakes, 'elite' banned) landed on `design-alignment` — 10/10 gates green.
- **Blockers:** founder go-live on style-guide branch; open font (Geist vs Inter) + P7 blend decisions.

## Session Log

| Date | Focus | Status | Link |
|---|---|---|---|
| 2026-09-04 | Style guide lock-in (sandbox cycle) | ✅ done, go-live BLOCKED | [logs/2026-09-04.md](logs/2026-09-04.md) |

## What's Next

1. **Founder go-live** on `style-guide-lock-in` (merge + promote guide to evo_00/doc as LOCKED + AGENTS/GEMINI pointer).
2. **Phase C refactor:** MarketplaceSection.tsx:232, marketplace/[slug]/page.tsx:140 → then 8-file tracking-[0.2em] sweep → badge deprecation.
3. **Storybook** for primitives.
4. Resolve open founder decisions: font, P7 image-bg blend.

## Architecture Status

- **New:** `@evo/ui` workspace package (packages/ui) — shared primitives, consumed by apps/web.
- **New rule:** three-home doctrine — doctrine `evo_00/doc/`, implementation `evo_02/packages/ui`, workshop `workspace_01/ui-toolkit`.
- **New rule:** primitives may only emit existing theme-vocabulary classes.
- **New gate:** `just check-style` (inline-pattern guard).
- **Branch:** `style-guide-lock-in` (sandbox, 7 commits) + `design-alignment` (sweep, 5 commits) — both local-only, no push.
