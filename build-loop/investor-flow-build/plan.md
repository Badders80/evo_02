# investor-flow-build — plan

**Date:** 2026-09-03
**Cycle dir:** `build-loop/investor-flow-build/`
**Status:** Stage 1 — awaiting plan audit (kimi-code-audit) + GATE 1

## Goal

Close the 15-gap investor-flow audit (13 FAIL / 1 WARN, `build-loop/audit-graph-investor-flow.json`) by building the locked 6-step purchase flow from `build-loop/flow-mock/index.html` (LOOK LOCKED 2026-09-02/03) into evo_02 code, chunk by chunk, each audited by kimi-code-audit before the next starts.

## Architecture approach

- **Popup mount (Q1):** Dialog over `marketplace/[slug]/page.tsx` — no route change. CTA "Become an Owner" opens it.
- **State (Q2):** `?units=` in URL (locked — f6/f7 exist to preserve it) + step = client state. Deep-linkable, refresh-safe. **C1 reads `?units=` on mount; C2 keeps URL in sync on stepper change.**
- **Step 2 header:** mockup "Digital-Syndication Terms" (newer, founder-reviewed).
- **Step 3 header:** mockup "Acceptance — {horse} your documents" (newer).
- **Modal shell (f14):** `max-w-lg` × `h-[720px]`, content scrolls inside — all Steps 2–6 share it.
- **Numbers:** mockup figures ($76, $380, 21 months) are PLACEHOLDERS — real build wires `pricingForUnits(campaign.wholesaleMonthlyNzd, units)` + campaign data. Never hand-compute.
- **Audit tick (C3):** `events` table exists (`supabase/migrations/00001_initial_schema.sql:220`) — write `event_type='acceptance'` via service client. No migration needed.
- **E4 welcome email:** OUT OF SCOPE (separate email workstream, founder-gated).

## Tech constraints

- evo_02, branch `design-alignment` LOCAL-ONLY. No merge/push/deploy.
- Dev server on **:3010** (fixed 2026-09-03 — was stray on :3000). PURCHASES_ENABLED=true + sk_test_ in `.env.local`.
- Vocabulary whitelist: Stakes/Co-owners, Settlement/Distribution/Prize money, Evolution Stables. Zero exclamation marks. British English.
- Design tokens from `apps/web/src/dna/` + @theme v4 — never invent colors.
- `stakePctToStepUnits` stays at checkout boundary only. Values PERCENT everywhere investor-facing.
- Working tree was already dirty (terminology sweep) — chunks commit ONLY their own files.

## Files

| Path | Action |
|---|---|
| `apps/web/src/components/horse/right-rail.tsx` | Modify (C1, C2) |
| `apps/web/src/app/marketplace/[slug]/page.tsx` | Modify (C1) |
| `apps/web/src/app/api/checkout/create-session/route.ts` | Modify (C1, C5) |
| `apps/web/src/app/mystable/page.tsx` | Modify (C1) |
| `apps/web/src/components/horse/purchase-flow-modal.tsx` | Create (C2) |
| `apps/web/src/lib/nellie-loop.ts` | Read-only (pricingForUnits, stakePctToStepUnits) |
| `apps/web/src/lib/horses-data.ts` | Modify (C1 — min_stake_pct wiring) |
| `supabase/migrations/00001_initial_schema.sql` | Read-only (events table) |

## Chunks

| # | Chunk | Fixes | Files | DOD | Gate |
|---|---|---|---|---|---|
| C1 | PR-A bug fixes | f2 stepper opens at min · f3 min_stake_pct wiring · f4 fine-print line · f5 sold-out fallback → ClosedCard · f6 401 keeps `?units=` · f7 cancel_url `?units=` · f8 MyStable success state | right-rail.tsx, page.tsx, create-session/route.ts, mystable/page.tsx | all 7 fixes in, no regressions | `just check` + typecheck + walk :3010 |
| C2 | Modal extraction + Step 2 term sheet | f1 modal out of rail · f15 PurchaseFlowModal exists · f11 green 75% row · f12 4-row summary · f14 max-w-lg × h-[720px] | new purchase-flow-modal.tsx + right-rail.tsx | modal extracted, Step 2 matches mockup | typecheck + walk |
| C3 | Step 3 accept gate (mockup pattern) | accordion + Completed badge + audit tick · f13 KYC prompt in-modal | purchase-flow-modal.tsx | Step 3 matches mockup, tick writes events row | typecheck + walk |
| C4 | Steps 4–6 | Verify (KYC) · Pay (Stripe redirect) · Own (MyStable success) | purchase-flow-modal.tsx, mystable | steps 4–6 wired | typecheck + walk |
| C5 | Error states + mapping | f9 5 stepper error states · f10 7-code Stripe error→copy | modal + create-session/route.ts | all 5 states + 7-code mapping | typecheck + walk |

## Out of scope

- E4 welcome email (separate workstream)
- KYC port (Firebase → Supabase) — rides existing port; C4 wires the prompt only
- Stitch wireframes / graphics / format pass (Claude + MiniMax M3, after build)
- Any migration, merge, push, deploy
- evo_01 / mission_control / prod surfaces

## Verification

- `just check` (10/10 must pass) — from repo root
- `pnpm --filter @evo/web typecheck` green
- Walk :3010: /marketplace/nellie → CTA → modal steps → checkout
- kimi-code-audit (kimi-k2.7-code:cloud) per chunk, diff-only, PASS/FAIL/WARN + graph
