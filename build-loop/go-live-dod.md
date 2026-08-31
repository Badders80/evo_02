# Go-Live DoD — Skeleton (start selling)

**Status:** PLANNING — founder-directed 2026-08-31. Short-term goal: **go live and start selling.**
**North star:** a potential investor can land, understand the offering, and complete a purchase — with the money path actually open.
**This doc is the skeleton.** Each sprint builds chunks against it. Status updated as sprints land.

---

## The 6 layers

### L1 — Content (what the investor sees)

| Item | Status | Sprint |
|---|---|---|
| Marketplace (L1 cards) | ✅ founder-approved | done |
| Horse page L2/L3 (story, overview) | ✅ chunks 1-7 | done |
| Race summary computed (never hardcoded) | ✅ chunk-2 | done |
| Full trainer bios | ✅ chunk-4 | done |
| What's-next + investor update link + count | ✅ chunk-6 | done |
| Content applied to 3 horses (folder-gate passed) | ✅ | done |
| E1 — full marketplace card clickable | 🔄 in flight | Sprint 1 |
| E2 — MediaDeck carousel wired | 🔄 in flight | Sprint 1 |
| E3 — right-rail terms (pre-purchase story) | ⏳ | Sprint 2 |
| E4 — post-purchase (welcome, success state) | ⏳ | Sprint 3 |

### L2 — Commercial (the money path)

| Item | Status | Notes |
|---|---|---|
| Pricing logic | ✅ locked | legal_engine: list = wholesale × 1.05 × 1.03; keep = list × stake%; float = 5× keep; GST incl. |
| Return split (75/25, pro-rata, NZTR gross) | ✅ locked | DSL_MANUAL + PDS §5; Fixed-Cost Shield; anti-spec 2-month rule |
| PDS/SA generation | ✅ built | legal_engine compileLegalPack |
| Checkout API (auth → KYC → reserve → Stripe) | ✅ built | create-session route |
| Webhook (holding insert, vault upload, idempotent) | ✅ built | stripe webhook route |
| Acceptance gate (PDS/SA scroll-through + checkbox) | ⏳ | E3 — Sprint 2 |
| **PURCHASES_ENABLED=true + real Stripe keys** | ⛔ founder-gated | evo_00 law: live money = founder approval |
| **Real PDS/SA per horse (not placeholders)** | ⛔ founder/legal-gated | evo_01 law: money open gated on real docs |

### L3 — Identity & legal

| Item | Status |
|---|---|
| KYC (Stripe Identity) | ✅ built |
| NZTR Authorised Syndicator | ✅ live |
| FMA Equine Exemption | ✅ live |
| Real PDS/SA docs per horse | ⛔ the gate |

### L4 — Operations

| Item | Status | Sprint |
|---|---|---|
| Investor-updates loop (content → page) | ✅ chunks 5-6 | done |
| Welcome email (SMTP, automated) | ⏳ | E4 — Sprint 3 |
| Investor added to bcc_lists/{slug}.json on purchase | ⏳ | E4 — Sprint 3 (closes the loop) |
| MyStable success state (checkout=success) | ⏳ | E4 — Sprint 3 |
| Distribution mechanics (quarterly) | ⏳ | separate pipeline — 04_comms is build debt |

### L5 — Infrastructure & cutover

| Item | Status | Gate |
|---|---|---|
| Supabase prod (Evolution-3.0) | ✅ live | — |
| Branch push (purge-then-push) | ⛔ blocked | dead sb_secret in old commits — purge first |
| Merge design-alignment → main | ⛔ | founder gate |
| Vercel cutover (evo_02 → prod) | ⛔ | founder-only |
| Prod Google OAuth client (153078526638-*) | ⛔ | founder Console step: add /api/auth/google/callback |
| Archive evo_01 website | ⛔ | after cutover |

### L6 — Verification (DoD gates)

- [ ] `just check` green (lint + typecheck + test)
- [ ] `hermes verify --json --skip-start` ok:true
- [ ] kimi-code-audit PASS on the full diff (chunks 1-7 + E1/E2)
- [ ] Browser walk: full purchase path — marketplace → horse page → terms (E3) → accept (E3) → checkout → MyStable success (E4)
- [ ] Test purchase with real Stripe test keys (founder-gated)
- [ ] No dollar leads in story/hook/nextUp ($$$$ rule, Silent Gavel)

---

## Critical path to selling

```
1. E1 + E2 (Sprint 1 — in flight)          → page looks complete
2. E3 (Sprint 2 — terms + acceptance)      → investor can say "yes I want to buy"
3. E4 (Sprint 3 — welcome + success)       → investor feels bought-in
4. Real PDS/SA per horse                   → founder/legal (the money gate)
5. Cutover: purge-then-push → merge → Vercel → prod OAuth client → PURCHASES_ENABLED=true
6. End-to-end test purchase                 → founder walks it
```

**E3 dependency (founder):** E3 rides on the right information being in the MC → meaningful story → "yes I want to buy." Pricing/return are LOCKED (L2 table) — E3's right-third content builds directly from the SSOT, no re-litigating.

---

## Build debt (rolled in)

- **04_comms Gmail-draft pipeline = legacy.** SMTP is the path for automated emails (welcome must fire without a human). Retire 04_comms incrementally; the investor-update pipeline moves to SMTP. Do NOT build new features on 04_comms.
- evo_01 website = archived after cutover.
- Tokinvest legacy = zero in fresh code (locked).

---

## Sprint map

| Sprint | Scope | Depends on | Status |
|---|---|---|---|
| Sprint 1 | E1 + E2 (quick wins) | nothing | 🔄 in flight |
| Sprint 2 | E3 (right-rail terms + acceptance gate + term-sheet order in MC) | pricing locked ✅, MC fields ✅, content ✅, deep-dive ✅ | ⏳ |
| Sprint 3 | E4 (welcome email SMTP + BCC join + MyStable success + vault surfacing) | E3 checkout tail | ⏳ |
| Sprint 4 | Cutover (purge-then-push, merge, Vercel, OAuth client, PURCHASES_ENABLED) | E3 + E4 + real PDS/SA | ⛔ founder |
