# Review: Implementation Plan — Knowledge Entity Graph & v1 Data Registry

**Reviewer:** Agent (root)
**Date:** against live repo at `/home/evo/new/evo_02`
**Baseline verified:** `pnpm typecheck` ✅ 10/10, `pnpm test` ✅ 8/8 (both green before any change)

---

## Verdict

**Approve to proceed, with 3 must-fix items and 4 should-fix items.** The plan is well-scoped, all file paths are real, the storage decision is coherent, and the verification commands are valid and currently green. The issues below are about **enforcement gaps and data-integrity risks** that the plan does not currently cover — none are blockers to starting, but several should be folded in before merge.

---

## What the plan gets right (verified against the code)

1. **All 4 MODIFY paths exist and are correct:** `packages/brand_dna/src/voice.ts`, `packages/db_models/src/index.ts`, `packages/legal_engine/src/pds.ts`, `apps/web/src/lib/horses-data.ts`. ✅
2. **All 5 NEW paths are genuinely new** (`knowledge.types.ts`, `data/{sires,trainers,jockeys,breeders}.ts`). ✅
3. **Storage decision is coherent** and matches the earlier research recommendation: a **versioned TypeScript/JSON registry in `@evo/db_models`** as the source of truth for static reference data, with zero cloud migration debt. `db_models` is already a schema/seed-first package (Supabase client + `schema/00001/00002/00003` SQL seeds), so a TS knowledge registry sits naturally alongside it. ✅
4. **`'opaque'` is a safe addition** — `validateCopy` uses `\b${term}\b` regex, and `opaque` currently appears **nowhere** in `apps/` or `packages/` (verified), so banning it cannot regress existing copy. ✅
5. **Plan entities match live data:** the proposed sire/trainer seeds align with real campaigns — e.g. `i-stole-a-manolo` (Satono Aladdin, Wexford), `prudentia` (Proisir, Wexford), `nellie` (Almanzor, Barbara Kennedy). ✅
6. **Verification commands are valid and currently pass.** ✅

---

## 🔴 Must-fix

### M1. Enforcement gap — `'opaque'` would be added to an *inert* list
- `packages/brand_dna/src/voice.ts` defines `BANNED_TERMS` and `validateCopy`, but **nothing in the repo imports or calls them** (verified: only the definition exists; zero callers). So adding `'opaque'` there has **no enforcement effect** today.
- The list that **actually gates public-facing legal copy** is `BANNED_LEGAL_TERMS` in `packages/legal_engine/src/validator.ts` — a **separate, duplicated list** that the plan never mentions touching. It currently does **not** contain `opaque`.
- **Fix:** (a) add `'opaque'` to `BANNED_LEGAL_TERMS` in `validator.ts` too, AND/OR (b) better — **unify the two lists** (single source of truth: `brand_dna` exports the canonical list; `legal_engine` imports it) so future bans propagate. At minimum, if the plan's intent is "across all public-facing copy," the legal_engine list is the one that matters and must be updated.
- **Verify:** a test asserting a PDS containing "opaque" fails `validateLegalPack`.

### M2. Pre-existing data conflict — two different horses named "Prudentia"
The plan's whole point is a **canonical registry**, so this is exactly the class of problem it must resolve. Currently there are **two distinct Prudentia records**:
| Field | `apps/web/src/lib/horses-data.ts` (Prudentia) | `apps/mission_control/src/lib/horse-lookup.ts` (Prudentia) |
|---|---|---|
| Sire | **Proisir (AUS)** | **Preferment (NZ)** |
| Dam | Little Bit Irish (NZ) | Prudence (NZ) |
| Dam sire | O'Reilly | Handsome Ransom |
| Foaled | 2021-11-13 | 2021-11-20 |
| Life number | NZ00441209 | NZ00427416 |
| Microchip | 985125000126462 | 985125000125744 |
| Breeder | Evolution Stables Bloodstock | Goldeye Trust |
| Trainer | Wexford Stables | Barbara Kennedy |

These are **different horses sharing a name**. The knowledge registry must define **which is canonical** (or disambiguate by life number/microchip). If left unresolved, PDS / lookup / cap-table outputs will silently reference the wrong animal. This is the single highest-value catch of this review.
- **Fix:** decide canonical Prudentia, update the losing record, and add a **uniqueness test** (no two registry records share a name with differing life numbers) so it can't regress.
- **Verify:** registry lookup by name returns exactly one horse; cross-check microchip/life-number against LoveRacing.

### M3. `RACING_TAG_TAXONOMY` is defined but nothing validates against it
The plan adds the taxonomy constant and mentions "highlight tag validation," but no validation function or enforcement point is specified. Today `highlightTags` (in `horses-data.ts`) are **free-form strings**. A taxonomy with no validator is inert — same trap as M1.
- **Fix:** add `validateHighlightTags(tags)` (in `brand_dna`) + a unit test, and wire it into the web build or the mission_control tests so a non-taxonomy tag fails CI.

---

## 🟡 Should-fix

