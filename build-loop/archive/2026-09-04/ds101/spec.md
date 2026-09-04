# DS101 — architecture spec (Chunk 2)

**Date:** 2026-09-03
**Cycle:** `build-loop/ds101/` chunk-2. Architecture only.
**This file is:** the standup contract for Digital-Syndication 101 — coverage map, five-beat conversation, source gates, doors, leg-out, chat note.
**This file is not:** a UI, a Brand Advisor brief, investor copy, a 101 article, Stitch, or React. Chunk-4 copy starts only after GATE 1 lock.

**Inputs:** `ds101/source-truth.md` (chunk-1 register) · `ds101/plan.md` §2 locks · `evo_02/CONTINUE.md` DS101 block · `purchase-content-spec.md` BACKLOG NOTE (cross-link only; not the 101).

---

## Locked contour (do not re-derive)

- **Conversation over the rail, not FAQ.** The rail (S14) is a test surface. The 101 is a conversation whose order is the investor's mind, not five pillars and not a document map.
- **Lead with ugly questions.** Injury, deposit back, X% of what, can I leave. Ugly first; soothe never.
- **Five beats:** what you own → what you pay → when it goes wrong → when it goes right → how you leave.
- **Same doc, many doors.** One standup document. Checkout, marketplace, term-sheet "learn more", `/learn/returns` redirect, later chat — all point at this same doc. Doors are not forks of the truth.
- **Silent Gavel.** State. Do not soothe. No exclamation marks. Fresh hole each time (especially chat). State this campaign's figures. Do not soothe with "we don't set the prices / we just post them on behalf of owners."

**Form reminder:** this spec describes a **standalone standup document**. CONTINUE's left-sidebar drawer, accordion, and chat window are later *doors* onto this document, not the deliverable of chunk-2.

**Spine (CONTINUE, still):** Horse Comes First. Uncomfortable money questions may *point* at trainer welfare discretion (PASS 1.4–1.5). They must not invent money-causality the pack does not state (source-truth §3).

---

## ALEX LOCK 2026-09-03 (marketplace)

Evolution Stables is a **two-way marketplace** for horse ownership.

Prize, duration, and return are **dynamic** and chosen by the listing owner (vendor). They are **not** Evolution tariffs.

Do **not** over-stimulate listing owners with information at this stage. No vendor how-to. No listing-owner education beat.

Do **not** angle DS101 as "sorry, we don't set the prices, we just post them on behalf of owners." That is defensive. Silent Gavel: **state the campaign's figures.**

**Investor-facing (verbatim):** This campaign's prize share is X% of official gross stakes, then pro-rata to your stake.

X comes from that horse's pack (First Gear 80, Nellie-class 75). Never "Evolution pays 75%." Never a hardcoded platform default.

**Architecture consequence:** Beat 1 duration / Beat 4 prize and return speak only of *this campaign's* pack. GATE 1 stays open. No 101 article. No Brand Advisor.

---

## ALEX LOCK 2026-09-03 (horse first)

Evolution is a two-way marketplace. Horse first means: the deposit / lock-in exists so investors cannot casually walk, because the horse still needs care no matter how many names signed up.

Listing owners would stop supporting the platform if lots of people signed up then walked. That is founder lock, not an investor beat. Do not over-explain listing-owner mechanics to investors.

**Investor-facing frame (Silent Gavel, not a pitch deck):** These are animals that need care, attention, and security, just like people, like friends. The lock-in exists so horse care comes first at the end of the day.

**Forbidden:** Selling the deposit as conversion friction for Evolution. "You have to pay the owner so they have $$$$ in their bank" as a selling point. Over-explaining listing-owner mechanics to investors. Softening into "sorry we need your money".

**Architecture consequence:** Beat 2 deposit / lock-in and Beat 5 walk-away may *point* at this frame. They must not close GATE 1 (last-months float, injury/keep-stops, walk-away/Case E). They must not invent injury→keep money-causality (3.5 still forbidden). No 101 article. No Brand Advisor.

## GATE 1 — still open (do not close in this spec)

Founder has not picked a source. Chunk-2 maps the hole; it does not fill it. Until lock, 101 architecture routes these to **"ask us"** (manual-assistance). Do not write the CONTINUE example chain as if it were pack-backed.

