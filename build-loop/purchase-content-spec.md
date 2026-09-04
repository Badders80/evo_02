# Purchase Content Spec — Flow C Steps 1–5 (Choose · Accept · Checkout · Pay · Own)

**Status:** CONTENT SPEC (BA deliverable) — every string, state, and edge case per purchase step. Wireframes build FROM this; nothing builds from the founder's head.
**Date:** 2026-09-01
**Style:** e3-content-tree node blocks (`[header]` `[body]` `[figure]` `[stepper]` `[CTA]` `[note]` `[error]` `[state]` `[email]` etc.)
**Sources (verified in code 2026-09-01):** `right-rail.tsx` · `create-session/route.ts` · `webhooks/stripe/route.ts` · `nellie-loop.ts` · `mystable-dashboard.tsx` · `mystable/page.tsx` · `pricing-card.tsx` · `marketplace/[slug]/page.tsx` · `e3-content-tree.md` (locked content) · `e3-flow-map.md` (locked outcomes) · `investor-flows-report.md` (locked decisions) · `service-blueprint.md` · `VOICE_AND_TONE_MANUAL.md` (evo_00) · `e3-right-rail-deepdive.md` (Fight Club rule)
**Dual-surface rule:** evo_01/02_website = LIVE prod, read-only reference. Gaps in evo_02 that exist in prod = PORT, not rebuild.

---

## 0. Voice & rules applied to every string below (do not re-derive)

- **Private Banker Standard** (VOICE_AND_TONE_MANUAL §1): professional, not stuffy; confident, not arrogant.
- **Silent Gavel** (§1.2): lead with the thoroughbred, never the platform; zero justification; no negation openers; *if a sentence tries to convince the reader we are legitimate — delete it.*
- **Fight Club rule** (e3-right-rail-deepdive §1, founder): selling ownership without selling it — quiet, implied, never shouted. The acceptance surface IS the moment of trust.
- **Vocabulary whitelist** (AGENTS.md + §2.3): `Stakes`/`Co-owners` (NOT `Units` — retired from investor copy 2026-09-01; units survive only in code internals/operator ledgers); `Stake` (NOT Pieces/Parts/Shares) · `Settlement`/`Distribution`/`Prize money` · `Lease contribution`/`Deposit` · `Evolution Stables`. Banned: Payout/Reward/Yield/Dividend/ROI, Top-up, Pieces/Parts/Shares, Token/Blockchain/Crypto.
- **Zero exclamation marks. British English** (`-ise`, `-our`, `metres`). Em dashes with spaces, not ellipses.
- **$$$$ rule:** never lead with dollars. Lead with the horse, the yard, the journey. Figures are tabular, monospace, secondary.
- **Pricing:** `pricingForUnits(wholesaleMonthlyNzd, units)` → `computeDslPricing` (legal_engine SSOT). List = cost ×1.05 ×1.03, GST-inclusive. 5×M float join, $M monthly keep. **Never invent pricing math.**
- **Values are PERCENT everywhere** (stakePctToStepUnits at checkout boundary only).
- **CTA matrix** (§6): `[ Become an Owner ]` — single locked CTA. (The former alternative CTA is retired; the acquire/stake-allocation variant is gone.)

---

## THE AGREED FLOW (founder-sculpted 2026-09-01) — supersedes the step structure below where they conflict

One continuous journey, horse page → locked-in owner. Steps 1–6 fluid-but-agreed; the audit-tracker rule and terminology rule are LOCKED. Detailed strings/edge cases for each step live in the sections below (error tables, stepper warnings, KYC prompt copy, reservation copy remain valid).

**STEP 1 — THE HOOK (horse page, right rail).** Public, no login wall.
- "Become an Owner" · "Becoming an owner is easier than you think."
- From $76 per month for a 1% stake · Fixed return — 75% of gross prize money* · Stake available 5% (*pro-rated to your stake, settled quarterly)
- CTA: **[ Ownership Terms and Conditions ]** — learn-more, not a buy button. Opens Step 2 pop-up.

