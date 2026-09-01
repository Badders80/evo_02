# E3 Implementation Plan — Pre-Purchase Terms & Acceptance Gate

**Date:** 2026-09-01
**Branch:** `design-alignment` (LOCAL-ONLY — never push, never merge)
**Scope Fence SSOT:** `.agents/rules/e3-sprint.md` (locked rules 1–13)
**Decision SSOT:** `build-loop/e3-right-rail-deepdive.md` (founder-locked)
**Design Source:** Stitch Project "E3 Pre-Purchase Terms" (`589024617828390803`)

---

## 1. Goal & Architecture Approach

Implement the E3 Pre-Purchase Terms right-rail and checkout acceptance gate for `/marketplace/[slug]`.
The surface translates Tokinvest/DSL term-sheet DNA into a clean, minimal right-rail accordion with 5 expandable pillars, interactive stake slider (1% min, 0.5% step) with live NZD pricing, and an investor acceptance gate modal requiring scroll-through inspection and dual-checkbox confirmation for PDS and Syndicate Agreement before handoff to Stripe checkout.

---

## 2. Whitelist & Target Files

### Whitelist Files:
- `apps/web/src/components/horse/right-rail.tsx` (E3 right rail + 5 pillars + stake slider + acceptance gate modal)
- `apps/web/src/app/marketplace/[slug]/page.tsx` (Server page passes compiled legal pack & pricing data to RightRail)
- `apps/web/src/tests/e3_right_rail.test.ts` (New unit tests for E3 logic, slider math, vocab whitelist, and legal pack integration)
- `build-loop/` (Planning & review artifacts)
- `CONTINUE.md` (Session wrap update)

### Blacklist (Strictly Hands-Off):
- ❌ `supabase/migrations/` and `packages/db_models/src/schema/` (No new migrations).
- ❌ `apps/mission_control/` (Hands-off).
- ❌ `apps/web/src/app/mystable/` and post-purchase (E4 sprint is separate).
- ❌ `apps/web/src/lib/investor-mailer.ts`, `bcc-lists*`, `/api/bcc` (E4 rolled back, do not touch).
- ❌ `evo_01/`, `evo_00/` (Hands-off).
- ❌ `PURCHASES_ENABLED` (Stripe stays on test keys).
- ❌ "Download Terms Summary (PDF)" CTA (Deferred — do not build).

---

## 3. Detailed Component Specifications

### 3.1 Right-Rail Accordion & Interactive Controls (`right-rail.tsx`)
- **Status handling**:
  - `listed`: Shows active ownership card, interactive stake slider, live monthly pricing, 5 expandable pillars, and gold `[ Become an Owner ]` CTA.
  - `fully_subscribed` / `completed`: Amber-outline warning variant status pill, closed campaign card + notification form.
  - `coming_soon`: Green status active pill, coming soon card + notification form.
- **Slider Math (Locked Rule 11)**:
  - Floor: 1.0% (`minInvestmentPct`).
  - Step: 0.5% (`stakeStepPct`).
  - Pricing calculation: `pricingForUnits(wholesaleMonthlyNzd, units)` from `nellie-loop.ts`.
  - Values are percentages only.
- **5 Accordion Pillars (Private Banker Standard)**:
  1. **The Deal**:
     - Summary: "Fixed price · fixed duration · fixed return."
     - Expanded: "Can the owner ask for more money? Nope. One price, fixed. What the upfront covers: the last 5 months of the term."
  2. **What's Included**:
     - Summary: "Everything covered, nothing changes."
     - Expanded: "Float, keep, insurance, veterinary coverage — all-inclusive management. No surprise capital calls."
  3. **What If**:
     - Summary: "Injured → you stop paying."
     - Expanded: "Welfare-first stewardship. If injured and unable to race, your monthly keep contributions stop immediately."
  4. **Your Return**:
     - Summary: "75% gross prize money, pro-rata, quarterly."
     - Expanded: "Stakes published on official NZTR record. Distributions paid quarterly directly to your bank account."
  5. **Exit & Transfer**:
     - Summary: "Fixed term end · transfer via Evolution on request."
     - Expanded: "Secondary market to follow. Initially, ownership transfers are facilitated through Evolution Stables upon request."
- **CTA Pill**:
  - Gold pill `[ Become an Owner ]` triggers the Acceptance Gate modal.

### 3.2 Acceptance Gate Modal
- **Container**: Dark glassmorphic modal overlay (`#111111`, border `rgba(255,255,255,0.12)` with subtle gold glow).
- **Header**: "Investor Acknowledgment & Document Verification" with horse legal name, stake %, and monthly/float summary.
- **Legal Content Source (Locked Rule 13)**:
  - Consumes compiled markdown from `getCompiledLegalPackForCampaign` (`pack.pdsMarkdown` and `pack.saMarkdown`).
- **Scroll Viewports**:
  - PDS scroll container with scroll indicator and Checkbox 1: "I have read and agree to the Product Disclosure Statement (PDS)".
  - SA scroll container with scroll indicator and Checkbox 2: "I acknowledge and agree to the Syndicate Agreement terms".
- **Hash Badge Verification**:
  - Displays verified SHA-256 digests (`pdsHash`, `saHash`).
- **Action Button**:
  - `[ Proceed to Secure Checkout ]` — disabled until both checkboxes are checked.
  - On submit: calls `/api/checkout/create-session` or redirects to `/login?next=...` if unauthenticated.

### 3.3 Voice & Brand Compliance
- Strict vocabulary whitelist: `Units`, `Stakes`, `Co-owners`, `Settlement`, `Distribution`, `Prize money`, `Evolution Stables`.
- Zero exclamation marks.
- British English spelling.
- $$$$ rule: Never lead with dollar figures.

---

## 4. Verification Plan

1. **Automated Tests**:
   - `apps/web/src/tests/e3_right_rail.test.ts` checking:
     - 5 pillars and copy compliance against vocabulary whitelist.
     - Slider step (0.5%) and floor (1.0%) math invariants.
     - Pricing formulas match `pricingForUnits`.
     - Legal pack hash integrity and markdown rendering.
   - `just check` passes 10/10 from repo root.
   - `pnpm --filter @evo/web typecheck` clean.
2. **Manual Surface Walk (:3010)**:
   - Walk `/marketplace/nellie` (listed):
     - Test slider movement: increments by 0.5%, min 1.0%, monthly NZD updates live.
     - Expand/collapse each of the 5 pillars.
     - Click `[ Become an Owner ]` → opens Acceptance Gate modal.
     - Verify PDS and SA content render with SHA-256 hashes.
     - Verify `[ Proceed to Secure Checkout ]` is disabled until both checkboxes are checked.
   - Walk `/marketplace/prudentia` (fully subscribed) and `/marketplace/tml-x-yearn` (coming soon) to ensure adjacent states are unchanged.