| Open item | source-truth | Why it stays open |
|---|---|---|
| Last-months float | 2.6, 5.3; CONTINUE chain "carries to final months" | SOP Case C / last **3** deposit months vs compiled PDS §4 unused refund at maturity vs rail "last **5** months" |
| Injury / keep-stops | 3.1, 3.2, 3.5 | Rail and CONTINUE example are ahead of the pack. Keep stops on close cases, not on injury as such. Closest PASS is PDS §6 retirement / head-lease end |
| Walk-away / Case E | 5.4; 3.4 split | SOP Case E (4-month float burn, zero refund) is not in compiled PDS/SA. "Can I leave?" has no single pack sentence |

---

## Acceptance test (from plan / CONTINUE)

An investor reads this document in about 10 minutes and understands: what they own, how money flows, what happens when it goes wrong, what happens when it goes right, how they leave — without being soothed, and without claims the pack does not support.

Whitelist (chunk-2 gate): **stake** not Units/Shares/Tokens; zero exclamation marks; British English; never invent; only reframe PASS rows; every § in this spec is in `source-truth.md`.

---

## Authority for every entry

| Layer | Use in 101 |
|---|---|
| Compiled pack S1+S2 (`getCompiledLegalPackForCampaign`) | Primary. Hash the investor accepts. |
| Term sheet S3 | Per-horse numbers. Investor-facing 101 states this campaign's pack figures (ALEX LOCK marketplace). |
| pack_lib S7 | Numbered counsel template. Chunk-2 may *slot* pack_lib-only PASS rows (1.9, 2.7, 3.6, 3.7, 5.5, 5.8, 5.9) as "ask us if hashed pack is silent", or wait for founder to put pack_lib in scope. Do not mix pack_lib numbered §§ into the hashed pack. |
| SOP / DSL S8–S9 | Internal constitution. If SOP says it and S1/S2 do not → UNSUPPORTED → "ask us". |
| Rail S14 | Never authors the 101. |
| `purchase-content-spec.md` | Cross-link only. |

**Ship rule:** only PASS rows become entries. Every UNSUPPORTED row is an "ask us" slot or is omitted. Causality is not inferred.

**COP:** original NZTR COP text is missing (blocker). Live pack cites **COP 22.1** (S2 cl.12). Do not cite **COP 18.4**. Formation: "formed under the NZTR COP" without clause 3.1 (6.4 UNSUPPORTED).

---

## Coverage map — five beats

Order is fixed. Groups are the beats. Two levels only in any later door: beat → entry. Format per entry is architecture (heading | statement | question), not drafted copy.

Ugly questions sit at the **front of the beat**, not in an FAQ appendix.

### Beat 1 — What you own

**Ugly lead:** What do I actually buy? Do I own the horse?

| Slot | Format | Chain job | source-truth | § |
|---|---|---|---|---|
| Leasehold stake, not freehold | statement | Open: you buy a leasehold stake for a fixed term | 1.1 PASS | PDS §1; SA cl.1 + Schedule 1 |
| Percentage of the syndicated leasehold | statement | Size is a % of *this* syndicate. **Duration/term is vendor-chosen** for that listing, not an Evolution tariff | 1.2 PASS | PDS §1–§2 |
| Promoter / manager | heading | Evolution Stables Ltd, NZTR authorised syndicator | 1.3 PASS | PDS §1; SA cl.1 |
| Who decides the horse | question | Trainer / Racing Manager has sole say on training, nominations, spelling, vet | 1.4 PASS | SA Clause 6 |
| Can I force a run | question | Investors cannot overrule welfare | 1.5 PASS | SA Clause 6 |
| Minimum and step | statement | Quote *that horse's* listing (defaults 1.0% / 0.5% are not universal) | 1.7 PASS | PDS §1 |
| Recreational + capital at risk | statement | You may lose the amount paid | 1.9 PASS | pack_lib KIS / PDS §12; SA Schedule 1 |
| Voting / governance over the horse | question → ask us | No compiled-SA sentence | 1.6 UNSUPPORTED | — |
| What "spelling" means | question → ask us | Word used, not defined | 1.8 UNSUPPORTED | SA cl.6 names spelling only |

**Do not:** universalise 1% or a platform term length. Duration is a listing-owner field. Do not ship "no voting rights" as pack fact. Do not brief listing owners here.

**Next-seed:** once they know it is a leasehold stake they pay for, Beat 2.

### Beat 2 — What you pay

**Ugly lead:** What is the upfront for? What am I on the hook for every month?

