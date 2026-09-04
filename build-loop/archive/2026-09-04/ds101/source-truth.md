# DS101 source-truth — Digital-Syndication 101 (Chunk 1)

**Date:** 2026-09-03  
**Cycle:** `build-loop/ds101/` chunk-1 only. No spec, no investor copy, no Brand Advisor, no maps, no Stitch.  
**Form reminder (not drafted here):** standalone standup document — investor 101. Checkout / marketplace / chat reference it later. Same document, many doors.

**Locked contour (CONTINUE.md 2026-09-01 + founder 2026-09-03; architecture only):**
- Conversation over the rail, not FAQ
- Lead with ugly questions (injury, deposit back, 75% of what)
- Five beats: what you own → what you pay → when it goes wrong → when it goes right → how you leave
- Same doc, many doors
- Silent Gavel: state, don't soothe

**Verification rule:** every chain claim is PASS or UNSUPPORTED with §. Never invent. Unsupported → drawer copy must say "ask us". Causality is not inferred. Where sources disagree, both are quoted and the claim is **not PASS**.

---

## 0. Sources opened

| ID | Path | Role |
|---|---|---|
| S1 | `/home/evo/porch/new/evo_02/packages/legal_engine/src/pds.ts` | Live compiled PDS (hashed pack investors accept) |
| S2 | `/home/evo/porch/new/evo_02/packages/legal_engine/src/sa.ts` | Live compiled SA |
| S3 | `/home/evo/porch/new/evo_02/packages/legal_engine/src/term_sheet.ts` | Compiled term sheet |
| S4 | `/home/evo/porch/new/evo_02/packages/legal_engine/src/settlement.ts` | Settlement engine (Cases B/D/E maths) |
| S5 | `/home/evo/porch/new/evo_02/packages/legal_engine/src/pricing.ts` | `joinFloat = 5 × M` |
| S6 | `/home/evo/porch/new/evo_02/apps/web/src/lib/horses-data.ts` `getCompiledLegalPackForCampaign` | Confirms pack = `@evo/legal_engine` compile, not pack_lib |
| S7 | `/home/evo/porch/new/evo_01/01_evolution/mission-control/admin/generators/pack_lib.py` | DOCX/markdown PDS+SA templates (numbered PDS §§1–21 / SA 1–18) |
| S8 | `/home/evo/porch/new/evo_00/doc/DSL_MANUAL.md` | Locked commercial SSOT (cited by legal_engine headers) |
| S9 | `/home/evo/porch/new/evo_00/doc/OPERATIONS_SOP.md` | Ops SSOT: float ledger + Cases A–F |
| S10 | `/home/evo/porch/new/evo_00/migration_bridge/04_LEGAL_DIFF_AUDIT.md` | PDS/SA section map vs COP 22.1 |
| S11 | `/home/evo/porch/new/evo_01/migration/EVOLUTION_OPERATIONS_MANUAL.md` | Mirrors S9 on close cases / COP 22.1 |
| S12 | `/home/evo/porch/new/evo_01/02_website/src/data/hlts.json` | Per-horse `investor_return_pct` (one listing is 80, not 75) |
| S13 | `/home/evo/porch/new/evo_01/02_website/src/app/learn/returns/page.tsx` | Pre-restructure "Your Return" explainer |
| S14 | `/home/evo/porch/new/evo_02/apps/web/src/components/horse/right-rail.tsx` `E3_PILLARS` | Rail copy to test, **not** a legal source |
| S15 | `/home/evo/porch/new/evo_02/build-loop/purchase-content-spec.md` BACKLOG NOTE | Flow cross-link only (not the 101) |
| S16 | `/home/evo/porch/new/evo_02/CONTINUE.md` DS101 block | Locks + example chain + leg-out fixture |
| — | NZTR Bloodstock Syndication Code of Practice **full text** | **MISSING** (see Blockers) |

**Authority for investor-facing 101:** executed pack = S1+S2 (legal_engine). pack_lib (S7) is the numbered counsel template; it is not what `getCompiledLegalPackForCampaign` hashes. SOP/DSL_MANUAL are internal constitution. If SOP says it and the compiled PDS/SA do not, the claim is UNSUPPORTED for 101 copy.

