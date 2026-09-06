# PROGRESS — Evolution Stables (evo_02)

## Current State

- **Frontend (apps/web):** marketplace + purchase flow + right rail live. Right rail now consumes `@evo/ui` primitives (SSR-identical). 2 exact P1 eyebrow offenders remain inline (Phase C targets).
- **Shared UI:** `@evo/ui` package created — 5 primitives (Eyebrow, BackLink, StatusPill, StatRow, WhitePillCTA), token-vocabulary-only, tested.
- **Enforcement:** `just check-style` guard flags inline eyebrow/stat-row class strings (currently red on 2 known files — by design until Phase C).
- **Style guide:** LOCKED at `SSOT/doc/STYLE_GUIDE.md` (founder stamp 2026-09-04). Pointers: `website/AGENTS.md` + porch `DNA_REGISTRY.md` row 10. Draft file is a pointer only.
- **Backend/packages:** terminology sweep (Units→Stakes, 'elite' banned) landed on `design-alignment` — 10/10 gates green.
- **Blockers:** open font (Geist vs Inter) + P7 blend decisions. Phase C is mechanical, not blocked.

## Session Log

| Date | Focus | Status | Link |
|---|---|---|---|
| 2026-09-04 | Style guide lock-in (sandbox cycle) | ✅ done, go-live BLOCKED | [logs/2026-09-04.md](logs/2026-09-04.md) |
| 2026-09-04 | Style guide go-live (#1 stamp) | ✅ LOCKED + merged into design-alignment | [logs/2026-09-04.md](logs/2026-09-04.md) |
| 2026-09-04 | Porch restructure (function-named wings) | ✅ done + audited; dev server on :3010 | [logs/2026-09-04.md](logs/2026-09-04.md) |

## What's Next

1. **Porch follow-ups (2026-09-04 restructure):** remove stray `porch/new/` (orphaned `.next` cache); run `just check` from `engine/website`; harness inventory (CONTINUE.md Next #7).
2. **Phase C refactor:** MarketplaceSection.tsx:232, marketplace/[slug]/page.tsx:140 → then 8-file tracking-[0.2em] sweep → badge deprecation.
3. Resolve open founder decisions: font, P7 image-bg blend.
4. **Storybook** for primitives.
5. **Go-live checklist** (standing): website replaces `evo_01/02_website` on Vercel — see porch CONTINUE.md.

## Architecture Status

- **New:** `@evo/ui` workspace package (packages/ui) — shared primitives, consumed by apps/web.
- **New rule:** three-home doctrine — doctrine `SSOT/doc/`, implementation `website/packages/ui`, workshop `engine/infra/ui`.
- **New rule:** primitives may only emit existing theme-vocabulary classes.
- **New gate:** `just check-style` (inline-pattern guard).
- **Branch:** `design-alignment` (local-only, no push). `style-guide-lock-in` merged 2026-09-04.