| Slot | Format | Chain job | source-truth | § |
|---|---|---|---|---|
| Subscription float (default) | statement | Join 5×M, then M per month. Do not universalise: `upfront` style exists | 2.1 PASS | PDS §4 |
| 5×M split | statement | 3 months security deposit + 2 months prepaid keep | 2.2 PASS | PDS §4; term sheet §3 |
| Deposit / lock-in (horse first) | statement | Exists so investors cannot casually walk; the horse still needs care no matter how many names signed up. Investor-facing: animals that need care, attention, and security, just like people, like friends. The lock-in exists so horse care comes first at the end of the day. Not conversion friction. Not owner-bank. GATE 1 walk-away stays open | ALEX LOCK horse first | founder lock, not a pack § |
| Recurring from month 2 | statement | Prepaid covers the start | 2.3 PASS | PDS §4 |
| What sits inside M | heading | 5% Evolution margin + 3% processing buffer; no extra invoices for those | 2.4 PASS | PDS §3; SA cl.11 |
| What M is for (care / management) | statement | Reframe pack_lib §3 only; hashed PDS §3 is thinner | 2.7 PASS (pack_lib) | pack_lib PDS §3 / SA §7 |
| Fixed-Cost Shield | heading | No capital calls for trainer/jockey/noms because the owner buffer absorbs prize-money deductions | 2.8 PASS | PDS §5 |
| Unpaid keep | question | 14-day notice; after 30 days manager may draw prepaid then deposit | 2.10 PASS | SA Clause 8 |
| Does the float pay the last months | question → ask us | GATE 1 open | 2.6 UNSUPPORTED | — |
| GST-inclusive quotes | statement → ask us | Not in compiled PDS | 2.5 UNSUPPORTED | — |
| Extraordinary extra bills | question → ask us | pack_lib vs SOP collide; S1 silent | 2.9 UNSUPPORTED | — |
| Forfeit + repossess on default | statement → ask us | Not in SA text as that pair | 2.11 UNSUPPORTED | — |

**Do not:** ship rail "upfront covers the last 5 months". Do not merge SOP 4→3 burn + prize freeze into SA Clause 8. Do not say the float exists *so that* injury is covered (fabricated causality). Do not sell the deposit as conversion friction for Evolution. Do not say "you have to pay the owner so they have $$$$ in their bank". Do not soften into "sorry we need your money". Do not over-explain listing-owner mechanics to investors.

**Next-seed:** they have paid; what if the animal is hurt. Beat 3. Do not answer that seed here.

### Beat 3 — When it goes wrong

**Ugly lead:** If the horse is injured, do I still pay? Do I get my deposit back?

Lead ugly. Then state only what the pack states. Do not hand-hold.

| Slot | Format | Chain job | source-truth | § |
|---|---|---|---|---|
| Injury — do I still pay | question → ask us | GATE 1 open. No PDS/SA sentence that injury stops keep | 3.1 UNSUPPORTED | — |
| Bills stop if it cannot race | question → ask us | Closest PASS is retirement / head-lease end (Beat 5), not "cannot race" | 3.2 UNSUPPORTED | — |
| Death of the horse | question → ask us | S1 silent; no mortality insurance is a different slot | 3.3 UNSUPPORTED | — |
| Deposit back | question → ask us | Split 3.4. No single yes/no | 3.4 split | see Beat 5 |
| You still pay because Horse Comes First | statement — **forbidden** | Welfare PASS and keep-while-injured are not one sentence | 3.5 UNSUPPORTED as money-causality | SA cl.6 is 1.4 only |
| You could lose the amount paid | statement | Ugly, pack_lib-backed | 3.6 PASS | pack_lib KIS / PDS §12 |
| No mortality / loss-of-use insurance | statement | pack_lib only; rail "insurance all-inclusive" is false | 3.7 PASS (pack_lib) | pack_lib PDS §8 |
| Prize freeze on default | statement → ask us | SOP only | 3.8 UNSUPPORTED | — |

**PASS that may be restated here without closing GATE 1:** trainer sole say (1.4) as *who decides care*, not as *why billing continues*.

**Do not:** write the CONTINUE example "care continues — commitment is to the animal — the float exists exactly for this".

**Next-seed:** if it goes right, what is X% of. Beat 4.

### Beat 4 — When it goes right

**Ugly lead:** X% of *what*. Not X% of the horse. Not X% of net.

ALEX LOCK marketplace sentences above are the contract for this beat. Repeat the investor-facing line in any later copy. Silent Gavel: state X. Do not explain who failed to set a tariff.