**COP clause numbers in-repo:** citations only (3.1, 18.4, 22.1). Original COP PDF/HTML was not under `evo_00/doc`, `evo_02/packages/legal_engine`, or a `*COP*` filename in `evo_00`.

---

## 1. Source collisions (do not paper over)

| Topic | Compiled PDS/SA (S1–S2) | pack_lib DOCX (S7) | SOP / DSL (S8–S9) |
|---|---|---|---|
| PDS shape | §§1–6 (float, 75/25, close style) | §§1–21 (tax, insurance, transfer, complaints…) | Maps to legal_engine §§ |
| 75% of what | **Gross** official NZTR/LoveRacing stakes | "{ret}% of **gross** revenue attributable to the syndicate stake" (PDS §4) | 75% of official **gross** stakes |
| Manager removal | SA Clause 12: **COP Rule 22.1**; 75% member vote **or** NZTR Board | DOCX SA §13: **COP Clause 18.4** 75% vote only. Markdown SA §13: **COP 22.1** NZTR Board only | SOP §8.3: COP **22.1**; 75% vote **or** NZTR Board |
| Deposit at natural end | PDS §4: unused prepaid keep **and** security deposit **refunded** on termination **or maturity** | Silent on applying deposit to last months; unused fees/deposit refunded on early close | SOP §4.4 / Case C: billing **stops 3 months prior**; 3-month deposit **burns** to $0 |
| Injury → keep stops | PDS §6: close when **retired** or **head lease concludes** (14-day Case B). No "injury" word | Injury is a **risk** (KIS / PDS §12). Early close if **retired**. No "injury stops keep" | Case A: **retired / NZTR deregistered**; billing ceases on Racing Manager's official date. Not generic injury |
| Investor walk-away | Not described | Transfer with Manager consent (SA §10). No walk-away refund table | Case E: 4-month float burn, **zero refund** |
| Extraordinary costs | Silent. PDS §5 "Fixed-Cost Shield" (prize-money capital calls) | PDS §5: extraordinary costs (interstate campaign, major vet) "**disclosed before they apply**" | SOP §1.3: **never** a cash call / surprise invoice |
| Insurance | Silent | PDS §8: **no** mortality / loss-of-use insurance | Silent in SOP prize/float chapters |
| Return % | Hardcoded **75 / 25** | `investor_return_pct` default 75, horse field can differ | 75 / 25 default |

---

## 2. Claims register

Status key: **PASS** = may be reframed in 101 with the cited §. **UNSUPPORTED** = 101 must "ask us" (or stay silent). Claims that only live in SOP are UNSUPPORTED for the executed pack.

### Beat 1 — What you own

| # | Claim (plain) | Status | § / source | Notes |
|---|---|---|---|---|
| 1.1 | You buy a **leasehold stake**, not freehold of the horse | PASS | S1 PDS §1; S2 SA cl.1 + Schedule 1; S7 PDS §12 / SA §18; S9 §2.1 | "fractional leasehold stakes" / "leasehold interest only" |
| 1.2 | The stake is a **percentage of the syndicated leasehold**, for a **fixed term** | PASS | S1 PDS §1–§2; S7 KIS Structure; S8 §2 | Term dates are per horse, not a universal month count |
| 1.3 | Evolution Stables Ltd is promoter/manager, NZTR authorised syndicator | PASS | S1 PDS §1; S2 SA cl.1; S7 PDS §14 / Manager; S9 §1.1 | NZBN 9429050177875 in pack_lib only, not legal_engine PDS |
| 1.4 | Trainer / Racing Manager has **sole** say on training, nominations, spelling, vet | PASS | S2 SA Clause 6; S8 §5.1; S9 §6.1 | Spine for "Horse Comes First". pack_lib SA §6 is softer ("in consultation") — live pack is S2 |
| 1.5 | Investors cannot force the horse to race or overrule welfare | PASS | S2 SA Clause 6; S10 SA cl.6 | |
| 1.6 | Investors have **no governance/voting rights** over the horse | UNSUPPORTED | pack_lib DOCX SA §11 only | Absent from compiled SA (S2). Do not ship |
| 1.7 | Minimum stake and step are campaign fields (defaults 1.0% / 0.5%) | PASS | S1 PDS §1; S8 §6; S9 §1.3 | Quote the horse's listing, not a universal 1% |
| 1.8 | "Spelling" defined as a rest period off work | UNSUPPORTED | S2 SA cl.6 names "spelling" without definition | BACKLOG asked to cover spelling. No definition in PDS/SA/COP-in-repo → "ask us" |
| 1.9 | Participation is recreational with financial risk; you may lose the amount paid | PASS | S7 PDS §13 / KIS Returns; S2 Schedule 1 (risk of racing / leasehold only) | Compiled PDS (S1) has **no** equivalent "lose capital" paragraph — still true in pack_lib + SA ack |

