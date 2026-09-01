# Horse Page Model — Planning Notes (NOT YET EXECUTING)

**Status:** note-taking from founder walkthroughs. Execution begins only on founder go.
**Date:** 2026-08-30 · Branch context: design-alignment · Supersedes nothing in pass2-content-sweep.md (companion doc).

## Vocabulary (locked by founder)

- **LEFT** = two-thirds column — horse info. Scrolls normally.
- **RIGHT** = remaining one-third — investment/financial terms. `sticky top-28` → stays on screen at all times.
- Prod grid: `lg:grid-cols-[1.6fr,1fr]` = 61.5/38.5. Founder's mental model = true thirds (66.7/33.3 = `2fr,1fr`). **OPEN Q: match prod ratio or switch to exact thirds at build time?**
- Mobile: single column, RIGHT stacks under LEFT (prod behaviour; revisit later).
- Founder speaks in terms of the horse side vs investment side.

## LEFT column — founder notes (2026-08-30)

### 1. Cover image / media deck
- Cover image with **arrow navigation left & right** overlaying the photo to page through the deck both ways.
- **Horses never spill out of the container.** Contain discipline everywhere (current fix: `bg-contain bg-center bg-no-repeat`).
- Deck contents: stills + (if the horse has one) video. Existing wiring: `HORSE_STILLS` (01 = cover), `trackworkVideo` in `getHorseCdnUrls`.

### 2. Spec strip (directly under cover)
- 4-up strip, prod layout: **Sex** (Filly) · **Colour** (—) · **Sire** (Almanzor (FR)) · **Dam** (Night Danza (NZ)).
- Data already in inventory columns (gender/colour/sire/dam) + `thoroughbred-attributes` component exists.

### 3. Secondary images / thumbnails
- Thumb row under the spec strip.
- **More thumbs than room → carousel**, same mechanics as the landing page "AS FEATURED IN" strip (primitive exists: `components/ui/LogoCarousel.tsx` — reuse pattern, adapted for image thumbs).
- **Click thumb → pops up large view** like "View Investment Terms" pops from the right (modal pattern exists: CtaLeadModal). Lightbox contents + controls OPEN (see Qs).

### 4. Video behaviour (in the main cover viewport)
- When the user pages/scrolls to a video slide in the main section, **playback starts after a 1-second delay**.
- (Implied: video is one of the deck slides, navigable with the same arrows.)
- **Founder answered (2026-08-30): video in the carousel is indicated by a 'play' logo/button in the MIDDLE of its thumbnail** — same indicator style/position on every video thumb.
- Defaults parked unless founder says otherwise: autoplay must be muted (browser policy, non-negotiable); loop + pause-when-paged-away = adopt sensible defaults, flag at build review.

## Story section (founder notes 2026-08-30, second pass)

- **Format:** eyebrow `THE STORY` + `Become An Owner` chip → **`Meet {LegalName} aka {Nickname}`** (omit/blank aka when no nickname) → a solid paragraph weaving horse + trainer (sourced from MC work).
- **Content model confirmed in build:** MC pipeline (`createCampaignFromIntake`) already writes one content set into inventory jsonb at FOUR depths, consumed by both surfaces:
  - `marketing.marketplace_hook` — 1-liner → marketplace card
  - `marketing.highlight_tags` (3–4 chips) → marketplace card key highlights (founder intent ✓)
  - `marketing.highlights` (5 × "Title: body") → horse page campaign highlights block
  - `soft_legal.about_horse` + `trainer_bio` → Story paragraph
  - **Rule: same underlying content, different depths — never rewrite per surface.**
- **Authoring convention to add (MC):** `aboutHorse` must NOT embed the barn name inline (e.g. TML text currently says "(barn name Mulan)…") because the Story header renders `Meet X aka Y` from `barn_name` — inline mention would duplicate. One-time content cleanup for tml's row at build.
- **Tabs under story (prod-parity):** OVERVIEW | PEDIGREE | TRAINER | RACE RECORD | DOCUMENTS. Founder flagged: pedigree/trainer/race-record content drifts too much from prod — contents to be reconciled before build (open).
- Current evo_02 horse page renders "Campaign & Bloodstock Highlights" (5 items) — good content; founder wants 3–4 TAG bullets on the **marketplace** page (already authored as `highlight_tags`) and full highlights on the horse page.

## Content depth chain — ONE origin, THREE presentation levels (founder model, 2026-08-30)

