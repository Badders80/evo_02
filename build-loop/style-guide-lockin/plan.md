# STYLE GUIDE LOCK-IN — Cycle plan

**Date:** 2026-09-04
**Sandbox:** branch `style-guide-lock-in` (local-only, nothing merges/lands without founder approval)
**Sourced from:** `build-loop/format-pass/CONTINUE.md` → "Next cycle — STYLE GUIDE LOCK-IN" (4-phase scope)

## Goal (one sentence)

Lock the canonical style guide (doc) + the five shared primitives (code package) + an enforcement guard on a sandbox branch, so future surface work starts from one source instead of per-surface hand-rolling.

## Architecture (three-home doctrine — founder-agreed 2026-09-04)

| Home | Location | Status this cycle |
|---|---|---|
| Doctrine | `evo_00/doc/STYLE_GUIDE.md` | DRAFT written in cycle dir; promoted to SSOT **only on go-live approval** |
| Implementation | `evo_02/packages/ui` → `@evo/ui` | Created + gated + audited this cycle |
| Workshop | `workspace_01/ui-toolkit` | Referenced (inspiration/prod refs), untouched |

## Scope (this session = Phase A + B + D-lite)

- **Phase A:** Draft `STYLE_GUIDE-draft.md` — 7 locked pattern rules + token references + prod-diff notes.
- **Phase B:** Extract 5 primitives → `packages/ui`: `Eyebrow`, `BackLink`, `StatusPill` (status="listed"|"fully_subscribed"|"coming_soon"|"completed"), `StatRow`, `WhitePillCTA`.
- **Phase D-lite:** `scripts/check-style-guard.sh` + `just check:style` recipe (flags inline eyebrow re-pattern). Storybook deferred.

## Out of scope (deferred — next cycle)

- **Phase C** surface refactor (marketplace, mystable, login, mission control, FAQ/learn/returns, documents gate, detail tabs). Requires founder sign-off on guide + primitives FIRST (the wrap-up's warning).
- AGENTS.md/GEMINI.md style-guide pointer (go-live step, once guide is LOCKED).
- Storybook. Dot-grid background-depth re-add (deferred by format-pass).
- Any edit to the 39 pre-existing dirty/untracked files (terminology sweep + build-loop artifacts).

## Verified assumptions (file:line)

- Eyebrow pattern real: `apps/web/src/components/horse/right-rail.tsx:174` — `text-[11px] font-medium uppercase tracking-[0.2em]`
- Stat-row label pattern real: `right-rail.tsx:184` — `text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground block mb-1`
- Status-chip pattern real: `right-rail.tsx:42` — `rounded-full border border-status-active/40 bg-status-active/10 px-3 py-1.5 text-[8px] font-medium uppercase tracking-widest`
- CTA pattern real: `right-rail.tsx:132` — `rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-[10px] font-medium uppercase tracking-widest`
- Tokens real: `apps/web/src/app/globals.css:35-38` — `--color-accent: #d4a964` == `--color-gold: #d4a964`; `:76` — `--color-muted-foreground: #737373`
- Prod reference real: `/home/evo/porch/new/evo_01/02_website/DESIGN.md` — accent `#d4a964`, Geist Sans, dark #030303 base
- Workspace covers packages: `pnpm-workspace.yaml` — `packages/*`, `apps/*`
- `components/ui/` exists in apps/web (13 components) — bespoke, not shared; mission_control has its own tree. The shared package is the upgrade path.
- `Justfile` tracked + clean (not in dirty list) → safe to add `check:style` recipe
- Gates: `just typecheck` / `test` / `lint` exist. Dev server on :3010 — avoid `hermes verify` collisions; use `just` gates.

## Stage 2 amendments (reviewer synthesis → accepted)

1. **SG-2 first-consumer migration (B#9, A#2):** right-rail.tsx becomes the first consumer — inline eyebrow/statusChip/stat-row/CTA patterns deleted, primitives imported. Rule 13 "one client first". Prevents dead-weight duplication.
2. **Package isolation gates (B#7):** SG-2/3 gate = `pnpm --filter @evo/ui build` + `--filter @evo/ui test` + `--filter @evo/ui typecheck`; guard asserts package imports ONLY react + @evo/brand_dna (no `apps/*`).
3. **Visual regression (B#8):** before/after screenshot of right rail on :3010 (dev server up) as SG-2 DOD; eyeball-compare class-for-class.
4. **Founder approval node (B#10, A#5):** `cmd:founder-approval` added to graph — explicit manual gate between audit and go-live.
5. **Token-vocabulary constraint (orchestrator gap, both missed):** primitives may only emit classes from the existing theme vocabulary (--color-accent/-gold/-muted-foreground, border tokens). No new hex/tailwind arbitrary values. This is what keeps the package renderable wherever apps/web's @theme is in scope.

Not accepted (noted): A#3 frozen-dirty-tree debt — pre-existing terminology sweep is tracked out-of-cycle; A#6 graph ambiguity — resolved by founder-approval node; A#4 Phase C deferral — explicitly founder-flagged as the desired sequencing (guide lock BEFORE reactive fixes).

## Open item (flagged, not blocking)

- **Font:** prod DESIGN.md says Geist Sans; format-pass F2 plan noted an Inter "founder-blessed" swap. globals.css current state = the doc's truth; font conflict recorded in draft as open founder decision. [ASSUMPTION: globals.css is current truth]

## Chunks (see chunks.md)

SG-1 doc draft → SG-2 primitives → SG-3 wiring → SG-4 guard → SG-5 gates+audit
