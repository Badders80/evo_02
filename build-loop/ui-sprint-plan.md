# UI Sprint Plan — seeded 2026-08-26 (next cycle opener)

**Context:** sprint e2e-wire closed with content/logic locked (founder-approved) and look/style
deferred. This file is the warm start. Read CONTINUE.md "THE LINE" section first.

## Scope

### 1. Theme token wiring (ROOT CAUSE — first move, ~1h)
Tailwind v4 `@theme` block in `apps/web/src/app/globals.css` mapping brand channels from
`packages/brand_dna/src/theme.css` into color utilities:
- `--color-background/foreground/card/card-foreground/popover*` ← hsl(var(--…))
- `--color-primary*/secondary*/muted*/accent*/destructive*` ← hsl(var(--…))
- `--color-border/border-subtle/border-bold/input/ring` ← hsl(var(--…))
- `--color-status-active/pending/closed`; `--radius-*` from `--radius`
Verification WITHOUT browser: after rebuild, served CSS must contain `.bg-card{`, `.text-foreground{`,
`--color-card:`; gate stays 10/10. Then founder re-click-through on :3010/:3011.

### 2. Brand identity (~1–2h)
Logo (header + favicon + og-image slot), brand fonts wired via `--font-sans/--font-mono/@font-face`,
gold accent sanity pass (#d4a964 vs --primary token).

### 3. Light consistency pass
Spacing/hierarchy on horse page + home hero. NO new features.

## Explicitly OUT (locked exclusions)
- MC restyle (back office stays utilitarian — standing directive)
- New copy, new pages, payouts v2, R2 upload UI
- Any merge before founder visual sign-off on :3010

## Definition of done
Gate green + served-CSS utility assertions + founder says the look lands → THEN single merge of
`sprint-1-nellie-loop` (logic + look together) to `main`.
