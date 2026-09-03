# investor-flow-build — chunks

**Date:** 2026-09-03
**Status:** Stage 3 — awaiting plan audit verdict (kimi-k2.7-code:cloud, dispatched)

Sequential chain — each chunk leaves the repo green, audited by kimi-code-audit before the next starts. Chunks commit ONLY their own files (working tree was already dirty with terminology sweep).

---

## chunk-1 — PR-A bug fixes (f2, f3, f4, f5, f6, f7, f8)

**Fixes:**
- f2: stepper opens at min — `right-rail.tsx:482` `Math.max(minInvestmentPct, 2.0)` → `minInvestmentPct`
- f3: min_stake_pct wiring — `page.tsx:216` hardcoded `1.0` → read `min_stake_pct` from campaign data (column exists: `00001:132`, `00002:9`; horses-data.ts does NOT currently read it — wire through `HorseCampaign` + `capTableFixture`)
- f4: locked fine-print line — replace `right-rail.tsx:533-537` Min/Step/Max row with "Minimum investment {min}% · Stake available {max}% · Contact us for more info" (spec-locked)
- f5: sold-out fallback — `page.tsx:217` `availablePct > 0 ? availablePct : 10.0` → when `availablePct <= 0`, status must resolve to `fully_subscribed` (ClosedCampaignCard), never buyable
- f6: 401 login redirect keeps `?units=` — `right-rail.tsx:271-272` `next` = pathname only → include `?units={stakePct}`
- f6b (audit #4): read `?units=` from URL on mount — `ListedInvestmentCard` initial stake = `URLSearchParams('units')` if valid, else min
- f7: cancel_url keeps `?units=` — `create-session/route.ts:106` → `${origin}/horses/${horseSlug}?units=${units}`
- f8: MyStable success state — `mystable/page.tsx` handle `?checkout=success&slug=&units=` (success_url already sends it: route.ts:105)

**Files:** `apps/web/src/components/horse/right-rail.tsx`, `apps/web/src/app/marketplace/[slug]/page.tsx`, `apps/web/src/app/api/checkout/create-session/route.ts`, `apps/web/src/app/mystable/page.tsx`, `apps/web/src/lib/horses-data.ts` (min_stake_pct wiring — audit BLOCKER #1: plan.md originally listed it read-only; it MUST be modified)

**DOD (per-fix verification — audit #6):**
- f2: `right-rail.tsx` initial stake state = `minInvestmentPct` (grep: no `Math.max(minInvestmentPct, 2.0)`)
- f3: `page.tsx` passes `campaign.min_stake_pct` (not literal `1.0`); `horses-data.ts` reads `row.min_stake_pct`
- f4: fine-print line "Minimum investment {min}% · Stake available {max}% · Contact us for more info" present
- f5: `availablePct <= 0` → status `fully_subscribed` (ClosedCampaignCard renders, no slider)
- f6: 401 redirect URL contains `units=`
- f7: `cancel_url` contains `units=`
- f8: `/mystable?checkout=success` renders success state
- `just check` 10/10, typecheck green, walk :3010 /marketplace/nellie
**Commit:** `fix(web): investor-flow PR-A — stake continuity, min wiring, sold-out fallback, success state`

---

## chunk-2 — Modal extraction + Step 2 term sheet (f1, f15, f11, f12, f14)

**Fixes:**
- f1+f15: extract `AcceptanceGateModal` out of `right-rail.tsx` → new `apps/web/src/components/horse/purchase-flow-modal.tsx` (PurchaseFlowModal, Steps 2–6 host)
- f14: modal shell `max-w-lg` × `h-[720px]`, content scrolls inside (locked 2026-09-03)
- f12: 4-row summary block (mockup Step 2): Initial Payment / Monthly thereafter / Lease period / Investor Return — label left · value right · sub-note below, divider between
- f11: Investor Return row value **green** `text-status-active` (LOCKED 2026-09-03)
- Step 2 header: "Digital-Syndication Terms" (mockup, newer)
- Stepper: ▲/▼ buttons + value, opens at min, 0.5% steps, max = availablePct; price pill updates via `pricingForUnits`
- Numbers from `pricingForUnits(campaign.wholesaleMonthlyNzd, units)` — NEVER mockup placeholders ($76/$380/21mo)

**Files:** `apps/web/src/components/horse/purchase-flow-modal.tsx` (new), `apps/web/src/components/horse/right-rail.tsx` (CTA opens modal, gate removed)

**DOD:** modal extracted, Step 2 matches mockup (stepper, 4 rows, green 75%), typecheck green, walk :3010
**Commit:** `feat(web): extract PurchaseFlowModal with Step 2 term sheet`

---

## chunk-3 — Step 3 accept gate (mockup pattern) + KYC prompt (f13)

**Fixes:**
- Step 3 matches mockup: accordion rows (expand doc → tick → "Completed" badge → Proceed unlocks), header "Acceptance — {horse} your documents"
- Audit tick: each acceptance tick writes `event_type='acceptance'` to `events` table (exists `00001:220`, payload JSONB) via service client — service role has full access (`00001:241-250`). **Payload shape (audit #9):** `{ horse_slug, stake_pct, doc: 'pds'|'sa', doc_hash, user_id }` — `stripe_event_id` stays NULL (nullable, no UNIQUE violation).
- f13: KYC prompt in-modal (read-then-verify, locked 2026-09-01) — docs readable pre-KYC, checkout blocked until verified, prompt copy from spec

**Files:** `apps/web/src/components/horse/purchase-flow-modal.tsx`

**DOD:** Step 3 matches mockup, tick writes events row (verify via supabase query), typecheck green, walk :3010
**Commit:** `feat(web): Step 3 accept gate with audit ticks + KYC prompt`

---

## chunk-4 — Steps 4–6 (Verify / Pay / Own)

**Fixes:**
- Step 4 Verify: one-screen KYC (rides existing port — Firebase → Supabase; wire the prompt + status check, not the port itself)
- Step 5 Pay: Stripe hosted redirect (already wired via create-session; modal hands off)
- Step 6 Own: MyStable success state (f8 landed in chunk-1; modal links through)

**Files:** `apps/web/src/components/horse/purchase-flow-modal.tsx`, `apps/web/src/app/mystable/page.tsx` (if needed)

**DOD:** steps 4–6 wired, typecheck green, walk :3010
**Commit:** `feat(web): Steps 4-6 verify/pay/own`

---

## chunk-5 — Error states + Stripe mapping (f9, f10)

**Fixes:**
- f9: 5 stepper error states (spec `purchase-content-spec.md`): over max "Stake available is {max}% — reduce your stake" · under min "Minimum investment is {min}% — increase your stake" · non-multiple "Stake must be a multiple of {step}%" · empty → revert to min on blur · max/min dull-triangle notes (mockup JS)
- f10: 7-code Stripe error→investor-copy mapping in `create-session/route.ts` (KYC_REQUIRED, RESERVE_FAILED, PURCHASES_DISABLED, SUPABASE_NOT_CONFIGURED, INVALID_STAKE, + Stripe decline codes) — server returns code, modal renders investor copy

**Files:** `apps/web/src/components/horse/purchase-flow-modal.tsx`, `apps/web/src/app/api/checkout/create-session/route.ts`

**DOD:** all 5 states + 7-code mapping, typecheck green, walk :3010
**Commit:** `feat(web): stepper error states + Stripe error mapping`

---

## Out of scope (do not touch)

- E4 welcome email (separate workstream)
- KYC port itself (Firebase → Supabase) — C4 wires the prompt only
- Stitch wireframes / graphics / format pass (Claude + MiniMax M3, after build)
- Any migration, merge, push, deploy
- evo_01 / mission_control / prod surfaces