### Beat 2 — What you pay

| # | Claim (plain) | Status | § / source | Notes |
|---|---|---|---|---|
| 2.1 | Default billing is **subscription float**: join **5×M**, then **M** per month | PASS | S1 PDS §4; S5; S8 §2; S9 §4.1 | `upfront` style exists (S8 §2) — 101 must not universalise 5×M |
| 2.2 | The 5×M split is **3 months security deposit + 2 months prepaid keep** | PASS | S1 PDS §4; S3 §3; S8 §2; S9 §4.1 | pack_lib: `deposit_months` default 3 + `prepaid_months` default 2 |
| 2.3 | Recurring keep is billed **from month 2** (prepaid covers the start) | PASS | S1 PDS §4 "From month 2 onwards" | SOP §4.2: 1st of month consumes prepaid, card billed M |
| 2.4 | M embeds **5% Evolution margin + 3% processing buffer**; no extra invoices for those | PASS | S1 PDS §3; S2 SA cl.11; S8 §1.1 | |
| 2.5 | Quoted M and 5×M are **GST-inclusive** | UNSUPPORTED as PDS text | S8 §1.1; S9 §10.1; S5 `gstInclusive: true` | Compiled PDS (S1) never says GST. 101 cannot assert GST from the PDS. "ask us" or wait for pack text |
| 2.6 | **Upfront float spans / pays the final months of the term** | UNSUPPORTED (as a single PDS fact) | Conflict | **SOP §4.1 / §4.4 / Case C:** 3-month *deposit* is held for wind-down; billing stops 3 months before natural end; deposit burns to $0. **S1 PDS §4:** unused deposit **refunded at maturity**. **Rail S14:** "upfront covers the **last 5 months**" — SOP is 3 months, not 5. CONTINUE example chain must **not** ship until founder picks SOP vs PDS |
| 2.7 | Monthly M covers training and care, syndicate management, NZTR compliance, routine costs (pack_lib) | PASS (pack_lib; S1 thinner) | S7 PDS §3 / SA §7; S9 §1.3 | S1 PDS §3 does not itemise vet/training. Reframe only as pack_lib §3, not rail "insurance included" |
| 2.8 | **No capital calls** for trainer/jockey/noms because 25% owner buffer absorbs them | PASS | S1 PDS §5 Fixed-Cost Shield; S8 §4.1; S9 §5.2 | This is about **prize-money deductions**, not extra vet campaigns |
| 2.9 | Extraordinary costs (major vet, interstate campaign) may be billed extra | UNSUPPORTED in live pack | pack_lib PDS §5 only; contradicted by SOP §1.3 | S1 silent. Do not ship either "never extra" or "maybe extra" as PDS |
| 2.10 | Default unpaid keep: notice after 14 days; after 30 days manager may draw **prepaid then deposit** | PASS | S2 SA Clause 8 | SOP §4.3 4→3 burn + prize freeze is **stricter/different** — do not merge into one sentence |
| 2.11 | Uncured default: 3-month deposit **forfeited**, stake repossessed | UNSUPPORTED in SA text | S4 `computeDelinquentDefaultSettlement`; S9 §4.3 / Case D | SA cl.8 stops at "draw on float". Forfeiture/repossession is SOP/engine, not compiled SA |

### Beat 3 — When it goes wrong (ugly questions)

