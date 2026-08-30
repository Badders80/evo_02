# Stephen Gray — entity/location lock (2026-08-31)

## Canon (test-enforced in packages/db_models/tests/registry.test.ts)

| Field | Value |
|---|---|
| Trading name | Stephen Gray Racing |
| Banned names | Stephen Gray Stables / Stephen Grey Stables / Stephen Grey Racing / Grey Stables / "at Copper Belt" |
| Location display | Palmerston North, NZ (city-level ONLY) |
| Facility | Copper Belt Lodge (yard name only, NO street address on any user-facing surface) |
| Contact | Stephen Gray · stephengrayracing.com/contact/ |
| Spelling | Gray (matches stephengrayracing.com) — never "Grey" |

## Street address (internal correspondence only — NEVER render)

`Copper Belt Lodge, 160 Green Road, RD6, Palmerston North 4476`
Legal correspondence / agistment contracts may use it; site, MC UI, legal packs, docs, alt text must not.

## Why it kept regressing

The address existed as copy-pasted literals across 3 layers (seed SQL, MC
components, live DB soft_legal jsonb) with no test. The PDS compiles LIVE from
soft_legal.trainerBio, so DB drift leaked into investor documents. The
homepage press-showcase also shipped the "Grey" misspelling as partner alt text.

## Guard (in just check — fails the gate)

registry.test.ts:
- Street regex /160 green road|rd6|4476/i must not match TRAINERS or
  STEPHEN_GRAY_RACING
- /stephen greys? racing/i must not match
- Banned entity names already enforced
- location === 'Palmerston North, NZ' asserted

## Surfaces verified clean (2026-08-31, commit adcadc3)

- Live DB: 0 rows carry address/grey (all 34 columns)
- Seed SQL: 00003 (x2 files), 00005 — canon
- Mission Control: 5 files, 9 literals — canon
- Homepage press showcase: Gray spelling
- SSR routes (/, /marketplace, all horses, login, auth/login): 0 hits
- Legal downloads (pds/sa/terms x 2 horses): 0 hits
- evo_01 prod source: clean; evo_03: clean
- evo_00 doc/ASSET_LOCK.md: updated + DISPLAY RULE added (agents read this)
- evo_00 doc/DECISION_LOG.md line 41 still references old address (historical
  decision log entry — left as-is; ASSET_LOCK.md is the live SSOT)

## If a surface regresses again

1. `grep -rniE "160 green|green road|rd6|4476|stephen grey" --include="*.ts" --include="*.tsx" --include="*.sql" packages apps supabase | grep -v node_modules | grep -v dist`
2. Check live DB: `SELECT slug FROM inventory WHERE row_to_json(inventory)::text ILIKE '%Green Road%';`
3. Fix at the SEED/SOURCE layer, never the caller layer.
4. `just check` must go 10/10 — the guard test does the remembering.