### S1. PDS section labels — cosmetic mismatch between test and source
- The plan cites "§2.1 About Horse & Trainer, §2.2 Key Details Table, §2.3 Racing Outlook & Pedigree."
- Tests (`legal_engine.test.ts` L237-239) already assert headers named `§2.2 Key Details` / `§2.3 Racing Outlook`, but `pds.ts` actually emits `### Key Details` / `### Racing Outlook & Pedigree` (no §2.x prefix) under a single `## §2. Asset Specifics`.
- **Fix:** pick one convention. If you standardise on §2.1/§2.2/§2.3, update `pds.ts` **and** the existing test; note this changes PDS output → **new SHA-256 hashes** (fine, but version-bump the PDS and update any pinned-hash fixtures).

### S2. `db_models` export surface for the new types
- `db_models/package.json` `exports` has explicit subpaths; `./types` currently points only at `database.types.ts`. New `knowledge.types.ts` won't be reachable via `@evo/db_models/types`.
- **Fix:** export knowledge types from root `index.ts` (via the `export *`), or add a `./knowledge` subpath. Be explicit so the web/mission_control imports are obvious.

### S3. Data-boundary rule — SQL seed vs TS registry
- `db_models` already has `schema/00003_seed_live_horses_and_investors.sql` (live horse/investor data) and a Supabase client, yet the plan puts the knowledge registry in TS. Without an explicit boundary, **sires/trainers can exist in two places** (a campaign trainer in SQL + a profile in the TS registry).
- **Fix:** state the rule — *live/transactional campaign data → SQL/Supabase; static reference knowledge (sire type signatures, trainer bios, jockey affinity) → TS registry* — and document the join keys (sire name, trainer slug) so one source wins for shared fields.

### S4. Affinity entities with no live consumer yet
- The plan's `jockeys.ts` lists **Bruno ↔ First Gear**, but **First Gear is not an active web campaign** (web has `nellie`, `tml-x-yearn`, `prudentia`, `i-stole-a-manolo`). It exists only in mission_control's lookup catalogue.
- Not a blocker — the registry is legitimately forward-looking — but note it so nobody expects a live page to render First Gear/Bruno immediately. (Masa ↔ Prudentia *is* wired: Prudentia is a live, Wexford-trained campaign. ✅)

---

## Suggested additions to the Verification Plan
1. **Registry unit test:** `getSire('contributer')`, `getTrainer('barbara-kennedy')`, `getJockey('masa-hashizume')`, `getBreeder('windsor-park')` return the expected records; plus the **name-uniqueness** test from M2.
2. **Brand voice test:** `brand_dna` currently has **no `test` script** in `package.json`, so `pnpm test` (turbo) silently skips it. Add a `test` script + a `validateCopy("...opaque...")` fails test.
3. **Legal gate test:** `validateLegalPack` fails on a pack containing `"opaque"` (after M1).
4. **PDS determinism:** assert a fixed soft-content input yields the **same SHA-256** across two runs (guards the registry→PDS path).

---

## Bottom line
Solid, well-grounded plan — **proceed**. But land M1 (opaque enforcement reaches the real list), M2 (single canonical Prudentia + uniqueness test), and M3 (taxonomy actually validated) before merge, or the "canonical registry" will inherit the exact integrity and enforcement gaps it is meant to eliminate.


---

# ADJUDICATION — Revised "Final" Plan (re-review)

**Verdict: Approve to proceed — with 1 critical refinement (M2) and 2 small refinements.** All 7 prior findings are correctly resolved in the revised plan, and I verified each against the live repo. The one issue that would break existing tests is the M2 write-up as literally described.

## Verified resolutions
- **M1 ✅** `validateSyndicateContent` exists (`legal_engine/src/validator.ts:147`) and is consumed by mission_control + tests. legal_engine currently imports **no** brand_dna — adding `@evo/brand_dna: workspace:*` is clean (brand_dna is a leaf package; no dependency cycle). The `"./voice"` subpath export already exists. `validateCopy` currently has zero callers, so wiring it into a seed gate is the right fix.
- **M3 ✅** `RACING_TAG_TAXONOMY` + `validateHighlightTags()` + a `test` script for brand_dna closes the "inert taxonomy" gap. brand_dna has no `test` script today — adding one makes `pnpm test` actually exercise it.
- **Registry ✅** `registry.ts` + `"./knowledge"` subpath + barrel export is clean; db_models already ships `tsx` + a `test` script.
- **PDS determinism ✅** fixed-input SHA-256 regression test is a correct guard for the registry→PDS path.

## 🔴 Critical refinement — M2 must NOT be implemented as "overwrite"
The M2 table is right (canonical campaign Prudentia = **Proisir x Little Bit Irish, life NZ00441209, microchip 985125000126462, Wexford**, LoveRacing ID **441209**). But `apps/mission_control/src/lib/horse-lookup.ts` currently holds a **genuinely different, real registered horse**: Preferment x Prudence, life **NZ00427416**, LoveRacing ID **427416**.