| # | Claim (plain) | Status | § / source | Notes |
|---|---|---|---|---|
| 3.1 | **If the horse is injured, keep stops immediately** | UNSUPPORTED | Rail S14 `what_if`; CONTINUE example | No PDS/SA sentence says injury stops keep. Injury is a **risk that may end racing** (S7 PDS §12). Keep stops on **close cases**, not on injury as such |
| 3.2 | If the horse is **retired or NZTR-deregistered**, billing stops on the Racing Manager's official date; unused float **refunded** | UNSUPPORTED as compiled PDS | S9 Case A | S1 PDS §6 ties 14-day exit to "head lease concludes or the horse is **retired**" (Case B wording), not Case A refund table. Do not invent Case A into the 101 from SOP alone |
| 3.3 | If the horse **dies**, unused keep + deposit refunded to the investor (or estate) | UNSUPPORTED as compiled PDS | S9 Case F | pack_lib PDS §8: **no mortality insurance**; primary risk is **loss of the lease fee**. SOP refunds unused *float*, not horse value. S1 silent on death |
| 3.4 | **Do I get my deposit back?** — depends how the syndicate ends | Split | | See 5.x. There is **no** single PDS sentence "deposit always back" or "deposit never back" |
| 3.5 | Care continues while the horse is still in the syndicate; commitment is to the animal | UNSUPPORTED as money-causality | S2 SA cl.6 (welfare supremacy) | Welfare discretion PASS (1.4). Linking "so you still pay while injured-but-not-retired" is **inferred**. CONTINUE forbade fabricated causality. State 1.4 + 3.1 only |
| 3.6 | You could lose the full amount you paid | PASS | S7 KIS Risks / PDS §12 | S1 does not repeat this. Safe to reframe from pack_lib + SA acknowledgement; still flag S1 gap |
| 3.7 | No mortality / loss-of-use insurance on the leasehold | PASS from pack_lib only | S7 PDS §8 | S1 silent. Rail S14 "insurance … all-inclusive" is **false against pack_lib**. 101: pack_lib PASS; do not use rail |
| 3.8 | Prize freeze while in payment default | UNSUPPORTED | S9 §4.3 Stage 2 | Not in S1/S2 |

### Beat 4 — When it goes right (ugly: **75% of what**)

| # | Claim (plain) | Status | § / source | Notes |
|---|---|---|---|---|
| 4.1 | **75% of officially published NZTR / LoveRacing *gross* stakes** attributable to the syndicate, **not** 75% of the horse, **not** 75% of net after jockey/trainer | PASS | S1 PDS §5; S8 §4; S9 §5.2; S3 §4 | Default. hlts.json First Gear is **80** (S12) — 101 must say "the split in *that horse's* PDS" |
| 4.2 | The remaining **25%** is owner/lessor retention to absorb NZTR source deductions, trainer/jockey %, noms, acceptances, race-day incidentals | PASS | S1 PDS §5 table; S8 §4.1 | |
| 4.3 | That 75% investor pool is then paid **pro-rata to your stake in the syndicate** | PASS | S1 PDS §5 "Distributed pro-rata to co-owners"; S7 SA §8; S13 | learn/returns: share of syndicate, not the entire horse |
| 4.4 | Evolution retains **0%** of prize money | UNSUPPORTED as PDS text | S4 `evolutionCents = 0` | S1 table is 75/25 only. Do not add a third bucket in 101 unless pack says it |
| 4.5 | Distributions are **quarterly** | PASS | S1 PDS §5; S7 PDS §17 / SA §8; S8 §4.2; S13 | pack_lib: "at the end of each **calendar quarter**". S1: "issued quarterly" only |
| 4.6 | Stakes won in the last month of a quarter that have not cleared NZTR **carry to the next quarter** | PASS | S1 PDS §5 Carry-Forward Cut-Off; S8 §4.2; S13 | |
| 4.7 | **2-month paid-up rule:** must be active paid-up for two full consecutive calendar months before the race date | PASS | S1 PDS §5; S8 §4.3; S9 §5.4 | |
| 4.8 | Returns are variable; no guarantee of starts, wins, or recovering the outlay | PASS | S7 KIS Returns / PDS §12; S13 risks | S1 has no "no guarantee" paragraph — pack_lib + learn/returns |
| 4.9 | Evolution does not withhold investor income tax on prize money; tax is the investor's | UNSUPPORTED as compiled PDS | S9 §10.2; S7 PDS §7 (consult an adviser, no tax advice) | S1 has **no tax section**. "We don't withhold RWT" is SOP-only → "ask us" |
| 4.10 | Marketing lines that say **75% net** | UNSUPPORTED (contradicts PDS) | evo_02 `apps/web/src/app/terms/page.tsx`; evo_02 faq "75% of net prize money"; evo_02 learn/returns "75% Net Investor Pool" | Live PDS is **gross**. 101 follows S1, not those pages |

