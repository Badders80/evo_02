# Investor Flows — Login · KYC · Purchase (Scoping Report)

**Status:** SCOPING ONLY — no code, no schema, no deploys. Founder reviews → gives all-clear → becomes the staged skeleton.
**Date:** 2026-09-01
**Assumption (LOCKED by founder 2026-09-01):** KYC is a prerequisite to invest. Unverified investors are either blocked at the gate or kicked back to KYC. Purchase flows assume KYC already passed.
**Sources:** evo_02 code (this repo) · mission_control · gbrain canon (evo_00 SSOT: Operations SOP §9.1, DSL Manual §6, Infrastructure Spec §1.3–1.4, Voice & Tone Manual) · evo_01 plans (cross-check below).

---

## 0. Mental model — the visibility ladder

Every step in every flow answers two questions: **what can the investor see** and **what gate do they pass to see more**.

```
Public ──login──▶ Logged-in ──KYC──▶ Verified ──pay──▶ Owner
  see:         see:              see:            see:
  marketing    PDS + SA          checkout        cap table,
  terms        (gated)                           vault docs
```

The ladder IS the staged build order: each rung = one page/stage = what content unlocks at that rung.

---

## 1. Flow A — Investor Login (3 steps)

**Current state (live in evo_02):** `/auth/login` prod-parity page · Google OAuth (app-mediated — consent shows **evolutionstables.nz**, not supabase.co) + email/password fallback · return path preserved via `?next=` · friendly error messages (`AUTH_ERROR_MESSAGES`) · first sign-in auto-creates profile with `kyc_status='unverified'` (`handle_new_user` trigger, migration 00004).

| # | Step name | What happens | Gate passed |
|---|---|---|---|
| 1 | **Redirect to sign-in** | Restricted action (View investment terms / checkout) → `/auth/login?next=…` | — |
| 2 | **Authenticate** | Google pill (OAuth) or email+password (Supabase native) | signed-in |
| 3 | **Return to `next`** | Session established; profile auto-created (unverified) if new | first-rung unlocked |

**Want (transparency + accessibility):**
- One-click Google; password as fallback only.
- Consent screen on OUR domain (already true — keep it).
- Return path preserved on success (already true); **OAuth error path drops `next`** — `api/auth/google/callback` redirects to `/login?error=…` with no return path. Fix before E4.
- Clear "why am I being asked to sign in" at the redirect moment.
- Friendly, non-jargon error messages (7 OAuth codes mapped; **password path still surfaces raw Supabase messages** — map before E4).

**Don't want:**
- Multi-step forms, forced account creation before seeing marketing terms.
- Consent screen showing `*.supabase.co` (regression risk).
- Error jargon / bare codes to the investor.
- Surprise: signing in must not feel like "signing a contract."

---

## 2. Flow B — Investor KYC (4 steps · 4 states)

