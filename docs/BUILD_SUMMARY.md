# BUILD_SUMMARY — Evolution Stables (evo_02)

**Updated:** 2026-09-04

## What Exists Now

| Area | Status | Notes |
|---|---|---|
| apps/web | ✅ | Marketplace, purchase flow, right rail (consumes @evo/ui) |
| apps/mission_control | ✅ | Operator console |
| packages/brand_dna | ✅ | Tokens, theme.css, tailwind-preset, voice |
| **packages/ui (@evo/ui)** | ✅ **NEW** | Eyebrow, BackLink, StatusPill, StatRow, WhitePillCTA + cn |
| packages/legal_engine, db_models, storage | ✅ | Terminology sweep landed |
| Style guide | 🟡 DRAFT | `build-loop/style-guide-lockin/STYLE_GUIDE-draft.md` → evo_00/doc on go-live |
| Enforcement | ✅ | `just check-style` guard (red on 2 known Phase C files) |

## Architecture Rules

- **Three-home doctrine:** doctrine = `evo_00/doc/STYLE_GUIDE.md` (SSOT), implementation = `evo_02/packages/ui`, workshop = `workspace_01/ui-toolkit`.
- **Token vocabulary only:** primitives emit only existing theme classes (accent/gold #d4a964, muted-foreground #737373, border tokens). No new hex, no arbitrary values.
- **One client first:** right rail is the first primitive consumer; Phase C extends to all surfaces.
- **Enforcement:** inline eyebrow/stat-row class strings are a lint violation (`just check-style`).
- **Sandbox contract:** nothing merges/lands without founder go-live.

## Data Model

Unchanged this cycle (no schema/migration work).

## Key Files

- `packages/ui/src/*` — the 5 primitives
- `apps/web/src/components/horse/right-rail.tsx` — first consumer
- `scripts/check-style-guard.sh` — enforcement
- `build-loop/style-guide-lockin/STYLE_GUIDE-draft.md` — the doctrine (draft)
