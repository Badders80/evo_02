# Horse Page Depth — DoD & Gap Analysis Plan (v2 — founder decisions locked)

**Status:** PLANNING PHASE — no execution. Founder decisions locked 2026-08-31.
**Branch:** design-alignment (local-only, founder gate pending)
**Scope:** /marketplace/[slug] horse page depth — Prudentia + First Gear as reference horses. Marketplace page (L1) is founder-approved; only the 2 known bugs (hardcoded wins/places, stale L3 copy) are in scope to fix.

---

## 0. Founder decisions (LOCKED 2026-08-31)

| # | Question | Decision |
|---|----------|----------|
| 1 | Where does "why this horse" live in MC schema? | **YES — extend MC schema.** New narrative field(s) authored at MC, routed to page. |
| 2 | Who authors it? | **Subagent logic drafts → folder-gate approval** (founder approves at launch or update). |
| 3 | First Gear's purpose? | **Track-record showcase.** Proven winner, showcase of what Evolution Stables delivers. |
| 4 | Prudentia's next target? | **Currently spelling** (knee recovery, third carpal bone), likely back end of year. Investor updates exist for her AND Coco. |
| 5 | NEW — investor-updates loop | **The loop must feed the horse page.** Updates we send out are the content engine. **Option B (pipeline automation) confirmed — build later.** Option A (manual capture) now. |
| 6 | NEW — dial-mover principle | **Not all facts move the dial.** Page leads with 2-3 dial-movers (authored), supports with the full record (derived). |
| 7 | NEW — the $$$$ rule | **Never lead with dollar figures.** Dollars invite dismissal ("that's not much"). Lead with signals: "owners turned down an attractive offer" NOT "$300k turned down". Prudentia: R65→R75 progression + strong performances > $36.5k stakes. Dollar figures may appear in the full record (derived), never as the hook. |
| 8 | NEW — hook principle | **Dial-movers bait the hook, not info-dump.** They must align with our values AND create curiosity that gets the click. A viewer should want to know more, not go "ok got it, not for me." |
| 9 | NEW — scope | **Coco (hottathanafantasy) + Prudentia in scope** — covers a coming-soon example and a racing-now example. First Gear stays as the completed-campaign showcase. |

---

## 1. TLDR — the diagnosis (revised)

The horse page is thin for **three different reasons**, and the fix is now clearer because we found the content:

| # | Gap type | What it is | Fix layer |
|---|----------|-----------|-----------|
| 1 | **Logic gap** | Data EXISTS but isn't flowing to the page | Website wiring (cheap, fast) |
| 2 | **Content gap** | Data doesn't exist in evo_02's data path — but DOES exist in the knowledge repo + investor updates | **Pipeline gap: knowledge repo + investor updates → MC → page** |
| 3 | **Stale-data gap** | Data exists but is WRONG/outdated vs reality | Data correction (MC re-author) |