**Current state:** schema + enforcement exist in evo_02; **full KYC stack exists in production** (evo_01/02_website: `/api/kyc/create-session|callback|status` + `/auth/verify` + `/marketplace/[id]/kyc-processing` — Firebase claims, resume + sync + manual-assistance UX). evo_02 needs a **PORT (Firebase → Supabase), not a rebuild** — UX already designed and walked. `profiles.kyc_status` enum: `unverified → pending → verified | rejected` (production has no `rejected` — Stripe's failure state is `requires_input`; reconcile at port). Verified enforced at checkout (`requireVerifiedKyc` → 403 `KYC_REQUIRED`, `create-session/route.ts`). Mission Control models the full state (`stripeVerificationSessionId`, `kycVerifiedAt`, `nztrLicenseNumber`).

**SSOT lock (Ops SOP §9.1):** identity verification via **Stripe Identity** (digital), compliant with NZ **AML/CFT Act 2009** + NZTR syndication standards, before executing any lease contract or receiving prize distributions. Same gate applies to transfer assignees.

| # | Step name | What happens | Outcome |
|---|---|---|---|
| 1 | **Trigger** | Investor hits a verified-only action with `kyc_status ≠ verified` | block or kick-back (founder rule) |
| 2 | **Initiate** | Create Stripe Identity verification session → redirect | pending |
| 3 | **Verify** | Stripe Identity ID + biometric check (automated) | pending → verified |
| 4 | **Resolve** | Update `kyc_status` + `kyc_verified_at`; rejected gets a re-verify path | verified \| rejected |

**Want:**
- One-time, automated, no human review for the standard path (Stripe Identity).
- KYC status visible everywhere it matters (MyStable badge already exists).
- One-line plain-language reason: "Identity check required by NZ law." No AML/CFT jargon.
- Clear pending state ("being reviewed"), clear reject path (re-verify, not dead-end).
- Once verified: never re-verify per horse.

**Don't want:**
- Re-KYC on every purchase.
- Dead-end rejection with no recovery path.
- Hiding WHY verification is required (transparency = legal basis shown).
- Collecting more identity data than Stripe Identity requires.

---

## 3. Flow C — Investor Purchase (5 steps · backend wired)

**Current state:** backend is fully wired; E4 (post-purchase) is the gap. Steps 1–2 shipped (E3: right-rail `right-rail.tsx` + acceptance gate). Step 3 exists (`api/checkout/create-session`). Step 5 exists (`api/webhooks/stripe`) minus email/bcc.

| # | Step name | What happens | Current build status |
|---|---|---|---|
| 1 | **Choose** | Horse page: stake input (number box + up/down stepper, starts at minimum, moves in increments, manual entry with out-of-range warning both directions), fine print "Minimum investment ___% · Stake available ___% · Contact us for more info", 5 pillars accordion, live NZD pricing (list = cost ×1.05 ×1.03, GST-inclusive) | ⚠️ E3 shipped as slider — rework to stepper+input |
| 2 | **Accept** | Gate modal: full PDS + SA (compiled legal pack, SHA-256 hashes shown), scroll + dual checkboxes → Proceed | ✅ E3 shipped |
| 3 | **Checkout** | Auth → KYC verified → campaign open → reserve shares (15-min TTL, 0.5% step-units) → Stripe hosted session (5×M float deposit) | ✅ route wired |
| 4 | **Pay** | Stripe hosted page; success → `/mystable?checkout=success`; cancel → back to horse page with stake pre-filled (**DECIDED: carry units in `cancel_url`** — `create-session/route.ts:106` + page reads param) | ⚠️ wired, stake-loss bug — fix queued |
| 5 | **Own** | Webhook: signature + paid + hash match → insert holding → consume reservation → PDS+SA to R2 vault → **E4: welcome email + bcc list** → MyStable tabs | ⚠️ E4 missing |

**SSOT locks already in the code (do not re-derive):** $5×`M` float join + $M monthly keep (pro-rata refundable) · 5% margin + 3% processing embedded in pricing · reservation RPC enforces integer step-units against `shares_available` (total = listed_stake_pct / stake_step_pct) · webhook idempotent (unique event, unique-holding tolerance) · `PURCHASES_ENABLED` kill switch.

**Want (transparency + accessibility):**
- Every number visible before pay: stake %, exact dollar (float deposit + monthly keep), GST-inclusive note.
- PDS/SA readable in-modal (not a download wall) — already true.
- Hash integrity shown as the trust anchor (already true).
- Honest reservation countdown; cancel returns you to your selection.
- Post-purchase "what happens next": welcome email, vault docs, monthly billing expectation — no surprises.
- One-time KYC honored end-to-end.
- Stake entry: box opens at minimum; up/down stepper moves in increments; manual entry allowed; out-of-range (over max or under min) shows a small warning.
- Fine print under the box: "Minimum investment ___% · Stake available ___% · Contact us for more info" — covers larger-stake interest, no separate tag.
- Min/step/max are DSL-driven per horse (`min_stake_pct`, `stake_step_pct`, `availablePct`) — **min currently hardcoded 1.0 in page** (`marketplace/[slug]/page.tsx:216`), must read `campaign.min_stake_pct`.

**Don't want:**
- Hidden fees or surprise "first invoice" (monthly keep must be disclosed pre-checkout).
- Fake scarcity/urgency in countdowns or availability copy.
- Charging before acceptance (order: Accept → Checkout → Pay — already true).
- Burying legal docs behind a download; forcing payment before reading.
- Jargon or blacklisted vocabulary anywhere in the flow (voice manual whitelist).

---

## 4. Visibility rules (ladder applied — LOCKED 2026-09-01)

| Rung | Can see | Blocked from |
|---|---|---|
| Signed out | Horse page + full rail: pillars, pricing, projections, race stats | Login-gated actions (checkout) |
| Signed in, unverified | + gate modal PDS/SA (read-then-verify) | Checkout (403 `KYC_REQUIRED`) |
| Verified | Checkout | — |
| Owner | MyStable: holdings, feed, vault, billing | — |

**LOCKED (founder 2026-09-01):** read-then-verify confirmed — gate modal opens for unverified investors; pay action blocked until verified. Horse page stays public (no login wall — SEO + no forced signup). Supersedes e3-flow-map "KYC gate — blocked" node (docs readable pre-KYC; checkout still gated).

---

## 5. Gaps that gate "investor can buy a horse" (DoD)

1. **KYC port** — production (evo_01/02_website) has the full stack: 3 API routes (`/api/kyc/create-session|callback|status`) + 2 screens (`/auth/verify`, `/marketplace/[id]/kyc-processing`), Firebase claims. Port to Supabase in evo_02 — UX already designed + walked. Reconcile `rejected` enum vs production's `requires_input` at port.
2. **E4 post-purchase** — welcome email + bcc list + MyStable success polish (webhook tail exists).
3. **Two open decisions** (from `e3-flow-map.md`): KYC failure UX (hard block vs kick-back copy), reservation-expiry (auto re-reserve vs manual). ~~Cancel-stake~~ **RESOLVED 2026-09-01: carry units in `cancel_url`** (Option A — `create-session/route.ts:106` appends `?units=`, horse page pre-fills from param).
4. **Test-purchase runbook** — create session → pay → webhook → holding → email → vault → MyStable. This run IS the DoD proof.
5. **Transfer facilitation** — owner selling stake: Evolution facilitates under **"standard fees apply"** (fee % TBD by founder — likely 5%+3% but undecided). Incoming buyer re-verified (locked: Ops SOP §9.1 — same gate as initial KYC). NOT in code (no SA clause, no transfer flow).

## 6. Cross-checks

- **evo_01 plans (SSOT docs):** agent sweep in progress → this section updated on receipt.
- **gbrain canon:** Ops SOP §9.1 (KYC/Stripe Identity) · DSL §6 (unit math, campaign states) · Infra spec §1.3 (checkout pipeline, billing portal, idempotent webhooks, kill switch) · Infra spec §1.4 (Resend: Welcome & KYC Approval, DSL Confirmation + PDS/SA delivery, monthly receipts, quarterly distributions) — all consistent with evo_02 code.
- **SMTP:** `notify-alex.ts` exists (waitlist notifications) — a mechanism precedent for E4 email; Resend is the spec'd target.
