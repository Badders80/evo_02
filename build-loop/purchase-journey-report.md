# The Investor Purchase Journey — A Functional Report

**Status:** NARRATIVE REPORT (plain language, pre-sculpt). Next step: sculpt this into exact content per phase (node-block spec).
**Date:** 2026-09-01
**Purpose:** List everything we want in the journey, and how each thing gets in — from the first look at the horse page to a locked-in owner. Written functionally, aligned with our goals and voice.
**Voice applied throughout:** Private Banker Standard · Silent Gavel · Fight Club rule (selling ownership without selling it — quiet, implied, never shouted) · vocabulary whitelist · zero exclamation marks · British English · never lead with dollars.

---

## Where the journey starts

The journey begins on the horse-specific page — `/marketplace/nellie` — on the right-hand rail. The page is public: no login wall, no forced signup (locked decision — SEO and no forced signup). The rail is the same surface for everyone; the difference between a signed-out visitor, a signed-in unverified investor, and a KYC'ed investor shows up only at the gates, which fire at the moment of payment — not at page load.

**#1 is the right rail of the horse page.** From there, the journey runs: hook → term sheet → decision → gates → payment → ownership.

---

## Phase 1 — The Hook (the right rail)

**What we want:** the moment an investor lands on the horse page, the right rail makes ownership feel possible. Not a sales pitch — an invitation. The header says "Become an Owner" and the first line lands the point: *becoming an owner is easier than you think.* Then the key hooks, stated plainly:

- From $76/month for a 1% stake
- Fixed return — 75% of gross stakes

That is enough for the investor to think "oh, I could do that." The rail does not try to close anything. It lays the foundation and offers one quiet next step: a learn-more CTA — "Investment Terms and Conditions" — not a buy button.

**How it gets in:** the rail is a static, public surface. The figures come from the live pricing engine (`pricingForUnits` — never hand-computed, GST-inclusive). The header and hook copy are locked strings. The CTA opens the term-sheet modal (Phase 2). No login, no KYC, no stepper here — the rail is pure hook.

**Voice check:** this is the Fight Club moment. We are selling ownership without selling it. No exclamation marks, no "limited time", no shouting. The numbers do the work; the words stay quiet.

---

## Phase 2 — The Term Sheet (the next surface)

**What we want:** the investor clicked "Investment Terms and Conditions" — now they get more than the hook, but not the full legal depth of the PDS/SA. A term-sheet level of detail: the real numbers, the shape of the deal, and the return mechanics — presented cleanly, with room to go deeper only if they want.

The term-sheet modal shows:

- The horse name and the deal framing (Digital-Syndication Terms)
- Monthly keep and the upfront deposit (the 5×M float) — live figures for the stake
- The key terms as a clean table: lease period, lease start date, stake available, investor return (75% of gross stakes)
- A short "returns explained" line: pro-rata on your stake, calculated from official NZTR results, distributed quarterly after settlement
- A learn-more link for anyone who wants the detail

Extra information is available on demand — dropdowns, mini-popups, FAQ links — but the surface stays light. We do not get heavy here. The heavy content (PDS/SA) has its own moment later.