### Beat 5 — How you leave

| # | Claim (plain) | Status | § / source | Notes |
|---|---|---|---|---|
| 5.1 | Default close style is **14-day notice when the head lease ends or the horse is retired**; unused float refunded within **14 business days** | PASS | S1 PDS §6 Case B; S8 §3; S3 §4 | "An investor may exit by giving 14 calendar days written notice **when** the underlying head lease concludes or the horse is retired" — not a general anytime-exit |
| 5.2 | Some horses use **3× remaining lease value** buyout (Case B1) | PASS | S1 PDS §6 (if `closeStyle !== fourteen_day`); S8 §3; S7 PDS §15 non-fourteen-day branch | Per-horse `close_style`. Do not present 3× as the default |
| 5.3 | Natural term end: deposit pays the last 3 months, account $0, no cash refund | UNSUPPORTED vs PDS | S9 Case C / §4.4 | Conflicts S1 PDS §4 maturity refund. Do not ship |
| 5.4 | **Investor voluntary walk-away:** 4-month float burn, **zero deposit refund**, stake forfeited | UNSUPPORTED as compiled PDS | S9 Case E; S4 `computeInvestorExitSettlement` | Not in S1/S2. Ugly question "can I leave?" → "ask us" unless founder puts Case E in the pack |
| 5.5 | Transfer only with Manager consent / NZTR requirements, recorded by Manager | PASS (pack_lib; absent from S1/S2) | S7 PDS §16 / SA §10 | Hashed pack has no transfer clause. 101 may reframe pack_lib §16/§10; do not add SOP fee % |
| 5.6 | Transfer via Evolution; secondary market not ready; "standard fees apply" | UNSUPPORTED as PDS | S9 §9.2 (5%+3% **both sides**); CONTINUE / investor-flows: fee % **TBD** | SOP hardcodes 8% both sides; CONTINUE said undecided. 101: "ask us" on fee. Rail S14 "transfer via Evolution on request" is ops line, not pack |
| 5.7 | Members may remove the manager by **75% special resolution**; NZTR Board may remove for cause; cite **COP 22.1** | PASS (live pack) | S2 SA Clause 12; S8 §5.2; S9 §8.3; S10 | Do **not** cite **COP 18.4** (pack_lib DOCX only). Original COP not in repo — clause number is as used by S2, unverified against NZTR PDF |
| 5.8 | Disputes: Manager first, then NZTR syndication@nzracing.co.nz | PASS (pack_lib) | S7 SA §12; S9 §8.2 | S2 cl.12: disputes to NZTR mediation. Email is pack_lib/SOP |
| 5.9 | Complaints to alex@evolutionstables.nz then NZTR | PASS (pack_lib) | S7 PDS §18 | Not in S1 |

### Cross-cutting / fixture

| # | Claim (plain) | Status | § / source | Notes |
|---|---|---|---|---|
| 6.1 | Leg-out fixture (verbatim, CONTINUE) | PASS as locked copy | S16 | "This overview is a general guide. Each stake is governed by the PDS and Syndicate Agreement issued for that horse — please read them before investing." Not a legal claim; footer |
| 6.2 | Chat later: summarises this doc + compiled pack; pack governs | n/a | S16 | Out of chunk-1 |
| 6.3 | Investor-facing word is **stake**, not Units/Shares/Tokens | PASS as lock | CONTINUE terminology rule | pack_lib still says "digital shares" / "Shareholder" — 101 follows CONTINUE whitelist |
| 6.4 | COP formation "Clause 3.1" | UNSUPPORTED vs original COP | S7 SA §1 | Original COP missing. Can say "formed under the NZTR COP" (S2 cl.1) without 3.1 |

