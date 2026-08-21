# Implementation Plan: Thoroughbred Knowledge Entity Graph & v1 Data Registry

Establish the canonical racing knowledge repository, brand vocabulary guardrails, and deterministic PDS / listing authoring foundation for Evolution Stables.

---

## User Review Required

> [!IMPORTANT]
> **Key Decisions Locked for v1:**
> 1. **Data Storage for v1:** Canonical TypeScript / JSON entity registry within `@evo/db_models` (version-controlled in Git, 100% type-safe, zero cloud database migration debt).
> 2. **Banned Term Update:** `opaque` added to `BANNED_TERMS` across all public-facing copy.
> 3. **v2 Deferrals:** On-demand keyword scraping (NZTR / TAB), pinhooking / Hong Kong trade models, and complex veterinary index are logged for v2.

---

## Proposed Changes

### 1. Brand DNA Package (`packages/brand_dna`)

Update voice standards, enforce banned terms, and establish standard racing tag taxonomy.

#### [MODIFY] `packages/brand_dna/src/voice.ts`
- Add `'opaque'` to `BANNED_TERMS`.
- Add racing bloodstock terms to `VOCABULARY_WHITELIST` (`Sire`, `Dam`, `Broodmare Sire`, `Pedigree`, `Conformation`, `Karaka Millions`, `Scope`, `Prep`, `Rating`).
- Define approved tag taxonomy (`RACING_TAG_TAXONOMY`) for highlight pills and marketing hooks.

---

### 2. Database Models & Knowledge Registry (`packages/db_models`)

Create the structured knowledge entity graph types and seed datasets.

#### [NEW] `packages/db_models/src/types/knowledge.types.ts`
Define TypeScript interfaces:
- `SireProfile`: Sire name, stud farm, sireline, type signature (e.g. *"lovely Contributer filly"*), distance/track profile, notable progeny.
- `TrainerProfile`: Trainer name, stable name, training base (e.g. *Byerley Park*, *Wexford Stables / Matamata*), stable philosophy.
- `JockeyProfile`: Jockey name, riding style, nationality, and documented `JockeyAffinity` pairings (e.g. *Masa Hashizume* ↔ *Prudentia*, *Bruno Queiroz* ↔ *First Gear*).
- `BreederProfile`: Stud/Nursery name, location (Cambridge, Waikato, Matamata), historical pedigree reputation.

#### [NEW] `packages/db_models/src/data/sires.ts`
Seed dataset for key Australasian stallions:
- *Contributer (IRE)* — High Chaparral sireline; renowned for athletic scope, stamina, and coveted filly types (*Campionessa*, *Skew Wiff*, *Lion's Roar*).
- *Satono Aladdin (JPN)* — Deep Impact sireline; explosive miler turn-of-foot, commercial sire (*Pennyweka*, *Tokyo Tycoon*).
- *Almanzor (FR)* — European Champion 3YO; classic staying scope (*Dynastic*, *Manzoice*).
- *Turn Me Loose (NZ)* — Iffraaj sireline; miler speed and toughness (*Licketysplit*, *Prix de Turn*).
- *Sword of State (AUS)* — Snitzel sireline; Champion 2YO precocity.
- *Proisir (AUS)* — Leading NZ sire; elite strike rate.

#### [NEW] `packages/db_models/src/data/trainers.ts`
Seed dataset for key training establishments:
- *Barbara Kennedy Racing* (Byerley Park, Karaka) — Boutique individualized conditioning.
- *Wexford Stables* (Lance O'Sullivan & Andrew Scott, Matamata) — Historic premier stable.
- *Te Akau Racing* (Mark Walker & Sam Bergerson, Matamata / Cranbourne).
- *Allan Sharrock Racing* (New Plymouth).

#### [NEW] `packages/db_models/src/data/jockeys.ts`
Seed dataset for jockeys & affinity partnerships:
- *Masa Hashizume* (Japanese lightweight; proven affinity with *Prudentia* under Wexford).
- *Bruno Queiroz* (Brazilian lightweight tactician; partner on *First Gear*).
- *Craig Grylls* (Jockey of the Year).

#### [NEW] `packages/db_models/src/data/breeders.ts`
Seed dataset for breeding nurseries:
- *Windsor Park Stud* (Cambridge)
- *Rich Hill Stud* (Matamata)
- *Cambridge Stud* (Cambridge)
- *Mapperley Stud* (Matamata)
- *Waikato Stud* (Matamata)

#### [MODIFY] `packages/db_models/src/index.ts`
Export all knowledge types, seed datasets, and lookup helper functions (`getSire()`, `getTrainer()`, `getJockey()`, `getBreeder()`).

---

### 3. Legal Engine Alignment (`packages/legal_engine`)

#### [MODIFY] `packages/legal_engine/src/pds.ts`
- Ensure PDS Section 2 formatting (§2.1 About Horse & Trainer, §2.2 Key Details Table, §2.3 Racing Outlook & Pedigree) seamlessly consumes the entity registry data while maintaining deterministic SHA-256 hashing.

---

### 4. Web Storefront Integration (`apps/web`)

#### [MODIFY] `apps/web/src/lib/horses-data.ts`
- Connect active campaigns (*Nellie / Lady Ketchikan*, *Prudentia*, etc.) to the central knowledge registry for sire profiles, trainer bios, and highlight tag validation.

---

## Verification Plan

### Automated Tests
Run full monorepo typecheck and test suite:
```bash
cd /home/evo/new/evo_02 && pnpm test && pnpm typecheck
```

### Manual Verification
1. **Brand Voice Validator:** Run `validateCopy()` with text containing `"opaque"` to ensure it fails with a descriptive error.
2. **Knowledge Registry Lookups:** Verify helper functions (`getSire('contributer')`, `getTrainer('barbara-kennedy')`, `getJockey('masa-hashizume')`) return correct structured records.
3. **PDS Generation:** Verify that generating a PDS with soft legal content produces stable, deterministic SHA-256 hashes.
4. **Web Build:** Verify Next.js web application builds cleanly with the updated knowledge imports.
