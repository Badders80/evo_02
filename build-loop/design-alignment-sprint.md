# Design Alignment Sprint — evo_02 front office

**Status: SKELETON v0.2 — direction + branch + theme model founder-locked 2026-08-28. Deep plan pending.**
**Goal:** evo_01 look → evo_02 engine. One cutover. Speed-first: produce, tweak later.

---

## Locked decisions

1. **Mental map** — evo_01/02_website = canonical LOOK (DESIGN.md, primitives, patterns).
   evo_02 = canonical LOGIC (engine, Supabase, KYC, checkout, legal). Paint moves to the
   engine. Never engine to paint.
2. **Scope fence (founder, verbatim)** — out of scope: Mission Control restyle (locked),
   payouts v2, any layout/logic changes. Reskin only.
3. **Primitive layer is mandatory.** Port to `apps/web/src/components/ui/` (Tailwind v4).
   After the sweep, no page hand-rolls a surface — everything consumes primitives.
4. **Sourcing rule** — standard primitives (Card, Badge, Button, Input, Label, Select,
   Dialog, Tabs, Table) ← shadcn, customised with tokens. Custom components
   (GlowPillButton, dot-grid bg, TypeWriter, LogoCarousel, kyc-badge, order-tracking,
   ComingSoonOverlay, Container) ← ported from evo_01/02_website `src/components/ui/`.
5. **x.ai (docs.x.ai) = PATTERN reference for MyStable + marketplace/checkout technical
   flows only.** Import: sidebar nav, monospace data density, tabbed panels, pill badges,
   kbd-hint inputs, copy buttons, dense status tables. Palette stays Evolution dark+gold —
   the clone is light-themed; we take the console patterns, not the colours.
   *(Founder veto point — if you want a light MyStable, say so before W4.)*
   Reference PNGs: `~/workspace/website_cloner/docs/design-references/docs-x-ai/overview/`.
6. **Token SSOT** — evo_00 brand_dna + `evo_00/doc/DESIGN_SYSTEM_AND_TOKENS.md` remain
   SSOT; evo_01 `DESIGN.md` is the visual spec to translate into evo_02 Tailwind v4
   `@theme` in `apps/web/src/app/globals.css`.
7. **Speed law** — tokens + primitives land FIRST, so nothing is hand-tuned per box.
   If a corner/font/colour looks wrong: change the token, never the box. Nellie page
   first; founder visual check after each surface.
8. **Branch + cutover** — founder look verdict on `ui-sprint-1` = FAIL. New branch
   `design-alignment` cut FROM `ui-sprint-1` (keeps favicon/header/@theme scaffolding);
   `ui-sprint-1` is superseded, never merged. This branch becomes THE cutover branch:
   sprint lands → founder visual gate → merge → Vercel → archive evo_01 website.
9. **MyStable theme: dark shell → light console.** Site chrome stays dark+gold; the
   `/mystable` route segment (and checkout-adjacent console surfaces in W4) scope to a
   LIGHT theme via a second token scope (`data-theme="light"` overriding the same
   semantic vars) + ~300ms colour transition. Components unchanged — they consume
   semantic tokens only. x.ai reference applies at full fidelity there (it is light).
   W1 must add light-scope tokens incl. a deepened gold accent (contrast on white).
10. **Content sweep = Pass 2, subtractive only.** Reskin keeps ALL content/structure
    as-is (founder: content & info are good). After founder visual gate, a separate
    founder-guided curation pass removes/relocates anything unwanted. Never mix content
    decisions into reskin diffs.

---

## Workstreams

| # | Workstream | Delivers |
|---|-----------|----------|
| W1 | Token foundation | evo_01 DESIGN.md + brand_dna reconciled → evo_02 `@theme` (v4); DESIGN.md spec in evo_02 |
| W2 | Primitive layer | ~10 shadcn primitives + ~8 customs ported; utilities verified emitting (v4 PostCSS check) |
| W3 | Public surface sweep | header, footer, home, horse detail, pricing-card, cap-table, data-room, landing-cta |
| W4 | Console surfaces | mystable + checkout/marketplace flows restyled with x.ai patterns (W1 tokens only) |
| W5 | Verify + resume cutover | `just check` 10/10, founder visual gate, then merge → Vercel sequence |

Order: W1 → W2 → (W3 ‖ W4) → W5. Nellie is the canary for both W3 and W4.

---

## Known pitfalls carried in (from design-system-migration skill)

- **Tailwind v3 (evo_01) vs v4 (evo_02)** — primitives need syntax translation, not
  copy-paste (`@theme` CSS-first; no `theme.extend`).
- **v4 utilities pitfall** — `@tailwindcss/postcss` must be present; grep compiled CSS
  for `.flex`/`.grid` after build. Green build ≠ styled page.
- **shadcn on install writes oklch defaults** — remap all `@layer base` vars to brand
  tokens in the same step.
- **Body-text mapping** — `text-white/60` → `text-foreground` (warm neutral), never the
  cool `frost` tone; frost is hover/active chrome only.
- **Container primitive** with a single max-width token — build in W2, not later.
- **Button accent variant** — add gold `accent` variant before anything consumes it.
- **Sed for mechanical sweeps** — orchestrator-side bulk replace, not per-file subagents.

---

## Founder checklist (end of sprint)

Same shape as last time, ~5 min: Nellie page, marketplace, mystable, checkout entry —
confirm it reads as the same site as evolutionstables.nz. Then cutover sequence.