---

## 3. Intended CONTINUE chain — verdict

CONTINUE example (do not write copy; verdict only):

| Link | Verdict |
|---|---|
| What is the upfront for? (float — funds care up front) | **PASS** 2.1–2.2 (join is 3+2). "Funds care" is loose — PASS as "prepaid keep + deposit reserve", not as a welfare slogan |
| How does it play out over the term? (carries to final months — no mid-journey billing surprises) | **UNSUPPORTED** as one PDS sentence (2.6 conflict). SOP yes (last **3** months). PDS refunds unused at maturity. Rail's **5** months is wrong |
| If the horse is injured, do I still pay? | **UNSUPPORTED** that keep stops (3.1). **PASS** that welfare is trainer-only (1.4). Do not join them into "you pay because horse comes first" |
| 75% of my pro-rata share | **PASS** 4.1–4.3 if phrased: 75% of **gross official stakes** into the investor pool, then pro-rata to **your** stake. Not "75% of my share of the horse" |
| If the horse can't race, the bills stop | **UNSUPPORTED** (3.1–3.2). Closest PASS is PDS §6 **retirement / head-lease end**, not "can't race" |
| When do I get paid? | **PASS** 4.5–4.7 (quarterly, carry-forward, 2-month rule) |
| Deposit back? | **UNSUPPORTED** as a yes/no. PDS §4/§6 refund unused on **formal termination/maturity** and Case B. SOP Case E/D/C disagree. Ugly question stays "ask us" until one source is chosen |

---

## 4. Rail pillars vs pack (do not let the rail author the 101)

| Rail (S14) | Pack verdict |
|---|---|
| "Upfront covers the last **5** months" | UNSUPPORTED (SOP last **3** deposit months; PDS refunds) |
| "Injured → you stop paying" / "keep contributions stop immediately" | UNSUPPORTED |
| "Insurance, veterinary coverage — all-inclusive" | Insurance **contradicted** by pack_lib PDS §8. Vet-in-keep is SOP/pack_lib §3, not S1 |
| "75% gross prize money, pro-rata, quarterly" | PASS 4.1–4.5 |
| "Transfer via Evolution on request" | Ops line; transfer clause not in compiled S1/S2 |

---

## 5. Blockers (path looked)

1. **NZTR Bloodstock Syndication Code of Practice full text** — looked: `evo_00/doc/` (no COP file), `evo_00` `*COP*` (none), pack_lib and legal_engine **citations only**. Cannot verify 3.1 / 18.4 / 22.1 against NZTR. Live pack uses **22.1**.
2. **Compiled PDS has no transfer, tax, insurance, complaints, or capital-loss sections** that pack_lib still templates. Chunk-2 must not mix pack_lib numbered §§ into the 101 as if they were in the hashed pack unless founder says pack_lib is also in scope.
3. **Float-at-maturity conflict** (S1 PDS §4 refund vs SOP Case C burn) — founder call required before any "last months" sentence.
4. **Injury/keep-stop** — rail and CONTINUE example are ahead of the pack. Founder call: Case A into PDS, or 101 stays "ask us".
5. **hlts.json** has no `deposit_months` / `prepaid_months` / `payment_style` fields on the First Gear record sampled; pack_lib defaults (3+2, subscription_float) apply in the generator, not as per-horse JSON.

No other listed inputs were missing: plan.md, chunks.md, CONTINUE DS101, purchase-content-spec BACKLOG, pack_lib.py, legal_engine PDS/SA, SOP, DSL_MANUAL, learn/returns, right-rail pillars, hlts.json — all read.

---

## 6. Counts

