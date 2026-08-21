# Component Port Notes — evo_01 → evo_02 (Execute Tomorrow)

**Date:** 2026-08-21 (prepared for next-day execution)
**Goal:** Port the component layer from `evo_01` into `evo_02` so marketplace + MyStable become pure flow-wiring, not element design.
**Rule:** READ-ONLY from evo_01. Nothing is pulled until each decision below is approved. Port = adapt, not copy-paste.

---

## 1. Current state of evo_02 (verified 2026-08-21)

- **Token layer: DONE.** `@evo/brand_dna` has `tokens.ts`, `tailwind-preset.ts`, `theme.css` (shadcn-mapped CSS vars). `apps/web/src/app/globals.css` imports it.
- **Phase 0 (schema/model rebase): DONE.** All 14 test/typecheck tasks pass.
- **Component layer: MISSING.** No `components.json`, no `src/components/ui/*`, no Geist fonts, no Evo-specific primitives, no marketplace/MyStable components.
- **203 raw hex literals** remain in `apps/web/src` (Phase 1 token purity not done).

---

## 2. What's missing in evo_02 → where it lives in evo_01

Source root: `/home/evo/new/evo_01/02_website`

| Missing in evo_02 | Source in evo_01 | Notes |
|---|---|---|
| shadcn setup | `components.json` (style: `new-york`) | evo_01 is Tailwind v3; evo_02 is v4. Re-init, don't copy config. |
| shadcn primitives | `src/components/ui/`: badge, button, card, checkbox, container, dialog, input, kyc-badge, label, select, table, tabs, textarea | Adapt to Tailwind v4. |
| Geist fonts | `public/fonts/GeistSans-VF.woff2`, `GeistMono-VF.woff2`, `GeistSans-VFItalic.woff2` | Copy files + `next/font/local`. |
| Evo-specific primitives | `src/components/ui/`: TypeWriter, LogoCarousel, SplitFaq, GradientShimmer, GlowPillButton, FixedBg, StaticImage, GrassBg, ComingSoonOverlay | Custom, port as-is (adapt to v4). |
| Marketplace components | `src/components/marketplace/`: ListingGrid, DetailTabs, HeroPillarsGrid, PedigreeTable, PurchaseFlow, SubscriptionPurchaseFlow, RightColumnActionPanel, InvestmentTermsModal, KycRequestCard, CampaignStatusBadge, ApplyForm, PurchaseForm, RegistrationGate, GuestProfileGate | Port UI only. |
| Marketplace sections | `src/components/sections/`: PressShowcaseSection, LatestUpdateSection, MarketplaceSection, NewsAndUpdatesSection, HeroSection, HowItWorksSection, FAQSection, AboutSection, DigitalSyndicationSection | Port UI only. |
| MyStable | `src/app/mystable/page.tsx` | **Port layout/components only. LEAVE BEHIND Firebase auth + JSON fixtures.** |
| Top-level | `src/components/`: NavBar, Footer, KycBanner, OnboardingFlow, CtaLeadModal, SmoothScrollProvider | Port UI only. |

---

## 3. Decisions to CHECK / APPROVE / REJECT before porting

### D1 — Color palette (APPROVE/REJECT — the big one)
- **Option A (current evo_02):** `#0a0a0a` base / `#d4a964` gold. Already in `@evo/brand_dna`.
- **Option B (refero Better Stack):** `#0f101a` void-black / `#d4a964` gold. Source: `evo_01/docs/specs/design-system-migration.md` (URL `https://styles.refero.design/style/1de273f2-166f-4526-8442-16cc39fc7fd5`).
- **Decision needed:** Which neutrals are canonical? Gold `#d4a964` is agreed in both. The neutrals differ.
- **If B:** update `@evo/brand_dna` tokens BEFORE porting components, so components reference the final tokens once.

### D2 — Tailwind v3 → v4 adaptation (APPROVE approach)
- evo_01 components + refero `@theme` block are Tailwind v3. evo_02 is v4 (`@import "tailwindcss"`).
- **Decision:** Confirm we adapt (not copy) — re-init shadcn in v4, remap any v3-only classes.

### D3 — Leave-behind debt (APPROVE)
- evo_01 MyStable uses **Firebase auth** + **JSON fixtures** (`hlts.json`, `horses.json`).
- **Decision:** Port components only; wire to Supabase SSR auth + live backend in evo_02. Do NOT port Firebase/JSON.

### D4 — Refero adoption scope (APPROVE/REJECT)
- The Better Stack refero doc is a token-migration reference. The Hyer Aviation refero (`design_system.json`) is a LinkedIn carousel — **reject** for the website.
- **Decision:** Confirm Better Stack is the design inspiration; reject Hyer Aviation.

### D5 — Component port scope (APPROVE)
- Port the full list in §2, or a subset? Recommend full list so marketplace + MyStable are flow-only afterward.

---

## 4. Execution order for tomorrow

1. **Decide D1–D5** (approve/reject) — 15 min.
2. **Token purity:** replace 203 raw hexes with `@evo/brand_dna` tokens (after D1 settles the palette). ~1–2 hrs.
3. **Re-init shadcn in v4** (`npx shadcn@latest init` + add primitives). ~30 min.
4. **Add Geist fonts** (`public/fonts/` + `next/font/local`). ~20 min.
5. **Port Evo-specific primitives** (TypeWriter, LogoCarousel, KycBadge, Container, etc.). ~1–2 hrs.
6. **Port marketplace + MyStable components** (UI only, no Firebase/JSON). ~3–4 hrs.
7. **Verify:** `pnpm turbo run test typecheck --force` passes; zero raw hexes; every flow uses only primitives.

---

## 5. Key files to open first
- `evo_01/docs/specs/design-system-migration.md` (refero Better Stack tokens)
- `evo_01/02_website/components.json` (shadcn config)
- `evo_01/02_website/src/components/ui/` (primitives)
- `evo_01/02_website/src/components/marketplace/` (marketplace)
- `evo_01/02_website/src/app/mystable/page.tsx` (MyStable — port UI only)
- `evo_02/packages/brand_dna/src/tokens.ts` (current evo_02 tokens)

---

## 6. NEW components to build (NOT in evo_01 — verified 2026-08-21)

These do NOT exist in evo_01. They must be built in the component-library step (Phase 1b) BEFORE flow wiring, or they will pull you back into design work mid-flow.

| # | Component | Why it's new | Source/partial |
|---|---|---|---|
| 1 | 5×M Float / Upfront calculator | evo_01 only has a "racing freshness calculator", not the interactive stake-slider calc | Logic from `@evo/legal_engine`; UI new |
| 2 | Stable Showcase | zero hits in evo_01 | NEW |
| 3 | 3-gen clickable pedigree TREE | evo_01 has data model + `PedigreeTable`, not a clickable tree UI | `src/lib/pedigree-tree.ts` (data), `PedigreeTable.tsx` (table) |
| 4 | Hero video background | evo_01 has StaticImage/FixedBg/GrassBg, no video hero | R2 video; UI new |
| 5 | Unit selector (min_stake_pct/stake_step_pct) | zero hits in evo_01 | NEW |
| 6 | Latest Trackwork Updates section | evo_01 has `LatestUpdateSection` + trackwork in MyStable, no standalone section | `LatestUpdateSection.tsx` (partial) |

**Rule:** Build all 6 in Phase 1b. Then marketplace + MyStable = pure flow/content, zero design decisions left.
