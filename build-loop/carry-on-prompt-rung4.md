# Carry-on prompt — Rung 4: Purchase flow content (paste into a new chat)

---

You are working in the Evolution Stables evo_02 monorepo at `/home/evo/new/evo_02`. Read `CONTINUE.md` first (SSOT), then `build-loop/investor-flows-report.md` (scoping SSOT) and `build-loop/service-blueprint.md` (service blueprints). All founder decisions from 2026-09-01 are locked in those files — do not reopen them.

**Dual-surface rule (locked):** "current state" = check BOTH `evo_01/02_website` (LIVE production — Firebase auth, full KYC stack, served via Vercel) AND evo_02 (:3010, Supabase). A gap in evo_02 that exists in production is a PORT, not a rebuild. The old build is fine — read-only reference, never edit it.

**Your task — Rung 4 of the locked customer journey: work the EXACT content of each purchase step.**

The 4-rung journey is locked: Public → Logged in → KYC'ed → Owner. Rungs 1–3 are done. Rung 4 = Flow C steps 1–5 (choose → accept → checkout → pay → own). The steps exist and the backend is wired; what's missing is the **exact content per step** — every string, state, and edge case — so the founder can build wireframes, then UI/UX.

**Locked decisions you must honor (from investor-flows-report.md):**
- Stake entry = stepper+input (NOT slider): box opens at minimum, ▲/▼ move in increments, manual entry with out-of-range warning both directions. Fine print: "Minimum investment ___% · Stake available ___% · Contact us for more info".
- Min/step/max DSL-driven per horse (`min_stake_pct`, `stake_step_pct`, `availablePct`). Min currently hardcoded 1.0 in `marketplace/[slug]/page.tsx:216` — flag as fix.
- Cancel-stake: Option A — carry units in `cancel_url` (`create-session/route.ts:106`), horse page pre-fills from param. Fix queued.
- Read-then-verify: gate modal opens pre-KYC, checkout blocked until verified. KYC = port from production (Firebase → Supabase), UX already designed + walked.
- Transfer facilitation: "standard fees apply" (fee % TBD). Not in code.
- Vocabulary whitelist (AGENTS.md): Units/Stakes/Co-owners, Settlement/Distribution/Prize money, Lease contribution/Deposit, Evolution Stables. Zero exclamation marks. British English. Never lead with dollars.
- Pricing: list = cost ×1.05 ×1.03 GST-inclusive; 5×M float join; $M monthly keep. From `pricingForUnits` — never invent pricing math.

**Deliverable:** a content spec for each of the 5 purchase steps, in the style of `build-loop/e3-content-tree.md` (node-type blocks: [header] [body] [figure] [CTA] [note] etc.), covering:
1. **Choose** — stepper+input behavior spec (open value, increment, warning copy for over/under range), fine-print line, pricing figures, 5 pillars (content already locked in e3-content-tree.md — reference, don't rewrite).
2. **Accept** — gate modal: PDS/SA scroll-through, dual checkboxes, hash display, KYC prompt placement for unverified investors (read-then-verify), Proceed button states.
3. **Checkout** — the create-session handoff: what the investor sees, reservation countdown (15-min TTL) copy, error states (KYC_REQUIRED, reservation failed, kill switch).
4. **Pay** — Stripe hosted page: line-item naming, success return to `/mystable?checkout=success`, cancel return with `?units=` pre-fill.
5. **Own** — post-purchase: MyStable success state, welcome email content (E4 — spec the copy, don't build), vault docs, monthly billing expectation.

Also resolve the 2 open items if you can (flag for founder if not): reservation-expired UX (auto re-reserve vs manual), and the `rejected` vs `requires_input` KYC enum reconcile.

**Output:** write the spec to `build-loop/purchase-content-spec.md`, update `CONTINUE.md` session wrap, and report back with the spec summary + any founder decisions needed. Do NOT write code, do NOT touch migrations, mission_control, or evo_01. Branch `design-alignment` is LOCAL-ONLY — never push.