| Status | Count | IDs |
|---|---|---|
| PASS | **29** | 1.1 1.2 1.3 1.4 1.5 1.7 1.9 2.1 2.2 2.3 2.4 2.7 2.8 2.10 3.6 3.7 4.1 4.2 4.3 4.5 4.6 4.7 4.8 5.1 5.2 5.5 5.7 5.8 5.9 |
| UNSUPPORTED | **18** | 1.6 1.8 2.5 2.6 2.9 2.11 3.1 3.2 3.3 3.5 3.8 4.4 4.9 4.10 5.3 5.4 5.6 6.4 |
| n/a (lock/fixture, not a pack claim) | 3 | 6.1 6.2 6.3 |
| Split (not counted) | 1 | 3.4 |

**PASS 29 / UNSUPPORTED 18** on numbered pack claims (1.1–6.4 excluding 3.4, 6.1–6.3). PASS includes pack_lib-only rows tagged in the table; hashed legal_engine pack is thinner.

**Ship rule for chunk-2:** only PASS rows. Every UNSUPPORTED row → "ask us". Do not resolve 2.6 / 3.1 / 5.3–5.4 in copy.

---

## 7. Chunk-1 gate

- Every intended CONTINUE chain link has PASS, UNSUPPORTED, or explicit conflict: **yes** (§3).
- No invented causality: injury→keep, float→last-5-months, deposit-always-back: **UNSUPPORTED**.
- spec.md not written.


---

## Founder-lock note — ALEX LOCK 2026-09-03 (chunk-2 addendum; not a re-audit)

**Added:** 2026-09-03 with `spec.md` chunk-2. Does not rewrite the claims register. Does not close GATE 1.

### Marketplace (ALEX LOCK 2026-09-03) — short row

| Lock | Investor-facing | Do not |
|---|---|---|
| Two-way marketplace. Prize, duration, and return are listing-owner (vendor) fields, not Evolution tariffs. X from that horse's pack (First Gear 80, Nellie-class 75). GATE 1 A/B/C stay open. | "This campaign's prize share is X% of official gross stakes, then pro-rata to your stake." Silent Gavel: state X. | Never "Evolution pays 75%." Never a hardcoded platform default. Never "sorry, we don't set the prices, we just post them on behalf of owners." Do not over-stimulate listing owners. No 101 draft. No Brand Advisor. |

**How this sits on the register:** 4.1–4.3 remain PASS for the *mechanism* (gross official stakes → investor pool → pro-rata), restated as *this campaign's X%*. 1.2 duration is per listing, not a platform tariff. 4.4 stays UNSUPPORTED. 4.10 stays UNSUPPORTED.


### Horse first (ALEX LOCK 2026-09-03) — short row

| Lock | Investor-facing | Do not |
|---|---|---|
| Two-way marketplace. Horse first: the deposit / lock-in exists so investors cannot casually walk, because the horse still needs care no matter how many names signed up. Listing owners would stop supporting the platform if lots of people signed up then walked — founder lock, not an investor beat. GATE 1 A/B/C stay open. | These are animals that need care, attention, and security, just like people, like friends. The lock-in exists so horse care comes first at the end of the day. Silent Gavel, not a pitch deck. | Never sell the deposit as conversion friction for Evolution. Never "you have to pay the owner so they have $$$$ in their bank". Never over-explain listing-owner mechanics to investors. Never soften into "sorry we need your money". No 101 draft. No Brand Advisor. |

**How this sits on the register:** 2.2 deposit split remains PASS as pack maths. Why the lock-in exists is this founder lock, not a compiled-PDS sentence. 3.5 money-causality (injury → still pay because Horse Comes First) stays UNSUPPORTED. 5.4 walk-away / Case E stays UNSUPPORTED. Do not close GATE 1.

### GATE 1 still open (unchanged)

- Last-months float (2.6, 5.3)
- Injury / keep-stops (3.1, 3.2, 3.5)
- Walk-away / Case E (5.4; 3.4 split)

Chunk-2 `spec.md` routes these to "ask us". Do not treat the CONTINUE example chain as pack-backed until founder picks a source.

### Architecture contour confirmed for spec.md

Conversation over the rail, not FAQ. Lead with ugly questions. Five beats: what you own → what you pay → when it goes wrong → when it goes right → how you leave. Same doc, many doors. Silent Gavel.

spec.md is the standup document contract. Not Brand Advisor. Not the 101 article.