If you "overwrite" that record to the Proisir data, two things break:
1. **`intake.test.ts:47-52`** asserts `lookupHorse('https://loveracing.nz/Breeding/427416/Prudentia-NZ-2021.aspx')` → sire `Preferment (NZ)`, dam `Prudence (NZ)`. Overwriting flips this to Proisir → test fails (and the URL→horse mapping becomes factually wrong).
2. URL/ID-based lookup for `427416` would resolve to the wrong animal. Both Prudentias are real on LoveRacing (427416 and 441209) — they are not the same horse.

**Correct resolution (change the wording of M2):**
- **Keep both records** in `horse-lookup.ts`, keyed by distinct `loveracingId` (427416 = Preferment, 441209 = Proisir).
- Mark the **Proisir record (441209)** as the canonical **campaign** horse (`campaignSlug: 'prudentia'`, trainer Wexford), matching `horses-data.ts`.
- The **Preferment record (427416)** stays resolvable by URL/ID but must **not** carry the campaign slug (disambiguate its display name, e.g. `Prudentia (Preferment)`).
- **Update the name-uniqueness test to key on `(name, lifeNumber)`**, NOT bare name — two real horses legitimately share "Prudentia."
- **Update `intake.test.ts`:** keep the assertion that 427416 → Preferment (it is correct), and ADD an assertion that 441209 → Proisir (the campaign horse).

Without this, the very integrity the registry is meant to guarantee gets replaced by a different, silent inconsistency.

## 🟡 Small refinements
- **Unified banned list = UNION.** legal_engine's current `BANNED_LEGAL_TERMS` contains terms brand_dna lacks (`lead lessor`, `micro-ownership`, `fractional security`, `security token`, `dao`, `vara`, `dubai`). The unified list exported by brand_dna must be the **union**, or `legal_engine.test.ts:261` (`crypto token … micro-ownership`) fails.
- **Seed gate list.** `validateCopy()` checks the marketing `BANNED_TERMS`; if the seed gate is meant to also catch legal-only terms, run it against the union (or document that it gates marketing copy only). Not blocking.
- **`web build` step is viable but slower.** Web has placeholder Supabase env fallbacks and a prior `.next`, so the build should pass; but the authoritative "green floor" is `pnpm typecheck` + `pnpm test`. Keep the build as an optional final check.

## Bottom line
The revised plan is **substantially correct and merge-ready** after one edit: **rewrite M2 to keep both real Prudentias (427416/441209) distinct, key uniqueness on `(name, lifeNumber)`, and update `intake.test.ts` accordingly** — rather than overwriting. Everything else resolves cleanly.


---

# CORRECTION (M2) — domain confirmation from owner

**Confirmed by the owner: there is no horse "Preferment x Prudence."** The record at `apps/mission_control/src/lib/horse-lookup.ts` (legalName `Prudentia`, barn `Prue`, sire `Preferment (NZ)`, dam `Prudence (NZ)`, life `NZ00427416`, microchip `985125000125744`, LoveRacing ID `427416`) is **fabricated test/fixture data, not a real horse.**

This **retracts my earlier "keep both records" refinement.** With only one real Prudentia, the original M2 intent is correct: the sole canonical Prudentia is **Proisir (AUS) x Little Bit Irish (NZ), life `NZ00441209`, microchip `985125000126462`, Wexford Stables, LoveRacing ID `441209`** (the `web/horses-data.ts` record).

## Precise M2 fix (corrected)
1. **`horse-lookup.ts`** — replace the fabricated Prudentia catalogue entry with the real horse:
   - `legalName: 'Prudentia'`, `campaignSlug: 'prudentia'`
   - `foalingDate: '2021-11-13'`, `gender: 'Filly'` (or 'Mare' per web), `colour: 'Bay'`
   - `breeder: 'Evolution Stables Bloodstock'`, `microchip: '985125000126462'`, `lifeNumber: 'NZ00441209'`
   - `sire: 'Proisir (AUS)'`, `dam: 'Little Bit Irish (NZ)'`, `damSire: "O'Reilly"`
   - `loveracingId: 441209`, `breedingUrl: 'https://loveracing.nz/Breeding/441209/Prudentia-NZ-2020.aspx'`
   - `suggestedTrainer: Wexford Stables (Lance O'Sullivan & Andrew Scott)`
2. **`intake.test.ts:47-52`** — the assertions currently assert fabricated data (`427416` → `Preferment`/`Prudence`). Update to the real URL and values:
   - `lookupHorse('https://loveracing.nz/Breeding/441209/Prudentia-NZ-2020.aspx')`
   - assert `legalName === 'Prudentia'`, `sire === 'Proisir (AUS)'`, `dam === 'Little Bit Irish (NZ)'`.
   - (Line 11-12 is a mechanical `extractLoveRacingId` check — safe to leave, or point at 441209 for cleanliness.)
3. **Uniqueness test** keys on `(name, lifeNumber)` — with one real Prudentia this is satisfied trivially, but keep the life-number key as the durable invariant.
4. **Verify against LoveRacing** for life `NZ00441209` as a final ground-truth check before merge.

Net effect: the plan's M2 direction was right; it only needed (a) the explicit correction of the fabricated `horse-lookup.ts` record and (b) the corresponding `intake.test.ts` update, which the plan omitted. With the owner's confirmation, proceed with the corrected M2 above.
