# E3 — Right Rail: The Journey of Ownership (deep-dive v2 — decisions locked)

**Status:** DEEP-DIVE (planning) — founder decisions locked 2026-08-31
**North star:** "What is our selling point vs the others" → determines what we add, when, and what we highlight.
**Voice SSOT:** `evo_00/doc/VOICE_AND_TONE_MANUAL.md` (Private Banker Standard) + `evo_00/doc/ABOUT_AND_AUDIENCE.md` — **E3 is built ON these, not alongside them.**

---

## 0. Founder decisions (LOCKED 2026-08-31)

| # | Question | Decision |
|---|----------|----------|
| 1 | Term sheet rendering | **Internal-first.** The term sheet is the DNA of each listing (Tokinvest-era core), NOT meant to be directly shared with a user. It forms the TLDR of the investment. **Open item: figure out the best way to use it and when** (see §4). |
| 2 | FAQ vs drop-downs | **Drop-downs, not FAQ.** The terms sheet content appears in parts as extra drop-downs. Extra info available if an investor wants more; the initial surface stays clean and minimal. |
| 3 | Acceptance gate | **End of purchase workflow, scroll-through + checkbox.** Investor sees horse → likes it → decides to invest in X% → sees cost → once locked: **PDS pops up, user scrolls through it, checks the box** → **same for the Syndicate Agreement** → checkout. |
| 4 | PDS content | **Fold into aboutHorse/trainerBio** — PDS §2.1 gets it free. No legal_engine changes. |
| 5 | Pillars | **Refined** (see §2) — transparency framing, secondary market via Evolution on request, Flight Club rule. |

---

## 1. The north star — what defines Evolution (founder articulation)

| Dimension | Te Akau / Kingmakers / Inspire / InToWin | **Evolution Stables** |
|---|---|---|
| Price | Large buy-in, ongoing costs per season | **Fixed price, fixed duration, fixed return — it doesn't change** |
| Payment | Could be paying for many seasons | **Pay a bit up front — that funds the last months** |
| Return | Variable, opaque | **Exact return based on gross stakes won — you know before the race** |
| Risk | Keep paying while the horse races | **Injured and can't race → you stop paying** |
| Certainty | No secondary market, open-ended | **Fixed term, known end, known cost** |
| Transfer | No secondary market | **Secondary market later; initially ownership transfers via Evolution on request** |

**The onion (3-layer content logic, founder):**
- **L1 marketplace:** "IT COSTS YOU THIS MUCH" — the price signal, the hook.
- **L2/L3 horse page:** selling the **journey of ownership**, NOT betting anyone on price.
- **Right rail:** the journey made concrete — the deal, what's included, what if, your return, exit.

**The Flight Club rule (founder):** we are **selling ownership without selling it**. Positioning: modern, digital, transparent, simple, seamless communication to your phone. The pillars are the underlying north star story told in the checkout — **told in a Fight Club manner**: quiet, implied, never shouted. The Private Banker Standard: professional but not stuffy, confident but not arrogant. **If a sentence is trying to convince the reader we are legitimate — delete it.**

---

## 2. Pillars for the investor purchase workflow (refined)

1. **Transparency** — you know exactly how much, how long, and what you get back if your horse wins. Published stakes (NZTR), pro-rata 75% gross, quarterly distributions.
2. **Certainty** — exact price, exact duration, exact return mechanics. One price, nothing more. "Can the owner ask for more money? Nope."
3. **Downside protection** — injured → you stop paying. Welfare first, financially too.
4. **Stewardship** — investor updates, welfare-first decisions, "ready when she is ready."
5. **Access + transfer** — secondary market later; initially ownership transfers via Evolution on request.

**Voice constraint (from VOICE_AND_TONE_MANUAL):** vocabulary whitelist — `Settlement`/`Distribution`/`Prize money` (NOT Payout/Reward/Yield/Dividend/ROI); `Lease contribution`/`Deposit` (NOT Top-up); `Units`/`Stakes`/`Co-owners` (NOT Pieces/Parts). Zero exclamation marks. British English. 4MAT narrative (WHY→WHAT→HOW→WHAT IF). CTA matrix: `[ Become an Owner ]`, `[ Acquire Units ]`.