**Investor-facing (verbatim):** This campaign's prize share is X% of official gross stakes, then pro-rata to your stake.

X from that horse's pack (First Gear 80, Nellie-class 75). Mechanism PASS 4.1–4.3: official NZTR/LoveRacing **GROSS** stakes → investor pool at this campaign's X% → pro-rata to your syndicate stake.

| Slot | Format | Chain job | source-truth | § |
|---|---|---|---|---|
| This campaign's prize share | statement | Verbatim lock sentence. X from the pack (First Gear 80, Nellie-class 75) | ALEX LOCK; 4.1, 4.3 PASS | that horse's PDS / term sheet |
| Mechanism | statement | GROSS official NZTR/LoveRacing stakes → investor pool at *this campaign's* X% → pro-rata to your syndicate stake | 4.1, 4.3 PASS | PDS §5 |
| Owner/lessor remainder | heading | Remaining share (100 − X; 25 on a 75 campaign) absorbs NZTR source deductions, trainer/jockey %, noms, acceptances, race-day incidentals. Not an Evolution tariff | 4.2 PASS | PDS §5 table |
| Evolution pays / Evolution's cut of prizes | statement — **forbidden** | Never "Evolution pays 75%". Never a hardcoded platform default. Evolution-retains-0% is UNSUPPORTED as PDS text | lock; 4.4 UNSUPPORTED | — |
| "We just post on behalf of owners" | statement — **forbidden** | Defensive. Do not use. State X | ALEX LOCK | — |
| Listing-owner how-to (prize / duration / return) | — **forbidden** | Do not over-stimulate listing owners | ALEX LOCK | — |
| When paid | question | Quarterly; last-month uncleared stakes carry forward | 4.5, 4.6 PASS | PDS §5 |
| 2-month paid-up rule | statement | Active paid-up two full consecutive calendar months before the race date | 4.7 PASS | PDS §5 |
| No guarantee | statement | Variable; no promise of starts, wins, or recovering the outlay | 4.8 PASS | pack_lib KIS; learn/returns |
| Tax / RWT | question → ask us | S1 has no tax section | 4.9 UNSUPPORTED | — |
| Marketing "75% net" | — | Contradicts PDS. 101 follows gross | 4.10 UNSUPPORTED (do not reframe as true) | — |

**Do not:** "75% of my share of the horse". Do not author a third Evolution prize bucket. Do not freeze 75 as the product. Do not soothe with posting-on-behalf.

**Next-seed:** how this ends. Beat 5.

### Beat 5 — How you leave

**Ugly lead:** Can I walk away. Do I get the deposit back.

| Slot | Format | Chain job | source-truth | § |
|---|---|---|---|---|
| Default close (14-day) | statement | 14-day notice when the head lease ends or the horse is retired; unused float refunded within 14 business days | 5.1 PASS | PDS §6 Case B |
| 3× buyout style | statement | Some horses; per-horse `close_style`. Not the default | 5.2 PASS | PDS §6 |
| Voluntary walk-away / Case E | question → ask us | GATE 1 open | 5.4 UNSUPPORTED | — |
| Natural term: deposit burns last 3 months | statement → ask us | Conflicts PDS §4 maturity refund | 5.3 UNSUPPORTED | — |
| Transfer | question | Manager consent / NZTR; pack_lib PDS §16 / SA §10. Hashed pack has no transfer clause | 5.5 PASS (pack_lib) | pack_lib only |
| Transfer fees / secondary market | statement → ask us | Fee % TBD; SOP 8% both sides is not 101 | 5.6 UNSUPPORTED | — |
| Removing the manager | heading | 75% special resolution or NZTR Board; cite **COP 22.1** not 18.4 | 5.7 PASS | SA Clause 12 |
| Disputes | statement | Manager first, then NZTR (pack_lib email; S2 says NZTR mediation) | 5.8 PASS (pack_lib) | pack_lib SA §12 |
| Complaints | statement | pack_lib PDS §18 (not in S1) | 5.9 PASS (pack_lib) | pack_lib PDS §18 |

**Do not:** present 3× as default. Do not present Case E as pack. Do not present Case C burn as pack. Do not sell walk-away lock-in as Evolution conversion friction. Do not brief listing-owner bank or platform-support mechanics as the investor reason to stay.

---

## Intended conversation (architecture of the chain, not copy)