**STEP 2 — THE TERM SHEET (pop-up).** The deal made real; stepper lives here. **Modal dimensions: `max-w-lg × h-[900px]` (bumped from locked `h-[720px]` on 2026-09-04 to match prod's natural content fit for Step 2 term sheet). On viewports ≥ 900px tall, popup stays ONE FIXED SIZE for Steps 2–6, does not resize between steps. On shorter viewports, modal clamps via `max-h-[calc(100vh-2rem)] my-auto` (responsive exception, founder 2026-09-04) so it never clips top/bottom. Logged deviation from the 2026-09-03 lock.** Modal body carries `overflow-y-auto` (re-audit guard 2026-09-04) so content scrolls inside when viewport clamps.
- Stake selector = the stake pill (right) + price (left); opens at 1%, ▲/▼ in 0.5%, manual entry with small warnings; monthly price moves with it. Tiny line beneath: minimum 1.0% · increments 0.5% · total available 5%.
- Upfront payment (5 months up front — 3 months deposit + 2 months keep in advance, link to PDS §4). Duration: start date — end date. Prize share: 75% of gross prize money, pro-rated.
- **Summary block (LOCKED 2026-09-03 — founder restructure):** four plain rows, label left · value right · sub-note below, divider line between each:
  - **Initial Payment** — {joinFloat} NZD — "for a {stake}% stake — includes deposit in initial payment"
  - **Monthly thereafter** — {monthlyKeep} NZD — "billed on the 1st of each month"
  - **Lease period** — {months} months — "From {start date} to {dsl: service_end_date}"
  - **Investor Return** — 75% of gross prize money (**green `status-active` accent — prod look, LOCKED 2026-09-03**) — "distributed quarterly, pro-rated based on your investment & official NZTR results"
  - ~~Syndicate stake available row DROPPED~~ (min/step/max lives in the stepper card only — no duplication)
- ~~Race expectation one-liner per horse~~ **REMOVED from term sheet 2026-09-03 (founder)** — the `raceExpectation` field + PDS §2.4 rendering stays in legal_engine (shipped + audited PASS); it just no longer surfaces in the Step 2 popup. Do not re-add to the popup.
- Prize distribution explained paragraph + pointer to where the depth lives (PDS/SA reviewed at next step).
- CTA: **[ Invest in {Horse} ]** — buying into the journey, not a supermarket purchase.
- Fine print (both Step 1 rail + Step 2 popup): "Subject to [Product Disclosure Statement] and [Syndicate Agreement]." — **PDS and SA are LIVE LINKS to the docs (LOCKED 2026-09-03)** — in the mock they anchor to Step 3 (the accept modal where the docs live); in build they open the compiled legal pack (getCompiledLegalPackForCampaign).

**STEP 3 — ACCEPT (gate modal).** PDS + SA as **FAQ-style accordion rows (LOCKED 2026-09-03 — founder: same flow/order, page presentation only)** — each doc is a collapsed row (title + truncated hash + "+"), click to expand the scroll viewport + tick; once ticked the row shows a green **Completed** badge (check_circle + "Completed"); Proceed unlocks when both show Completed. **Each tick = recorded acceptance** (audit-tracker rule): logged at the instant of the tick — user_id + document hash + timestamp — whether the sale ever completes or not. This is the verifiable signature (identifies the person + the exact document version + intent). CTA: **"Proceed to Secure Checkout" (LOCKED 2026-09-01 — kept despite leading to Verify; it is the established label and Verify is a quiet intermediate).**

**STEP 4 — VERIFY (one screen, NEW — rides the KYC port).** ONE tick only — the NZTR disqualification attestation ("You are not disqualified under NZTR rules"). **Residency is DERIVED, never asked (LOCKED 2026-09-01):** read from the Stripe Identity verification result (ID issuing country + address off the ID); NZ-resident and international-investor are internally-derived labels, same identity check for everyone, no separate question. Age 18+ also derived from the ID's date of birth. Identity check: government-issued ID + live selfie via Stripe Identity. "Required under New Zealand law before you become a co-owner." A few minutes; verified once, never re-checked per horse. Ambiguous residency edge cases (e.g. foreign passport + NZ address) resolve via the existing manual-assistance path, never via blocking. Failed check = manual-assistance path (member of Evolution Stables contacts them; resolution = founder/ops: approve/deny/re-verify).

**STEP 5 — PAY (Stripe hosted).** Line item: "{Horse} ({units}% Stake) — Initial 5×M float deposit", GST-inclusive, email pre-filled. Success → /mystable?checkout=success. Cancel → horse page, stake pre-filled via ?units=, honest 15-min reservation, [ Reserve Again ] on expiry (explicit, no silent auto-reserve).

**STEP 6 — OWN (post-purchase).** MyStable success state ("Welcome to the {Horse} syndicate"), welcome email (Yard Journal, E4), vault docs with full hashes, monthly keep expectation from Month 2.

**THE SPINE — AUDIT TRACKER (LOCKED 2026-09-01).** 100% audit tracker, NOT browsing clicks. Commitment events only, logged at source the instant they happen: PDS accepted · SA accepted · NZTR declaration accepted · identity check completed · checkout started · payment completed/cancelled/expired. Each row: who + exact document hash + when. Trail stands complete regardless of sale outcome — supports both the investor ("I paid, where is my horse") and the regulator (NZTR/FMA/counsel) without reconstruction.

**BACKLOG NOTE — THE SYNDICATION 101 GUIDE — "DIGITAL-SYNDICATION 101" (idea, 2026-09-01 — SHAPE LOCKED, not built. NOW ITS OWN BUILD CYCLE: `build-loop/ds101/` (2026-09-02, founder decision — linked to but independent of this flow). Architecture spec phase in progress; this note is the cross-ref only. Content = the logic and concepts detailed in the PDS/SA, re-voiced in layman's terms** — never legal boilerplate. Covers: how the 75% + pro-rata works, the float / deposit / monthly keep, what happens on injury/retirement, when distributions land (quarterly), what "spelling" means, how to exit, verified-international basics. Trigger point TBD (term sheet "learn more" links most likely); surface decision lands with wireframing. Content source = re-voiced pillars/term-sheet/PDS in Private Banker Standard.

**TERMINOLOGY RULE (LOCKED 2026-09-01).** Investor-facing: always **stake**, always as a percentage ("2.0% stake", "your stake", "stake available"). "Units" retires from investor-facing copy — survives only in code internals (function names, RPC params, metadata). "Tokens" banned everywhere.

**KYC POSITION (LOCKED 2026-09-01).** Verification happens at checkout, not upfront — compliance floor is "before contract execution / prize money moves" (SOP §9.1), not before browsing or reading. Protects the casual investor: they only verify once they've decided. All reading stays public.

---

## STEP 1 — CHOOSE (horse page, right rail)

**Current state in code:** slider (`right-rail.tsx:511-558`) — rework to stepper+input queued. Opens at `Math.max(min, 2.0)` (line 482) — **violates locked "opens at minimum" — flag as fix**. Min hardcoded `1.0` (`marketplace/[slug]/page.tsx:216`) — **must read `campaign.min_stake_pct` — flag as fix**. Fine print line (locked) NOT in code — rail shows "Min X% · Step Y% · Max Z%" instead — **replace with locked fine print**.

```
[header]    {legalName} (NZ)
[subheader] Become an Owner
[body]      Take a stake from {min}%, in clean {step}% steps, with fixed monthly syndicate keep.

[stepper]   Stake — opens at {min}%
            ▲ / ▼ move in {step}% increments · manual entry allowed
            [state] open value: min (NOT max(min, 2.0) — fix queued)
            [state] ▲ at max: further presses disabled (no wrap)
            [state] ▼ at min: further presses disabled (no wrap)
            [state] manual entry, in range, multiple of step: accepted, pricing updates
            [state] manual entry, multiple of step, OVER max:
                    [error] "Stake available is {max}% — reduce your stake"
            [state] manual entry, multiple of step, UNDER min:
                    [error] "Minimum investment is {min}% — increase your stake"
            [state] manual entry, NOT a multiple of step (e.g. 1.3%):
                    [error] "Stake must be a multiple of {step}%"
                    (server enforces: stakePctToStepUnits throws INVALID_STAKE — UI must
                     warn before checkout, never send a non-multiple)
            [state] entry cleared / empty: revert to {min}% on blur

[figure]    Monthly Keep — ${pricing.monthlyKeepUnitNzd} /mo
[figure]    Join Float (5×M) — ${pricing.joinFloatUnitNzd}
[note]      All figures GST-inclusive. (pricingForUnits output — never hand-computed)

[note]      Minimum investment {min}% · Stake available {max}% · Contact us for more info
            (LOCKED fine print — replaces current "Min/Step/Max" strip.
             "Contact us" = [contact link] — mailto TBD by founder, GWS email)

[CTA]       Become an Owner ──────────────► STEP 2 (gate modal)

[dropdown]  Ownership Pillars (5) — CONTENT LOCKED in e3-content-tree.md, reference only:
  ├─ The Deal · What's Included · What If · Your Return · Exit & Transfer
  └─ (do not rewrite — copy is locked and voice-checked)
```

**FORK A — campaign status (before rail renders):**
```
open ──────────────► rail with CTA [ Become an Owner ]
Fully Subscribed / Completed ► amber pill, ClosedCampaignCard (lead form, no CTA)
Coming Soon                  ► green pill, ComingSoonCard (lead form, no CTA)
```

**FORK B — stake bounds (DSL-driven per horse, LOCKED):**
```
min = campaign.min_stake_pct   (page.tsx:216 hardcodes 1.0 — FIX QUEUED)
step = campaign.stakeStepPct   (default 0.5)
max = campaign.capTableFixture.availablePct   (Nellie: 5.0%)
Nellie example: Min 1.0% · Step 0.5% · Max 5.0%
```

**Edge cases:**
- `availablePct` = 0 or negative → rail falls back to max 10.0 (current code) — **flag: a 0-available open campaign should not render a buyable rail; treat as Fully Subscribed** (founder decision).
- Wholesale missing → current fallback `3800` (right-rail.tsx:486) — keep as data-gap fallback, never surface to investor.

---

## STEP 2 — ACCEPT (gate modal — Regulatory Acknowledgment)

**Current state in code:** shipped (E3). Modal shell correct. **Gap: KYC prompt placement (read-then-verify) NOT in modal** — 403 currently surfaces as a raw error string in the modal error box. **Gap: 401 login redirect drops stake** (`next` = pathname only, right-rail.tsx:271-272) — fix queued with Option A.

```
[badge]     NZTR Code
[header]    Regulatory Acknowledgment
[subheader] {legalName} (NZ) · {stake}% Stake
[note]      ✕ close (top-right) → back to STEP 1, stake preserved

[figure]    Monthly Keep — ${pricing.monthlyKeepUnitNzd} /mo
[figure]    Join Float (5×M Deposit) — ${pricing.joinFloatUnitNzd}

[doc]       Product Disclosure Statement (PDS)
            [hash] {pdsHash}   (SHA-256, truncated display, full on hover/copy)
            [body] compiled legal pack per horse (getCompiledLegalPackForCampaign)
            [state] scroll viewport max-h-36; checkbox disabled until scrolled to bottom
                    (scroll-through IS the moment of trust — Fight Club rule)
[checkbox]  I have read and agree to the Product Disclosure Statement (PDS)

[doc]       Syndicate Agreement (SA)
            [hash] {saHash}
            [body] compiled legal pack per horse
            [state] scroll viewport max-h-36; checkbox disabled until scrolled to bottom
[checkbox]  I acknowledge and agree to the Syndicate Agreement terms

[note]      Verification is completed under the NZTR Authorised Syndication Code.
            Handoff is cryptographically verified.

[CTA]       Proceed to Secure Checkout
            [state] DISABLED until both checkboxes ticked (and both scrolled)
            [state] submitting → "Preparing Secure Checkout…"
            [state] error → inline [error] box (see STEP 3 mapping)
```

**KYC prompt placement (read-then-verify — LOCKED 2026-09-01):**
```
Unverified investor: modal OPENS (docs readable — no login wall, no KYC wall on reading).
On Proceed → create-session returns 403 KYC_REQUIRED →
  [state] modal stays open, error box replaced by KYC prompt:
  [body]  "Identity verification is required before checkout. This is a one-time
          check under New Zealand law."
  [CTA]   [ Verify Identity ] ──► Stripe Identity (PORT from prod: /auth/verify +
          /marketplace/[id]/kyc-processing — Firebase → Supabase, UX already walked)
  [note]  After verification, return here — your stake and documents are preserved.
[state] pending KYC → "Your identity check is being reviewed. We will email you
        when it is complete." (no dead-end; resume path)
[state] rejected KYC (Stripe requires_input mapped → rejected) →
        "Your identity check could not be completed. A member of Evolution
        Stables will contact you shortly to help complete the process."
        (MANUAL-ASSISTANCE path — LOCKED 2026-09-01. Matches prod's
         manual-assistance UX — port it. Resolution = founder/ops decision:
         approve, deny, or re-verify. Not a dead-end, not an automated retry.)
```

**Edge cases:**
- 401 (session expired mid-flow) → login redirect with `next` CARRYING stake: `/login?next=/horses/{slug}?units={units}` (fix queued with Option A — currently drops stake).
- Escape key / backdrop click closes modal, stake preserved (already true).
- Hash display: full 64-hex on hover or copy button — trust anchor, never truncated in vault (vault shows full).

---

## STEP 3 — CHECKOUT (create-session handoff)

**Current state in code:** route wired (`create-session/route.ts`). Frontend redirects immediately on success. **Gap: no countdown UI, no mapped error copy** — raw server strings surface to investor. **Gap: reservation-expired UX undecided (open item 1).**

**What the investor sees (happy path):**
```
[state] Proceed clicked → "Preparing Secure Checkout…" (~1s)
[state] Reservation created (15-min TTL) → redirect to Stripe hosted page
[note]  Investor never sees the reservation mechanics — only the Stripe page.
```

**Reservation countdown copy (spec — where it matters):**
```
[state] On RETURN from Stripe cancel (reservation still live):
        [body] "Your stake of {stake}% in {legalName} is reserved for {n} minutes."
        [CTA]  [ Resume Checkout ] ──► re-calls create-session (fresh reservation,
               same stake) → Stripe
        [note] Honest countdown, no fake urgency. If expired:
[state] Reservation expired:
        [body] "Your reservation has expired. Your stake is still available."
        [CTA]  [ Reserve Again ] ──► re-calls create-session (fresh reservation,
               same stake) → Stripe
        (LOCKED 2026-09-01: explicit, honest copy — no silent auto-reserve.
         Mechanism unchanged: the RPC creates a fresh reservation per call.)
```

**Error states (server code → investor copy):**

| Server (code) | Investor copy (never raw) |
|---|---|
| 401 UNAUTHENTICATED | → login redirect, stake preserved via `next` (fix queued) |
| 403 KYC_REQUIRED | → STEP 2 KYC prompt (Verify Identity CTA) |
| 400 INVALID_STAKE | "Stake must be a multiple of {step}%" |
| 404 CAMPAIGN_NOT_FOUND | "This campaign is no longer available." |
| 409 CHECKOUT_CLOSED | "This campaign is no longer open for subscription." |
| 409 RESERVE_FAILED | "That stake was just acquired by another co-owner. Available stake is now {max}%." (honest, no fake scarcity) |
| 503 PURCHASES_DISABLED (kill switch) | "Checkout is temporarily unavailable — please try again shortly." (investor NEVER sees PURCHASES_DISABLED) |
| 503 SUPABASE_NOT_CONFIGURED / RESERVE_RPC_ERROR | "Checkout is temporarily unavailable — please try again shortly." |
| 500 Stripe error | "Payment could not be started — please try again." |

**Edge cases:**
- Double-click Proceed → submitting state disables button (already true).
- Reservation created but Stripe redirect fails → investor lands back on horse page with stake preserved; reservation expires in 15 min, no charge, no holding (safe by design).
- Kill switch active → button still renders (campaign open) but Proceed shows the 503 copy above. **Flag: consider hiding CTA entirely when kill switch on (founder call — recommend keep visible, honest copy, so the surface is testable).**

---

## STEP 4 — PAY (Stripe hosted page)

**Current state in code:** wired. Line items set in `create-session/route.ts:107-117`. **Gap: cancel_url does NOT carry units** (line 106: `/horses/{slug}` only) — Option A fix queued. **Gap: success return has no landing state** (mystable/page.tsx ignores searchParams).

```
[state] Stripe hosted checkout (external, evolutionstables.nz-branded)
[figure] Line item name:  "{legalName} ({units}% Stake)"
[figure] Line item desc:  "Initial 5×M float deposit for {legalName}"
         (whitelist OK: Deposit ✓. Voice check: quiet, factual, no selling.)
[figure] Amount:          ${pricing.joinFloatUnitNzd} NZD (GST-inclusive), qty 1
[note]   customer_email pre-filled from session (no re-entry)
[note]   Monthly keep is NOT charged here — disclosed in STEP 1/2 figures;
         first keep invoice commences Month 2 (billing expectation, STEP 5)

[state] SUCCESS → redirect to /mystable?checkout=success&slug={slug}&units={units}
[state] CANCEL  → redirect to /horses/{slug}?units={units}   (Option A — FIX QUEUED:
         create-session/route.ts:106 must append ?units=; horse page reads param,
         pre-fills stepper, shows STEP 3 resume state)
```

**Edge cases:**
- Payment succeeds but webhook delayed → investor lands on MyStable success state; holding appears when webhook settles (seconds–minutes). Success state must not claim the holding exists yet — see STEP 5.
- Cancel with expired reservation → STEP 3 expired copy (Reserve Again).
- Cancel with no units param (pre-fix) → stepper opens at min (graceful default).

---

## STEP 5 — OWN (post-purchase)

**Current state in code:** webhook tail wired minus E4 (holding insert → consume reservation → R2 vault → **email MISSING**). MyStable tabs exist (holdings/feed/vault/billing). **Gap: success state not implemented** (mystable/page.tsx ignores `?checkout=success`). **Gap: E4 welcome email + bcc not built.**

### 5a. MyStable success state (E4 — spec, don't build)

```
[state] /mystable?checkout=success&slug={slug}&units={units} →
[badge]     Purchase Confirmed
[header]    Welcome to the {legalName} syndicate
[body]      Your stake of {units}% is confirmed. Your executed PDS and Syndicate
            Agreement are in your Legal Execution Vault, and your welcome email
            is on its way.
[figure]    Monthly Keep — ${pricing.monthlyKeepUnitNzd} /mo (commences Month 2)
[figure]    Deposit Float — ${pricing.joinFloatUnitNzd} (5×M, held in trust)
[note]      What happens next: ① welcome email (minutes) ② vault documents
            (now available) ③ first distribution at the next quarterly settlement
            ④ monthly keep invoices from Month 2.
[CTA]       [ View My Holdings ] ──► holdings tab
[CTA]       [ View Vault ] ──► vault tab
[state] holding not yet visible (webhook in flight) → banner:
        "Your holding is being finalised — it will appear here within minutes."
        (never claim the holding exists before the webhook settles)
```

### 5b. Welcome email (E4 — spec copy, don't build)

**Format:** Yard Journal (VOICE_AND_TONE_MANUAL §7.2) — headline with single italicised emphasis word, 120–280 words in 50–90 word paragraphs, sign-off `Alex Baddeley · Evolution Stables` with gold hairline rule. No bullets, no exclamation marks, British English, never lead with dollars.

```
Subject:  {legalName} — your syndicate stake is confirmed

[email]
  Headline:  *Welcome* to the {legalName} syndicate.
  Body:      Your stake of {units}% is confirmed and your executed documents are
             in your Legal Execution Vault. The float deposit covers the first
             five months of the term; your monthly keep of ${M} commences in
             Month 2 and is billed on the first of each month.
             Distributions of prize money are settled quarterly, pro-rata to
             your stake, directly to your bank account. The yard will keep you
             close to the track — training notes, race-day plans, and results
             arrive here as they happen.
             Your PDS and Syndicate Agreement hashes are recorded against your
             holding. Keep this email for your records.
  Sign-off:  Alex Baddeley · Evolution Stables
             (gold hairline rule)
  [note]     Bcc: bcc_lists/{slug}.json (E4 — investor → bcc list, per sprint map)
```

### 5c. Vault docs (exists — verify copy)

```
[state] vault tab: PDS + SA rows, full SHA-256 hashes, [ Download ] per doc
        (already implemented — mystable-dashboard.tsx:292-352)
[note]  hash-mismatch note exists ("Holding hash differs from current compiler
        output. Vault stores the signed hash above.") — keep, it is honest.
```

### 5d. Monthly billing expectation (exists — verify copy)

```
[state] billing tab: "No Stripe billing portal on file. Card details appear after
        a paid checkout, not as demo data." (placeholder — E4 polish: after
        purchase, show "Monthly keep of ${M}/mo — first invoice Month 2" +
        Stripe billing portal link when subscription exists)
```

---

## Open items (2) — RESOLVED 2026-09-01 (founder decisions locked)

1. **Reservation-expired UX — LOCKED: explicit, honest copy.** No silent auto-reserve. On expiry: "Your reservation has expired. Your stake is still available." [ Reserve Again ] → re-calls create-session (fresh reservation, same stake). Mechanism unchanged (RPC creates fresh reservation per call); only the copy is locked.
2. **KYC `rejected` vs `requires_input` — LOCKED: keep evo_02 `rejected` enum; map Stripe `requires_input` → `rejected` at port.** Failed check = MANUAL-ASSISTANCE path (matches prod's manual-assistance UX — port it): "A member of Evolution Stables will contact you shortly to help complete the process." Resolution (approve / deny / re-verify) is a founder/ops decision, not an automated retry loop. Not a dead-end.

## Additional flags — RESOLVED 2026-09-01 (founder decisions locked)

- `right-rail.tsx:482` opens at `Math.max(min, 2.0)` — violates locked "opens at minimum". Fix with stepper rework. (LOCKED: open at min.)
- Locked fine print line not in code — replace "Min/Step/Max" strip (right-rail.tsx:533-537). (LOCKED: fine print line ships with stepper rework.)
- `availablePct` ≤ 0 on an open campaign — **LOCKED: treat as Fully Subscribed** (sold out flips the pill; no buyable rail).
- Two checkout surfaces (E3 rail + legacy PricingCard) — **LOCKED: consolidate on the E3 rail; PricingCard stays legacy, untouched, not retired — known location if ever needed. No port of its pop-up styling into the rail.**
- Kill switch: keep CTA visible with honest 503 copy vs hide. (Recommend keep visible for testability — awaiting founder call, non-blocking.)

## Acceptance criteria (feeds the test-purchase runbook — DoD proof)

1. Stepper opens at min; ▲/▼ step correctly; over/under/non-multiple warnings shown; fine print line renders DSL values.
2. Gate modal: both docs scroll-locked, dual checkboxes, hashes visible, Proceed disabled until both; unverified investor sees KYC prompt, not a raw error.
3. create-session: every error code maps to investor copy; kill switch returns honest copy; reservation TTL 15 min.
4. Stripe: line items named per spec; success → MyStable success state; cancel → horse page with `?units=` pre-fill.
5. Webhook: holding → vault → welcome email (E4) → MyStable shows holding + vault hashes + billing expectation.
6. Voice: zero exclamation marks, whitelist vocabulary, British English, no dollar-led copy — grep-able gate.