**The big finding:** the content the founder wants ("why this horse", what's next, trainer voice, the dial-movers) **already exists** — in `01_evolution/horses/{slug}/` (profile.md, race-record.json, investor-updates.md) and in the investor update emails (`02_website/public/updates/`). It's just not in evo_02's data path. This is a **pipeline problem**, not a "we need to find content" problem.

---

## 2. What we actually hold (revised — knowledge repo is richer than evo_02 inventory)

### Prudentia — knowledge repo (`01_evolution/horses/prudentia/`)
- **race-record.json (VERIFIED, richer than evo_02):** 10 starts, 2 wins, 1 third, **$36,585 prizemoney**, flat rating 66, field sizes, per-start notes. E.g. 27 Jun 2026: "6th of 11 on Heavy10... Stable noted puggy/sticky ground did not suit her running style; prefers looser heavy. Rating 67 (-1)." References post-race voice notes (Andrew Scott, Kylie Bax).
- **profile.md:** identity, trainer (Wexford full bio), ownership structure (5% lease, 75% net earnings quarterly).
- **investor-updates.md:** index of 30+ updates (May–Jul 2026).
- **Campaign update 22 Jul 2026 (email):** the full "what's next" narrative — knee injury (localized bone stress, third carpal bone), spell at Bax Bloodstock, 2–3 months paddock + ~2 months pre-training, "ready when she is ready", FAQ structure (injury severity, what happens now, when she returns, where she's spelling).
- **Stable report 21 Aug 2026 (email):** still spelling, "no news is good news on the knee", spring arriving, plan for next campaign to come.

### First Gear — knowledge repo (`01_evolution/horses/first-gear/`)
- **race-record.json (VERIFIED):** 11 starts, 1 win, 2 seconds, **$24,975 prizemoney**, flat rating 57. Notes: "Turned down $300,000 offer after maiden win (NZ Herald, 31 May 2024)."
- **profile.md:** already carries the dial-mover — "In just five starts, he has recorded a win, two placings, and over $20,000 in prizemoney — including turning down a recent six-figure offer from Australian interests."
- **Herald article (31 May 2024):** the full story — $300k offer turned down, Bill Rose quote ("I want to keep him close to home"), Lisa Allpress "one of the better 2-year-olds she has ridden", family colours, dam A'Guin Ace's 6 winners from 6 foals to race, Black Ace (94 starts, 18 wins).

### What's in evo_02 inventory (the page's current data path)
- Migration 00005: aboutHorse, trainerBio, racingOutlookAndPedigree, marketplaceHook, highlightTags (all 6 horses except First Gear's highlights).
- race_log: Prudentia 6 starts (subset of the 10 in knowledge repo), First Gear 2 starts (subset of 11).
- **The knowledge repo is the richer source. evo_02's inventory is a stale, reduced copy.**

---

## 3. Competitor review (unchanged from v1 — Te Akau is the benchmark)

Te Akau: long-form narrative (~400 words), trainer/principal quote, racing plan, full cost disclosure, race-by-race track-record stories. Kingmakers: Equine Journal = purchase price vs return proof. Inspire: news section = race-by-race storytelling with trainer quotes. InToWin: what's-included cost transparency, family context.

**What competitors do that we don't:** long-form narrative, trainer/principal quote, racing plan/what's-next, cost transparency, track-record proof, family context, media depth.

**Our edge (founder directive, Aug 10):** "we are different from other syndicators — we need to lean into that." The investor-update loop IS that edge — no competitor sends 30+ updates per horse with this cadence and voice. The page should surface that.

---

## 4. The dial-mover principle (founder-locked)

Not all facts move an investor. The page must lead with what does — **and never lead with dollars** (the $$$$ rule). Dial-movers are **values-aligned signals that bait the hook**: they create curiosity that gets the click, not an info-dump that lets a viewer go "ok got it, not for me."

| Fact | Dial-mover? | Why |
|------|------------|-----|
| First Gear: $13.5k stakes | ❌ | Small number, invites "that's not much" |
| First Gear: **owners turned down an attractive offer from Australia** | ✅ | External demand signal, curiosity hook. NOT "$300k" — the number invites dismissal; the signal invites "who? why?" |
| First Gear: 11 starts, 1 win, 2 seconds | ✅ | Form proof (derived, full record) |
| First Gear: dam produced 6 winners from 6 foals | ✅ | Family proof |
| Prudentia: $36.5k stakes | ❌ | Dollar figure — never the hook |
| Prudentia: **R65 → R75 progression + strong wins/performances** | ✅ | Trajectory proof — the story, not the sum |
| Prudentia: spelling, knee recovery, "ready when she is ready" | ✅ | Honest welfare-first narrative — trust builder |
| Prudentia: 30+ investor updates sent | ✅ | Proof of stewardship — the differentiator |

**Rule (locked):** every horse page leads with its 2-3 dial-movers (authored at MC), then supports with the full record (derived from race_log). Dial-movers must align with Evolution Stables values (welfare first, stewardship, transparency) AND bait the hook.

**First Gear buyer fact-check:** the Herald article (31 May 2024) says the offer came from **"a person in Australia"** — the knowledge repo profile confirms "Australian interests." **Not Hong Kong.** Signal framing: "attractive offer from Australia" (overseas buyer = bigger signal than the number).

---

## 5. The investor-updates loop (NEW — the content engine)

**The loop that exists today:**
```
Wexford ingest (emails/voice notes) → 04_comms pipeline (classify A/B/C/D → copy → build HTML → deploy to /updates/ → Gmail draft → founder sends)
```
Output: hosted HTML at `evolutionstables.nz/updates/{slug}_email.html` + knowledge repo index (`investor-updates.md`).

**The loop we need (feed the horse page):**
```
Investor update sent → structured capture → MC campaign fields → horse page
```

**Proposed capture mechanism (design decision needed):**
- **Option A — manual/curated:** after each update, agent extracts the 2-3 dial-mover facts + what's-next into MC fields (nextUp, campaignNarrative, trainerQuote). Simple, founder-gated, no pipeline change.
- **Option B — semi-automated:** the 04_comms pipeline writes a structured `update-summary.json` per update (facts, what's-next, dial-movers) into the knowledge repo; MC reads it; page renders latest. More build, but the loop becomes self-sustaining.
- **Recommendation: A now, B later.** The page needs the content flowing this week; the pipeline automation is a separate workstream.

**What the page should render from the loop:**
- **What's next** (from latest update): "Spelling at Bax Bloodstock — knee recovery, targeting return end of year" (Prudentia). "Completed campaign — track record" (First Gear).
- **Latest update link** ("Read the latest investor update →").
- **Update count** ("30+ investor updates sent" — stewardship proof).
- **Campaign narrative** (from the July 22 update's structure: what happened, why, what's next).

---

## 6. DoD — Definition of Done (revised)

A horse page **passes** when a potential investor can answer "yes, they know this horse well enough for my money":

### D1. Race record that proves itself (logic fix — website)
- [ ] Summary computed from race_log: wins, places, **total earnings** (never hardcoded).
- [ ] Form figures rendered (derived from race_log).
- [ ] Rating trajectory visible (Maiden → R65 → R75) — derived.
- [ ] Full NZTR / Breeding Record links present.
- [ ] **Race log synced to the FULL knowledge-repo record** (Prudentia 10 starts not 6; First Gear 11 not 2).

### D2. Trainer credibility (logic fix — website)
- [ ] Trainer tab shows the FULL bio (Wexford 600+ wins / Stephen Gray 825+ wins, G1s, Japan Cup).
- [ ] Trainer website link live.
- [ ] Trainer photo (if held).

### D3. Story that sells (content fix — MC authoring, subagent-drafted, folder-gated)
- [ ] L2 story: 2-4 paragraphs — who she is, what she's done, **the dial-movers (values-aligned, no dollar leads)**, what's next.
- [ ] L3 overview: pedigree + racing outlook, **current as of last update** (no stale dates/classes).
- [ ] Trainer/principal quote present (new field).
- [ ] **What's next present** (new field) — from latest investor update, not "TBD".
- [ ] **$$$$ rule enforced:** no dollar figure leads the story or the hook. Dollars only in the derived full record.
- [ ] **Hook principle enforced:** the lead creates curiosity (a viewer wants to know more), not an info-dump ("ok got it, not for me").

### D4. The investor-updates loop (NEW)
- [ ] Latest update surfaced on the page (link + summary).
- [ ] Update count shown (stewardship proof).
- [ ] What's-next field updated from the latest update.

### D5. Data integrity (stale fix — MC re-author)
- [ ] No story field contradicts the race log or latest update.
- [ ] First Gear reads as a track-record showcase (dial-movers first: $300k offer, form, family).

### D6. Media (data gap — separate workstream)
- [ ] Hero image present (not legs-only crop for First Gear).
- [ ] Gallery renders.
- [ ] Video: known gap, no horse ships one yet.

### D7. Gates
- [ ] `turbo run test typecheck` green.
- [ ] `hermes verify` ok:true.
- [ ] Browser walk: Prudentia + First Gear — all tabs render, no empty states where data exists, no stale copy.

---

## 7. Proposed approach — split by layer

### Phase A: Website wiring (logic gaps — no new content, ~1 session)
- `apps/web/src/app/marketplace/[slug]/page.tsx` — compute wins/places/earnings from raceLog; remove hardcoded "0/0".
- Trainer tab — full bio from registry (extend `packages/db_models/src/data/trainers.ts` with knowledge-repo bios).
- **Sync race_log to full knowledge-repo records** (Prudentia 10 starts, First Gear 11 starts) — data migration, not code.
- Verify stable-links (websites) wired.

### Phase B: MC schema + authoring (content gaps — subagent-drafted, folder-gated)
New intake fields:
- `campaignNarrative` (or extend aboutHorse) — the "why this horse" long-form with dial-movers.
- `trainerQuote` — principal/trainer voice.
- `nextUp` — what's next with timeline (from latest investor update).
- `latestUpdateUrl` + `updateCount` — the loop surface.
- Re-author Prudentia + First Gear story fields to be current (stale fix).

**Authoring flow (founder decision #2):** subagent drafts from knowledge repo + investor updates → writes to a folder → founder approves at launch or update → MC fields updated.

### Phase C: Investor-updates loop (Option A now, B later)
- Manual/curated capture: after each update, extract dial-movers + what's-next into MC fields.
- Page renders: what's-next, latest update link, update count.

### Phase D: Media (separate, founder-driven)
- Full-body shots for First Gear; video remains a known gap.

---

## 8. Open questions for founder (remaining decisions)

**All §8 questions from v1 are now RESOLVED (founder answered 2026-08-31):**
1. ~~Race log SSOT~~ → **Knowledge repo is canonical, sync to inventory.**
2. ~~Investor-updates loop~~ → **Option A (manual capture) now, Option B (pipeline automation) later.**
3. ~~First Gear what's-next~~ → **Dial-mover leads ($300k story reframed as "attractive offer from Australia"), status pill says completed.**
4. ~~Coco in scope~~ → **YES — Coco + Prudentia in scope** (coming-soon + racing-now examples). First Gear stays as completed-campaign showcase.
5. ~~Folder-gate location~~ → **Knowledge repo `01_evolution/horses/{slug}/`.**

**No open questions remain. Plan is ready for implementation planning.**

---

## 9. Out of scope (this pass)

- Marketplace page (L1) redesign — founder-approved as-is.
- Right rail / pricing model changes.
- Video production.
- Per-horse JSON-LD (parked SEO item).
- **Option B pipeline automation of the investor-updates loop — confirmed LATER by founder.** Option A (manual capture) is the current mechanism.
- Nellie, TML, Manolo content depth — pattern first on Prudentia + Coco + First Gear, then roll out.

---

## 10. Verification plan (when we build)

1. Unit: race-summary computation (wins/places/earnings/form) from race_log fixtures — TDD.
2. Unit: trainer-bio resolution per slug.
3. Unit: dial-mover extraction from update summaries (if Option B).
4. Typecheck + tests: `turbo run test typecheck --force`.
5. Browser walk: Prudentia + First Gear — every tab, no empty states where data exists, no stale copy.
6. Cross-check: story fields vs race log vs latest investor update (no contradictions) — the D4/D5 guard.
7. `hermes verify --json --skip-start` ok:true.

---

## 11. Key sources found this session

- **Herald article (First Gear $300k offer):** https://www.nzherald.co.nz/hawkes-bay-today/news/first-gears-hawkes-bay-connections-turn-down-six-figure-offer/73S2DSX5VVG7BI6RKHQ6F2LGUE/
- **Prudentia campaign update 22 Jul 2026:** `02_website/public/updates/prudentia_campaign_update_22july2026_email.html`
- **Prudentia stable report 21 Aug 2026:** `02_website/public/updates/prudentia_stable_report_21august2026_email.html`
- **Knowledge repo:** `01_evolution/horses/{prudentia,first-gear}/` (profile.md, race-record.json, investor-updates.md)
- **Investor-update pipeline skill:** `04_comms/.agents/skills/investor-update-pipeline/SKILL.md`
- **Prior competitor strategy (Aug 10):** `C:\Users\Evo\.gemini\antigravity\brain\a5225cfb-6e36-4504-aef4-100332365f8c\marketplace_content_strategy.md` + `evo_01/docs/plans/009-marketplace-data-architecture.md`

---

*Artifacts: this plan + `build-loop/` (3layer-plan.md, page-model-notes.md) are the planning surface. Execution follows founder answers to §8.*