Founder mental model: every sentence of MC-authored content belongs to ONE of
three levels. A sentence authored once; never rewritten per surface.

```
ORIGIN (MC-authored, lives in inventory jsonb)
├─ LEVEL 1 — MARKETPLACE GRID CARD  (/marketplace)
│    name + hook (1-liner) + 3–4 highlight_tags chips + cutout image
│    field: marketing.marketplace_hook, marketing.highlight_tags
├─ LEVEL 2 — HORSE PAGE "THE STORY"  (/marketplace/[slug] LEFT top)
│    "Meet {Legal} aka {Nick}" + about_horse paragraph (horse+trainer woven)
│    fields: soft_legal.about_horse, soft_legal.trainer_bio (woven)
└─ LEVEL 3 — HORSE PAGE "OVERVIEW" TAB  (LEFT, under story)
     the full depth: highlights (5 × Title: body), racing_outlook_and_pedigree,
     campaign specifics — the "everything, organised" layer
     fields: marketing.highlights, soft_legal.racingOutlookAndPedigree
```

Coverage audited against live MC rows (2026-08-30, local DB):

| slug | hook | tags | highlights | about | bio | outlook |
|---|---|---|---|---|---|---|
| nellie | 97 | 4 | 5 | 671 | 296 | 429 |
| tml-x-yearn | 90 | 4 | 5 | 767 | 281 | 530 |
| first-gear | 106 | 4 | 5 | 300 | 240 | 169 |
| hottathanafantasy | 76 | 4 | 0 | 344 | 216 | 325 |
| i-stole-a-manolo | 83 | 4 | 0 | 241 | 99 | 101 |
| prudentia | 84 | 4 | 0 | 404 | 222 | 395 |

**Gaps found in the audit:**
- 3 horses have ZERO `highlights` (hotta, manolo, prudentia) → their LEVEL 3 tab
  would be empty. MC authoring task at build: write 3–5 highlights per horse.
- `racing_outlook` thin for first-gear (169) + manolo (101) — fine for
  completed/coming-soons, revisit if they ever headline a page.
- All 6 have hook + 4 tags + about → LEVELS 1–2 fully covered today.

**Presentation boundary (LOCKED by founder, 2026-08-30):**
> **L1 invites the click · L2 sells the story · L3 carries the substance.**

- All content originates from ONE place (MC-authored, inventory jsonb); the three levels are stages of the same source.
- Levels **complement, never conflict or duplicate** — a sentence appears at exactly one level.
- Founder note: *the logic will evolve as we go* (what is shown at each level may shift) — but the single-origin + staged-depth + complement-not-conflict understanding is locked and is the frame every future content decision hangs on.

## BASE TEMPLATE (founder, 2026-08-30): prod /marketplace/[slug] — follow, don't invent

**Founder direction: "using this more as a base of what to follow then the new build for now."**
Reference screenshots (prod, TML + First Gear) recorded; evo_02's existing /horses/[slug] page is NOT the model — the prod page is.

### What the prod page establishes (screenshot-verified)

**Story header area:**
- Eyebrow `THE STORY` + status chip inline (Become An Owner = green for listed · Fully Subscribed = gold for fully subscribed) — chip is status-driven.
- Prod header `Turn Me Loose x Yearn (unnamed).` — superseded by founder's newer format: `Meet {Legal} aka {Nick}` (blank aka if none).
- 3-paragraph story in prod (hooks/pedigree/breeding+registration) — L2 about-paragraph feeds this.

**Pedigree tab (rich, all inside LEFT ⅔):**
- Sub-tabs: **PEDIGREE MATRIX | DAM LINE | SIRE LINE**
- **Linebreeding banner**: "Linebreeding detected: N repeated ancestors in 4 generations. Hover over names to highlight matching lines."
- 4-gen tree: Subject → Parents → Grandparents → Great-grandparents; SIRE/DAM chips + [country] + year badges; subject card glows.
- Footer strip: Sex · Colour · Age · Foaled + **FULL BREEDING RECORD ↗**
- Data source (confirmed earlier): evo_01 `pedigrees.json` 4-gen verified (sire_line/dam_line/cross_line) + prod `pedigree-tree.ts` builder + `getLinebreedingDuplicates` — port pattern + data.

**Race record tab:**
- Heading left + `BREEDING RECORD ↗` `FULL NZTR RECORD ↗` right-aligned; computed summary (`None Wins · None Places`); status-aware empty copy. (As noted in previous section.)

