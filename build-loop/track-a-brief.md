# TRACK A BRIEF — UI Sprint 1 (`ui-sprint-1` branch)

**Goal:** wire the brand look onto the locked logic. Content/logic are LOCKED (cb4ac12, gate-green, FIN walked). This sprint is look & style only.

**Hard rules:**
- Branch `ui-sprint-1` (already created off cb4ac12). Do NOT merge. Do NOT push to main. Do NOT touch evo_01.
- NO Playwright / Chromium / browser automation. Verification is deterministic only.
- No new features, no copy changes, no MC restyle. UI wiring only.
- Git ops: use `git -C /home/evo/new/evo_02 ...` or verify cwd after cd. Never chain onto a fallback directory.

## Work items

1. **@theme token mapping** — root cause of raw pages.
   - Source tokens: `packages/brand_dna/src/theme.css` (40 vars, dark elevation ladder + gold #d4a964).
   - In `apps/web/src/app/globals.css`, extend the existing `@theme` block to register every brand var as a Tailwind color token: `--color-background`, `--color-foreground`, `--color-card`, `--color-border`, etc., mapped from the `--background`/`--foreground`/`--card`/... HSL triplets in theme.css.
   - Keep the font mappings already present.

2. **Logo + favicon wiring**
   - Assets already exist: `apps/web/public/brand/logos/lockups/*` and `apps/web/public/brand/logos/favicon/*`.
   - Wire favicon set into `apps/web/src/app/layout.tsx` metadata (icons) and pick the correct lockup (likely horizontal-gold for the dark header) into the site header/nav.

3. **Fonts** — per locked `evo_00/doc/DESIGN_SYSTEM_AND_TOKENS.md`. Likely minimal: financial tables spec ui-monospace (already mapped). If a display face is specified in that doc and not wired, wire it; otherwise note "no change needed" in the wrap.

## Verification (deterministic)

- `just check` → must be 10/10 PASSED before commit.
- Build web app, then grep compiled CSS under `.next/` for generated utilities proving token registration:
  `grep -r "color-card\|background-color" apps/web/.next/static/css/*.css | head` — expect `bg-card`/`text-foreground` class definitions to now exist.
- Confirm zero diff on: `packages/legal_engine/**`, `apps/mission_control/src/lib/**`, any Supabase schema/migration file.

## Wrap

- Commit on `ui-sprint-1` with message starting `sprint(ui):`.
- Overwrite `evo_02/CONTINUE.md`: record line held (content/logic locked ✓ · UI wired pending founder review), what was changed (files), verification evidence (gate result + CSS grep proof), and a founder click-through checklist (~6 checks: header logo renders, favicon shows in tab, cards have dark elevation surfaces, gold accents present, pricing/cap-table monospace figures, no layout breakage on horse page + marketplace + home).
- Leave live site untouched; Vercel cutover is a FOUNDER manual step after review (see go-live section below).

## Go-live section (founder executes after approving click-through)

1. Founder merges `ui-sprint-1` → main locally.
2. FOUNDER rewires Vercel project source repo to `Badders80/evo_02`, root dir `apps/web`. (~5 min, dashboard)
3. Verify live domain serves new build (check `/horses/nellie` returns 200 — route only exists in evo_02).
4. Only after verified: demote evo_01/02_website to archive status.