**Off-limits (from ABOUT_AND_AUDIENCE):** no over-promising returns, no ROI multipliers, no implied guaranteed profit, no invented trainer quotes (drafts must carry `[DRAFT — verify with trainer]` until confirmed), no bookmaker slang.

---

## 3. What the right rail becomes

Journey-framed terms surface, sectioned, **drop-down pattern** (extra info available on demand, initial surface minimal):

| Section | Surface (always visible) | Drop-down (extra info, from the term sheet DNA) |
|---|---|---|
| **The Deal** | Fixed price · fixed duration · fixed return | "Can the owner ask for more money?" → Nope. One price, fixed. What the upfront covers (the last months). |
| **What's Included** | Everything covered, nothing changes | Float, keep, insurance, vet — the full list. No line-item surprises. |
| **What If** | Injured → you stop paying | Spell/injury mechanics, update cadence, welfare-first decisions. |
| **Your Return** | 75% gross stakes, pro-rata, quarterly | "What do you mean by 75% gross stakes?" → Pro-rata on your share, stakes published on NZTR, you know exactly what you get before the race based on where she places. |
| **Exit & Transfer** | Fixed term end · transfer via Evolution on request | Close mechanics, secondary market later. |

**Drop-down content source:** the term sheet (internal DNA) — rendered in parts, investor-facing, voice-compliant. The initial surface stays clean; the depth is one click away.

---

## 4. Term sheet: internal DNA, used deliberately

**Founder direction:** the term sheet is initially more for us — the core DNA of each listing (Tokinvest era), the TLDR of the investment. **Not meant to be directly shared with a user.**

**Open item — figure out the best way to use it and when.** Working model:
- **Internal (MC):** the full term sheet is the canonical record — created at DSL creation, before PDS/SA (term sheet → PDS → SA order).
- **Investor-facing:** the term sheet's *content* appears in the right-rail drop-downs (§3), re-voiced in the Private Banker Standard — never as a raw document dump.
- **When:** the drop-downs are always available on the horse page; the scroll-through acceptance (§5) surfaces the PDS/SA at the decision moment.

**Question for founder (deferred):** does the investor-facing rendering need a downloadable "investment summary" (term-sheet-derived, voice-compliant), or are the drop-downs sufficient? (Recommend: drop-downs now, downloadable summary later if investors ask.)

---

## 5. Acceptance gate (locked flow)

At the end of the purchase workflow:

```
Investor sees horse → likes it → decides to invest in X% → sees cost
→ once locked: PDS pops up → user scrolls through it → checks the box
→ Syndicate Agreement pops up → user scrolls through it → checks the box
→ checkout (Stripe)
```

**Record:** who accepted, when, and the doc hashes (pds_hash/sa_hash already flow through checkout metadata — extend to the acceptance record in events/holdings).

**Voice note:** the acceptance surface is where the pillars are told in a Fight Club manner — quiet, implied, never shouted. The scroll-through IS the moment of trust.

---

## 6. Voice grounding — YES, this is built on who Evolution is

Confirmed SSOTs (read 2026-08-31):
- `evo_00/doc/VOICE_AND_TONE_MANUAL.md` — Private Banker Standard, Silent Gavel, vocabulary whitelist/blacklist, 4MAT, CTA matrix.
- `evo_00/doc/ABOUT_AND_AUDIENCE.md` — audience mindsets, topic/narrative pillars, POV, off-limits.
- `evo_00/doc/IDENTITY.md` — institutional identity (cadence: "Grounded in Heritage. Evolved Through Tradition. Evolution Stables. Own the Experience.")

**Every E3 surface (right rail, drop-downs, acceptance gate) is written to these.** The content drafts already carry `[DRAFT — verify with trainer]` labels per the off-limits rule (no invented trainer quotes).

---

## 7. Open questions (deferred, non-blocking)

1. **Downloadable investment summary** — needed now, or drop-downs sufficient? (Recommend: drop-downs now.)
2. **Pillars validation** — are the 5 refined pillars right? Anything missing?
3. **Acceptance record location** — events table vs holdings extension? (Recommend: events, with pds_hash/sa_hash.)

---

## 8. Out of scope (this pass)

- Full checkout redesign (acceptance gate only).
- Secondary market build (transfer via Evolution on request is the interim).
- Legal_engine PDS section changes (fold-into-aboutHorse approach).