**Documents tab:**
- `Legal Disclosures & Documents` + copy + **investor-gating**: guests get blurred cards + "Restricted: Investors Only" overlay. Verified-investors see live download links. FOUNDER-ANSWERED: gating = yes, prod pattern (at least for documents).

**Right rail (status-aware):**
- listed → green `● BECOME AN OWNER` pill + white `VIEW INVESTMENT TERMS` pill in a dark rounded card.
- fully_subscribed → gold `Fully Subscribed` badge + "All shares have been acquired" card + `I'm keen to hear about …` CTA.
- Rule: rail content is campaign-status driven, not one static block.

**Founder's overrides vs prod (new-build deltas, keep):**
1. Story header format: `Meet {Legal} aka {Nick}` (not prod's `Name (unnamed).`).
2. Media deck: cover + arrows + spec strip + thumb carousel w/ play badge (not prod's static 1–2 image row).
3. Ratio decision still open: prod ≈61.5/38.5 vs true thirds.

## Tab contents — OVERVIEW | PEDIGREE | TRAINER | RACE RECORD | DOCUMENTS (founder pass 3, 2026-08-30)

All tabs render inside LEFT (⅔). L3 boundary applies: overview = the substance layer.

### OVERVIEW
- Longer text-based storytelling version of the earlier parts — i.e. the locked L3 layer:
  highlights (5 × Title: body) + racing_outlook_and_pedigree. No new content type.
- **Gap from audit:** 3 horses have zero highlights authored (hotta/manolo/prudentia) — MC authoring task before this tab is full for them.

### PEDIGREE
- **Data source confirmed (two tiers):**
  - evo_02 today: `inventory.pedigree_data` jsonb — flat 3-gen (sire, dam, dam_sire, colour, gender, breeder, microchip, life_number, foaling_date, stud_book_url). Present for all 6; no lineage_summary authored (0 chars across the board).
  - **The rich asset lives in evo_01: `src/data/pedigrees.json`** — verified 4-GENERATION pedigrees for all 6 horses from loveracing.nz (sire_line[]/dam_line[] with partners, cross_line, family_number, brands, DNA/PV flags, verification dates, source URLs). This is the migration payload for the evo_02 pedigree tab (into inventory jsonb / MC at build).
- **Layout rule (founder):** stays inside the LEFT ⅔ block. IF too big at build → fallback = popup in the "View Investment Terms" style. Default plan: inline; escape hatch reserved.
- **Open:** prod blurs the pedigree tree for guests ("Register to view pedigree" overlay). Does evo_02 keep guest-gating or render public? Founder decision.
- Sire/dam/dam-sire names already normalized in evo_02 rows; the 4-gen tree builder exists on prod (pedigree-tree.ts) — pattern to port.

### RACE RECORD
- **Data source confirmed:** prod `src/data/horses.json` `race_log` holds the real scraped data — first-gear 2 starts, prudentia 6 starts, other 4 horses empty. Per-start fields: date, venue, race, track_condition, result, margin, distance_m, race_class, jockey, prizemoney_nzd, starting_price. This is the migration payload (evo_02 has NO race_log storage yet — add inventory jsonb field at build).
- **Unraced/empty state: founder approved prod's exact pattern, keep as-is:**
  - Summary line (computed from race_log — never hardcoded): "None Wins · None Places" when empty/no wins.
  - Actions: `Breeding Record ↗` (loveracing breeding URL) + `Full NZTR Record ↗` (loveracing profile URL) — loveracing_id already in pedigrees.json for all 6.
  - Status-aware copy (prod DetailTabs): completed → "No recent starts recorded in our timeline. View the Full NZTR Record for complete race history." · fully_subscribed → "…may be in early campaign or pre-race preparation." · else → "No recent starts recorded. Horse is currently in pre-training preparation."
- Summary math plan: wins = result '1st'; places = 2nd/3rd; computed at render from race_log (first-gear would read "1 Win · 0 Places" once migrated — honest numbers, no commercial fiction).

### DOCUMENTS
- Keep as-is: PDS + SA cards from inventory fields (evo_02 already renders these — prod parity confirmed). No change scoped.

### TRAINER
- Not yet discussed in founder detail; existing data: trainer registry (name/stable/location/base/philosophy) + soft_legal.trainer_bio + trainer portrait CDN. Placeholder until founder weighs in.

### TRAINER (founder pass 4, 2026-08-30)
- **Phase 1 (basic is OK):** MC/registry content only — name, stable, location/base, philosophy, trainer_bio, contact. Matches prod's basic "Trainer Profile" block exactly. No build extras.
- **Phase 1.5 (founder, NOW — locked 2026-08-30): website + socials icon row** in the trainer block.
  - Icons: same set as landing footer (X, Instagram, LinkedIn, Mail patterns in footer.tsx) + a website/globe glyph.
  - Render rule: only icons whose link exists; stable website always (all 4 stables have one).
  - Data: trainers.json already carries `website, facebook_url, instagram_url, x_url` for all 4 stables (fields exist; TODAY only Logan Racing has fb+ig+x filled, Byerley has an x_url that is WRONG — points at Logan's X handle. Stephen Gray + Wexford socials empty). → MC data-hygiene task: fill/correct socials per stable; Byerley's x_url fix is a real bug to log.
  - Single stable → icon links straight out; if a horse's stable has multiple principals (Wexford = Lance + Andrew), links remain stable-level, not person-level.
- **Phase 2 (founder, later):** stable logo + images (logo, trainers themselves). Data paths already exist:
  - Stable logos: evo_01 stable frontmatter carries `image_path` (e.g. `/images/partners/wexford-stables.png`)
  - Trainer portraits: evo_02 `TRAINER_PORTRAITS` in @evo/storage/cdn already maps barbara-kennedy / stephen-gray / wexford
  - Stable knowledge files: evo_01 `01_evolution/stables/{slug}/profile.md` — 4 stables (wexford, stephen-gray-racing, byerley-park, logan-racing), rich bodies (champions, history, website) + full frontmatter (trainers[], horses[], founded_by)
- **Scrolling news row (founder idea, feasibility confirmed):** trainer tab gets a "In the News / Stable Updates" horizontal scroll row — same pattern as the landing PressShowcase — filtered to stories about that trainer's stable/horses. Data: `press.json` (12 articles, 8 are stable/trainer-adjacent incl. the Prudentia campaign stories). Filter = article↔stable/horse relationship; scales when MC inherits news authoring later.
- **Phase 3 ("LIVE" — logged as job-for-later, keep shipping): recent social posts row** — most recent ~5 posts from the stable's social accounts, auto-pulled. Requires platform APIs/robots review + token management + fallback handling; NOT part of the Pass 2 / v1 surface. Locked as future "live content" interactivity work alongside the press row.
- **Phase 1.5 content shape (founder-confirmed):** a couple of paragraphs (philosophy/bio), an image or two later (Phase 2), a couple of headlines with linked articles (press row), website + social icons. That's the whole block — nothing bigger.
- Phase boundary: Phase 1 renders from MC registry; Phase 2 adds media + news row — display-layer additions, no logic changes.

## Reuse map (build inventory — nothing to create from scratch)

| Founder asks | Existing primitive / wiring |
|---|---|
| Cover arrows on photo | (new overlay UI; deck = HORSE_STILLS + video) |
| Spec strip | inventory columns + thoroughbred-attributes |
| Thumb overflow carousel | LogoCarousel mechanics (AS FEATURED IN) |
| Video-thumb play badge | new small overlay (centered play icon on video thumbs) |
| Thumb click popup | CtaLeadModal overlay pattern |
| Video slide 1s-delay autoplay | `trackworkVideo` already resolves; playback logic is new |

## Open questions (founder to answer whenever — no rush)

1. **Ratio:** prod 61.5/38.5 or true thirds 67/33?
2. **Lightbox:** on thumb click — arrows inside the popup too? Esc/click-outside to close (standard)?
3. **Video slide:** muted autoplay assumed (browser rules require it)? loop? pause when scrolled/paged away?
4. Does the **1s delay** restart every time you page back onto the video slide, or only first arrival?
5. Thumbnail count guidance — how many before carousel kicks in (e.g. >4)?

## RIGHT column — placeholder

- Not yet discussed in this doc's terms (existing: pricing card, cap-table card, data-room links, CTA(s); prod rail = Become an Owner + View Investment Terms; founder sketch says "add a bit more to this"). Deep-dive pending after LEFT model is settled.

## Already fixed on this page during Pass 2 (for context)

- Hero overflow → `bg-contain` (horse never leaves container) — SHIPPED on current build 2026-08-30.
- Marketplace card images → prod cutouts (no baked backgrounds) — SHIPPED.
- Trainer line → `stable` (Wexford Stables) — SHIPPED.
- Prudentia duplicate-nickname — SHIPPED (seed + live DB + hardened formatter).