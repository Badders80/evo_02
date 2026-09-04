# E3 Content Tree — Right-Rail + Acceptance Gate

**Status:** content reference (from live :3010, 2026-09-01 — matches founder paste)
**Purpose:** content SSOT for the E3 flow. Lock this, then move to Stitch for visuals.
**Node types:** `[header]` `[subheader]` `[body]` `[figure]` `[stepper]` `[dropdown]` `[CTA]` `[checkbox]` `[badge]` `[doc]` `[note]`

---

## SCREEN 1 — Horse page, right third

```
[header]    Lady Ketchikan (NZ)
[subheader] Become an Owner
[body]      Take a stake from 1.0%, in clean 0.5% steps, with fixed monthly syndicate keep.

[stepper]   Stake — opens at minimum (e.g. 1.0%)
            ▲ / ▼ move in 0.5% increments · manual entry allowed
            out-of-range (over max / under min) → small warning
[figure]    Monthly Keep — $152 /mo
[figure]    Join Float (5×M) — $760
[note]      Minimum investment 1.0% · Stake available 5.0% · Contact us for more info

[CTA]       Become an Owner ──────────────► SCREEN 2 (gate modal)

[dropdown]  Ownership Pillars (5, expandable)
  ├─ [dropdown] The Deal
  │    [body] Fixed price · fixed duration · fixed return.
  ├─ [dropdown] What's Included
  │    [body] Everything covered, nothing changes.
  ├─ [dropdown] What If
  │    [body] Injured → you stop paying.
  ├─ [dropdown] Your Return
  │    [body] 75% gross prize money, pro-rata, quarterly.
  └─ [dropdown] Exit & Transfer
       [body] Fixed term end · transfer via Evolution on request.
```

**FORK A — campaign status (before the rail renders):**
```
open campaign ──────────────► rail with CTA [ Become an Owner ]
Fully Subscribed / Completed ► amber pill, NO rail CTA (rail hidden or read-only)
Coming Soon                  ► green pill, NO rail CTA
```

**FORK B — stake bounds (per horse, DSL-driven — LOCKED 2026-09-01):**
```
min = campaign.min_stake_pct (NOT hardcoded — page currently hardcodes 1.0, fix queued)
step = campaign.stake_step_pct (0.5 default)
max = campaign.capTableFixture.availablePct (Nellie: 5.0%)
Nellie example: Min 1.0% · Step 0.5% · Max 5.0%
```

---

## SCREEN 2 — Gate modal (Regulatory Acknowledgment)

```
[badge]     NZTR Code
[header]    Regulatory Acknowledgment
[subheader] Lady Ketchikan (NZ) · 2.0% Stake
[note]      ✕ close (top-right) → back to SCREEN 1, stake preserved

[figure]    Monthly Keep — $152 /mo
[figure]    Join Float (5×M Deposit) — $760

[doc]       Product Disclosure Statement (PDS)
            [hash] 196f4e8a…cb9fdf
            [body] PDS content — compiled pack, per-horse (see note 1)
[checkbox]  I have read and agree to the Product Disclosure Statement (PDS)

[doc]       Syndicate Agreement (SA)
            [hash] bb8896a9…8e1b92
            [body] SA content — compiled pack, per-horse (see note 1)
[checkbox]  I acknowledge and agree to the Syndicate Agreement terms

[note]      Verification is completed under the NZTR Authorised Syndication Code.
            Handoff is cryptographically verified.

[CTA]       Proceed to Secure Checkout  (DISABLED until both checkboxes ticked)
            ──► STRIPE CHECKOUT (external)
```

**FORK C — checkout outcome:**
```
payment success ──► MyStable success state (E4 — not this sprint)
payment cancel   ──► back to horse page, stake pre-filled via ?units= (Option A, RESOLVED 2026-09-01)
```

**FORK D — documents (per horse):**
```
PDS/SA body + hashes come from the compiled legal pack (getCompiledLegalPackForCampaign)
— content differs per horse; the modal shell is identical
```

---

## Content notes (voice check, 2026-09-01)

1. **PDS/SA bodies** are the compiled legal pack — not authored here. Modal shell is fixed; doc content is per-horse.
2. **Modal header naming:** live = "Regulatory Acknowledgment"; deep-dive §5 called it "Investor Acknowledgment & Document Verification". Pick one — recommend live (shorter, NZTR-framed).
3. **"Join Float (5×M Deposit)"** — whitelist OK (Deposit ✓). Keep.
4. **CTA:** single locked CTA `[ Become an Owner ]` across campaign surfaces. The former "Acquire Stake" alternative is retired (founder-locked 2026-09-02).
5. **PDS §1 lists "Barbara Kennedy Racing" as Syndicate Manager** — matches trainer lock (Kennedy, Byerley Park) ✓.
6. **PDS Schedule 1 "Owner: B.A.X Bloodstock"** — this is the horse's registered owner (Kylie Bax), distinct from Evolution Stables as lessor. Confirm this stays in legal copy (it's the actual registered owner, not our naming).

---

## Move to Stitch (next step)

1. Lock this tree (founder edits content here — fast, no design).
2. I push it to Stitch as DESIGN.md → design system + screens generated from locked content.
3. Visual pass in Stitch: layout, spacing, gold restraint — content already fixed.