**How it gets in:** every value is DSL-driven per horse (term length, start date, available stake, wholesale cost). Pricing comes from the pricing engine. The 5 pillars (The Deal, What's Included, What If, Your Return, Exit & Transfer) live here as the "learn more" dropdowns — their content is already locked and voice-checked; we reference it, we do not rewrite it. The stake stepper also lives here — this is where the investor chooses their number, next to the terms that explain what the number means.

**Voice check:** the term sheet is the quiet middle ground. It informs; it does not persuade. The return figure is stated as fact, not promise. No ROI language, no multipliers, no "you could earn" — just the mechanics, plainly.

---

## Phase 3 — The Decision (stake selection + acceptance)

**What we want:** the investor picks their stake and formally accepts the deal. Two things happen here, in order:

1. **Stake selection.** A stepper+input box that opens at the minimum, moves in clean increments (▲/▼), and allows manual entry. If the investor goes over the available stake, under the minimum, or enters a number that is not a multiple of the step, they get a small, plain warning — both directions. The pricing figures update live as the stake changes, so the investor always sees the exact monthly keep and deposit for their choice.

2. **Acceptance.** The gate modal: the PDS and the Syndicate Agreement, each in a scrollable view, each with its SHA-256 hash shown as the trust anchor. The investor scrolls through each document and ticks the box. The Proceed button stays disabled until both are ticked. The scroll-through is the moment of trust — this is where the pillars are told in a Fight Club manner: quiet, implied, never shouted.

**How it gets in:** the stepper behavior is fully specified (open value, increments, warning copy for over/under/non-multiple). The documents come from the compiled legal pack per horse — we never author them, we surface them. The hashes are computed and displayed. The dual-checkbox gate is already built and shipped (E3); the stepper replaces the current slider (rework queued).

**Voice check:** the acceptance surface is the quietest moment in the journey. No urgency, no pressure, no "act now". The documents speak; the checkboxes confirm.

---

## Phase 4 — The Gates (login + KYC)

**What we want:** the gates exist, but they are not walls at the front door — they fire at the moment of payment. Three states, three quiet responses:

1. **Signed out.** The investor clicks Proceed and is taken to login (Google, one click). They return to the horse page with their stake preserved — nothing lost, nothing re-entered.

2. **Signed in, not KYC'ed.** The modal opens and the documents are fully readable — reading is never blocked (read-then-verify, locked). When they try to proceed, they are told plainly: identity verification is required before checkout, it is a one-time check under New Zealand law, and here is the button to do it. They verify, and return to find their stake and documents exactly as they left them.

3. **KYC pending or failed.** Pending: "being reviewed — we will email you when it is complete." Failed: not a dead-end and not an automated retry loop — a member of Evolution Stables contacts them to help complete the process. What happens after that (approve, deny, re-verify) is our decision, made case by case.

**How it gets in:** the login return path carries the stake (`?units=` — the Option A fix, queued). The KYC flow is a port from production (Firebase → Supabase) — the UX is already designed and walked; we do not rebuild it. The failed-check state maps Stripe's `requires_input` to our `rejected` and routes to the manual-assistance path, matching what production already does.

**Voice check:** the gates speak plainly and never in jargon. No "AML/CFT" walls of text — one line: identity verification required by New Zealand law. No dead-ends, no "contact support" shrugs — a named next step every time.

---

## Phase 5 — The Payment (Stripe)

**What we want:** a clean, honest handoff. The investor is sent to Stripe's hosted page with everything already known: the line item named clearly ("{Horse} ({units}% Syndicate Unit)" — "Initial 5×M float deposit"), the amount GST-inclusive, their email pre-filled. No surprises, no re-entry.

If they complete payment, they land on MyStable with a success state. If they cancel, they return to the horse page with their stake pre-filled and an honest reservation countdown — their stake is held for 15 minutes, and if it expires, they are told plainly and offered a fresh reservation. No fake urgency, no countdown theatrics.

**How it gets in:** the checkout route is wired. The cancel return needs the `?units=` fix (queued). Every server error maps to plain investor copy — never raw codes: "those units were just acquired by another co-owner", "checkout is temporarily unavailable", each in the right tone. The reservation copy is specified and locked.

**Voice check:** the payment moment is the most transactional, so it is the most restrained. The line item is factual. The countdown is honest. Nothing here sells — it completes.

---

## Phase 6 — The Ownership (MyStable + the welcome email)

**What we want:** the investor becomes a locked-in owner, and the experience confirms it in four quiet ways:

1. **MyStable success state.** "Welcome to the {Horse} syndicate" — their stake confirmed, their executed documents noted, and a plain "what happens next": welcome email on its way, vault documents available, first distribution at the next quarterly settlement, monthly keep from Month 2. If the holding is still being finalised by the webhook, we say so honestly — we never claim the holding exists before it does.

2. **The welcome email.** A Yard Journal-format email: a single italicised emphasis word in the headline, short paragraphs, signed by Alex Baddeley · Evolution Stables. It confirms the stake, points to the vault, sets the billing expectation (keep from Month 2), and sets the distribution expectation (quarterly, pro-rata). It is filed to the campaign's bcc list.

3. **The vault.** The executed PDS and SA, with their full hashes, downloadable. The trust anchor made permanent.

4. **Billing.** The monthly keep expectation is visible — from Month 2, at the rate they saw before they paid. No surprise first invoice.

**How it gets in:** the webhook tail is wired (signature → holding → reservation consumed → vault upload); the email and bcc are the E4 build item. The success state is a new surface on MyStable. The vault and billing tabs exist and need polish, not invention.

**Voice check:** ownership is confirmed quietly and completely. The email is the Yard Journal — the horse and the yard lead, the numbers follow. No "congratulations!" shouting, no exclamation marks — the confirmation itself is the warmth.

---

## Voice guardrails throughout (non-negotiable)

- **Never lead with dollars.** The horse, the yard, the journey lead; figures are tabular and secondary.
- **Whitelist vocabulary.** Units/Stakes/Co-owners · Settlement/Distribution/Prize money · Lease contribution/Deposit · Evolution Stables. Never Payout/Reward/Yield/Dividend/ROI, never Top-up, never Pieces/Parts/Shares.
- **Zero exclamation marks.** British English. Em dashes, not ellipses.
- **Fight Club rule.** If a sentence is trying to convince the reader we are legitimate — delete it.
- **No fake scarcity.** Honest availability, honest countdowns, honest errors.
- **No jargon.** "Identity verification required by New Zealand law" — not "AML/CFT compliance".

---

## What happens next

This report is the inventory. The next step is the sculpt: take each phase and write the exact content — every string, every state, every edge case — in the node-block format (the content spec). Most of that sculpt already exists in `build-loop/purchase-content-spec.md`; this report re-frames it around the two-surface Step 1 (rail hook + term-sheet modal) and the founder's CTA and hook decisions. The sculpt updates the spec, then wireframes build from the spec.
