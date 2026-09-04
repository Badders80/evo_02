# STYLE GUIDE LOCK-IN — Chunks

Branch: `style-guide-lock-in`. Each chunk leaves the repo green. Commit AFTER gate. Sandbox rules: only chunk files committed; the 39 pre-existing dirty/untracked files are NEVER touched or staged.

## sg-1 — Style guide draft (Phase A)

- **Files:** + `build-loop/style-guide-lockin/STYLE_GUIDE-draft.md`
- **Read first:** `apps/web/src/components/horse/right-rail.tsx` (full), `apps/web/src/app/globals.css`, `/home/evo/porch/new/evo_01/02_website/DESIGN.md`
- **Deliverable:** doc with `## Patterns` section — one subsection per locked rule: Eyebrow, BackLink, StatusPill (variants: listed/fully_subscribed/coming_soon/completed/neutral), StatRow, WhitePillCTA, ImageBackground (mix-blend-mode: lighten), DotGrid (**removed** from marketplace + login, deferred). Each rule: canonical classes + file:line evidence + do/don't. Token section citing globals.css values. Font open item recorded (Geist vs Inter).
- **DOD:** every rule has `file:line` evidence; token values match globals.css/DESIGN.md; status `**DRAFT**` header, not LOCKED.
- **Gate:** none (doc); reviewed in sg-5 audit.
- **Commit:** `docs(style): SG-1 draft canonical style guide (sandbox)`
- **Nodes:** `doc:style-guide-draft`

## sg-2 — @evo/ui package + 5 primitives (Phase B)

- **Files:** + `packages/ui/package.json`, `packages/ui/tsconfig.json`, `packages/ui/src/index.ts`, `packages/ui/src/eyebrow.tsx`, `packages/ui/src/back-link.tsx`, `packages/ui/src/status-pill.tsx`, `packages/ui/src/stat-row.tsx`, `packages/ui/src/white-pill-cta.tsx`, + one test per primitive.
- **Design constraints:** class strings ONLY from existing vocab (`text-accent`, `text-gold`, `text-muted-foreground`, `border-border`, `border-status-active`, `bg-card`, `rounded-full`, etc.). No new hex, no new arbitrary Tailwind values. No imports from `apps/*` — only `react` (+ `lucide-react` for BackLink's ArrowLeft if it's a dep; check `apps/web/package.json` first).
- **StatusPill statuses:** `"listed" | "fully_subscribed" | "coming_soon" | "completed"` + `neutral` default. Token set per status mirrors right-rail `statusChip` exactly.
- **DOD:** package builds; `pnpm --filter @evo/ui test` + `pnpm --filter @evo/ui typecheck` green; each primitive's test asserts the canonical class string.
- **Gate:** `cd packages/ui && pnpm build && pnpm test` (or workspace equivalent).
- **Commit:** `feat(ui): SG-2 create @evo/ui with 5 shared primitives (sandbox)`
- **Nodes:** `pkg:ui-package`, `file:eyebrow`, `file:back-link`, `file:status-pill`, `file:stat-row`, `file:white-pill-cta`, `cmd:test`
- **Depends on:** sg-1

## sg-3 — Wire dep + right-rail first consumer (Rule 13)

- **Files:** M `apps/web/package.json` (+ `@evo/ui` workspace dep), M `apps/web/src/components/horse/right-rail.tsx` (convert statusChip → StatusPill, eyebrow → Eyebrow, stat labels → StatRow, CTA → WhitePillCTA; delete inline class strings), maybe + `pnpm install` lockfile.
- **Visual proof:** screenshot right rail on :3010 before (save `build-loop/style-guide-lockin/rail-before.png`) and after (`rail-after.png`); class-for-class compare + eyeball compare.
- **DOD:** right-rail renders identical classes (no pixel drift); inline eyebrow/stat/CTA/statusChip class strings gone from right-rail.tsx.
- **Gate:** `pnpm --filter apps/web typecheck` + full `just typecheck`.
- **Commit:** `refactor(web): SG-3 right rail consumes @evo/ui primitives (sandbox)`
- **Nodes:** `cmd:smoke-import`, `file:right-rail-first-consumer`, `cmd:visual-before-after`, `cmd:typecheck`
- **Depends on:** sg-2

## sg-4 — Enforcement guard (Phase D-lite)

- **Files:** + `scripts/check-style-guard.sh`, M `Justfile` (recipe `check:style`)
- **Guard rule:** `grep -rn 'text-\[11px\] font-medium uppercase tracking-\[0.2em\]' apps/ packages/` → non-zero exit + print matches. Also flag `text-\[10px\] font-mono uppercase tracking-\[0.2em\]` (stat-row label) — those must use primitives.
- **Just recipe:** `check:style: sh scripts/check-style-guard.sh` (check Justfile syntax — verify existing recipe style first).
- **DOD:** script exits 1 on an inline eyebrow match (test with a temp fixture), 0 on clean; `just check-style` registered.
- **Gate:** run the guard — it should PASS on the clean tree BUT right-rail must not trigger it (it's converted in sg-3, so sg-4 runs after sg-3's commit to avoid false-positive churn).
- **Commit:** `chore(lint): SG-4 add inline-pattern style guard (sandbox)`
- **Nodes:** `file:check-style-guard`, `cmd:check-style`
- **Depends on:** (execution order) sg-3, so guard sees the converted rail. Graph note: sg-4 formal dep = none, but execute after sg-3.

## sg-5 — Gates + kimi audit (Stage 5)

- **Commands:** `just lint`, `just typecheck`, `just test` (or per-package equivalents) — all green on branch; guard run green; `git diff 6b7da76..HEAD --stat` for scope.
- **Audit:** kimi-code-audit procedure on the branch diff → `build-loop/style-guide-lockin/audit-report.md` + `audit-graph.json`.
- **DOD:** audit verdict + PASS/FAIL/WARN table; founder-approval marker set to BLOCKED (awaiting founder go-live).
- **Commit:** `docs(style): SG-5 audit report for style-guide lock-in (sandbox)`
- **Nodes:** `cmd:lint`, `cmd:typecheck`, `cmd:kimi-audit`, `cmd:founder-approval`
- **Depends on:** sg-2, sg-3, sg-4

## Execution order

sg-1 → sg-2 → sg-3 → sg-4 → sg-5. sg-4 executes after sg-3 (guard must see converted rail). All on main thread (≤3-file chunks per build-loop pitfall guidance).