1. What do I own → leasehold stake, term, trainer decides the horse (Beat 1).
2. What is the upfront → 3+2 float, then M from month 2 (Beat 2). *Stop. Do not add "it pays the last months".*
3. Injured — do I still pay → **ask us** until GATE 1 (Beat 3). Trainer still decides care (1.4) as a separate sentence.
4. X% of what → ALEX LOCK marketplace + mechanism (Beat 4). State this campaign's figures.
5. When do I get paid → quarterly, carry-forward, 2-month rule (Beat 4).
6. How do I leave / deposit back → 14-day on retirement or head-lease end (PASS); walk-away and last-months float → **ask us** (Beat 5).

This replaces the CONTINUE *example* chain wherever that example asserted last-months span, injury-stops-keep, or float-exists-for-injury.

---

## Same doc, many doors (trigger recommendation)

One document. Doors do not get a different truth.

| Door | Role | When |
|---|---|---|
| Standup 101 itself | The document this spec describes | Now (architecture); copy after GATE 1 + chunk-4 |
| Term-sheet "learn more" | Candidate trigger from CONTINUE / plan. Lands with main-flow wireframing. Cross-link in `purchase-content-spec.md` BACKLOG NOTE only | Later door |
| Marketplace / horse page | Reference, not a rewrite of the rail | Later door |
| `/learn/returns` | Pre-restructure "Your Return"; becomes a redirect to this doc | After the doc lives |
| Checkout | May point here; not a step of the 6-step purchase flow | Linked track |
| Chat window | Rides the same layer | After drawer/doc corpus |

Build order (CONTINUE): document/drawer corpus first; chat second. DS101 is not a step in the 6-step purchase flow.

---

## Leg-out fixture (verbatim; footer of the doc and of chat)

This overview is a general guide. Each stake is governed by the PDS and Syndicate Agreement issued for that horse — please read them before investing.

Place once, at the end. Light § on entries (PDS §4, SA Clause 12, COP 22.1) — never a citation library.

---

## Chat-window grounding note (same project, later front-end)

- Grounding corpus = this 101 document + compiled legal pack (`getCompiledLegalPackForCampaign`).
- Scope = that horse's pack only.
- Every answer §-pointed. Pack silent → "I can only speak to the PDS/SA" → manual-assistance. Never improvises.
- Declares itself every response: it summarises the documents; the documents govern.
- Silent Gavel in full: generated per request = fresh hole each time.
- Prize / duration / return: ALEX LOCK marketplace. Chat states this campaign's figures. Must not say Evolution pays 75%. Must not say "we just post on behalf of owners." Must not brief listing owners.
- Deposit / lock-in: ALEX LOCK horse first. Frame is animal care, Silent Gavel, not a pitch deck. Must not sell conversion friction. Must not say pay the owner so they have money in the bank. Must not over-explain listing-owner mechanics. Must not soften into "sorry we need your money."
- GATE 1 holes: chat says ask us. It does not pick SOP vs PDS.

---

## Voice and terminology

- Investor-facing word is **stake**, plus a percentage. Not Units, Shares, Tokens. pack_lib "digital shares" / "Shareholder" stay in the template; 101 does not.
- British English. Zero exclamation marks. Private Banker Standard. Silent Gavel. Never lead with dollars.
- "ask us" = manual-assistance path, never invented law.

---

## Out of scope (rejects)

No React · no Stitch · no chat infra · no `/learn/returns` rewrite · no Brand Advisor · no 101 article / chunk-4 copy · no listing-owner education / over-stimulation · no selling the deposit as conversion friction · no owner-bank selling point · no new legal or commercial claims · no resolving GATE 1 · no PURCHASES_ENABLED change · no mission_control / prod surfaces.

---

## Chunk-2 gate

- spec.md exists (this file).
- Five-beat headings present and in order.
- ALEX LOCK 2026-09-03 (marketplace) present: two-way marketplace; prize / duration / return vendor-chosen; investor-facing X% sentence; Silent Gavel (state figures, no posting-on-behalf).
- ALEX LOCK 2026-09-03 (horse first) present: deposit / lock-in so investors cannot casually walk because the horse still needs care; investor-facing animal-care frame; forbidden conversion-friction / owner-$$$$ / listing-owner education / sorry-we-need-money.
- No lock contradicted; GATE 1 items remain open (last-months float, injury/keep-stops, walk-away/Case E).
- No 101 article. No Brand Advisor.
- Leg-out fixture byte-exact.
- Every § traces to `source-truth.md`.
- Whitelist clean.
- Article not drafted.
