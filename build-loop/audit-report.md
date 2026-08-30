# Horse-Page Audit Report — chunk-6/9/10 + wiring (Stage 5)

**Date:** 2026-08-30 · **Auditors:** orchestrator deterministic verification + `kimi-k2.7-code:cloud` (30 findings)
**Scope:** `git diff d1da6e7` — horse components, marketplace/[slug] page, stable-links, db_models types
**Commits audited:** `31db159` (chunks 6+9+wiring) → `4a1f68b` (walk repairs) → `5ee878c` (audit fixes)

## Verdict: **PASS** — 0 FAILs, 6 WARNs (4 deferred-polish, 1 data-gap, 1 founder-call), all shipped claims verified

## Claim table

| # | Claim | Result | Evidence |
|---|---|---|---|
| F1 | 4-gen pedigree data in DB, all 6 horses | PASS | psql: sire_line/dam_line lengths 8–16 across 6 rows |
| F2 | race_log real data (FG=2, PR=6) | PASS | psql jsonb_array_length |
| F3 | Race summary computed, never hardcoded | PASS | "First Gear (NZ): 1 Win · 1 Place" in DOM (race-tab.tsx:131) |
| F4 | LEFT/RIGHT true thirds | PASS | computed cols 629px/315px = 66.7/33.3 (after comma-class fix) |
| F5 | 4-gen tree + chips + [country] year | PASS | screenshot 10 (vision-verified) |
| F6 | Linebreeding banner data-driven | PASS | TML: Danehill×2 → banner (shot 13); other 5: hidden |
| F7 | Hover highlights matching lines | PASS | fresh-launch hover run: 2/2 Danehill cards accented |
| F8 | Documents guest blur | PASS | 3 blurred regions + Restricted overlay |
| F9 | Status-driven rail, no state leakage | PASS | Nellie listed CTAs + real terms overlay; Prudentia gold card, no Become-Owner |
| F10 | CUT rule: old page intact | PASS | 2-line diff only; 308 redirect works |
| F11 | loverracing_id key | PASS | fixed 4a1f68b; kimi's re-flag was a **false positive** (line 82 correct; browser-proven) |
| F12 | just check 10/10 | PASS | 3 consecutive green runs |
| F13 | Production build | PASS | all routes build |
| F14 | Branch local-only (no push) | PASS | no upstream; origin ref absent |
| F15 | Race summary "unused" eslint mystery | PASS | root-caused: `}}` comment swallowed the `<p>` — fixed; eslint silent |
| F16 | CTA label/action pairing | PASS | kimi CRITICAL 1 — fixed 5ee878c; terms overlay shows SSOT pricing |
| F17 | Tab ARIA | PASS | kimi CRITICAL 2 — fixed 5ee878c (role=tab everywhere, tabpanel wired) |
| F18 | No commercial fiction | PASS | all terms figures from computeDslPricing |

## WARNs (deferred, founder-visible)

| # | Item | Why deferred |
|---|---|---|
| W1 | Pedigree glow uses `shadow-[…rgba(212,169,100,…)]` | Tailwind v4 can't var()-reference inside box-shadow color; needs a semantic token decision |
| W2 | Age = year-only subtraction | Southern-hemisphere foaling windows can read 1 high; display-only |
| W3 | Documents "Download" click target small | card-level anchor deferred |
| W4 | Native `<img>` vs next/image | perf polish, not a bug |
| W6 | Video 1s-delay live-verified? | code verified (media-deck.tsx:78–97) but **no horse ships a trackwork video yet** — data gap, not code gap |

**Rejected finding:** kimi #8 ("None Wins · None Places" grammar) — founder-locked prod copy (page-model-notes.md:151).

## Audit-of-the-auditor note

Kimi's CRITICAL #3 (loveracingId ternary "returns the wrong key") was a **false positive** — it misread the branch. This is exactly why every finding was verified against code + browser before applying. Its other two CRITICALs (CTA pairing, ARIA roles) were real and are fixed.

## Notable real bugs found & fixed during the gate (self-audit)

1. `lg:grid-cols-[2fr,1fr]` — comma is not a CSS column separator; Tailwind emitted invalid `grid-template-columns: 2fr,1fr`. → `[2fr_1fr]` (4a1f68b)
2. `loveracing_id` double-r key mismatch — NZTR link never rendered. → reads both keys (4a1f68b)
3. JSX comment `}}` swallowed the race summary paragraph — the original eslint warnings were *correct*, and an earlier commit message falsely claimed the fix. Fixed properly in 4a1f68b.

## Walk evidence

- Nellie 13/13, part-2 (Prudentia/FirstGear/lightbox/deck/tabs) 10/10, terms overlay verified.
- Screenshots `build-loop/horse-page/screenshots/01–14` (committed).

**Structured graph:** `build-loop/audit-graph.json` (24 findings, 27 evidence edges).

**Merge/commit remains founder-gated. Branch stays local-only.**