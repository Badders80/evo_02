# Plan — Sprint: E2E Wire (MC Publish → Pipeline → Storefront)

**Date:** 2026-08-25 · **Branch:** `sprint-1-nellie-loop` · **Predecessor:** Horse Intake → Supabase Pipeline sprint (chunks 1–3 executed & verified, chunk 4 open)

## Goal (one sentence)

Prove the full new-DSL listing flow end-to-end once — Mission Control intake → publish button → `/api/campaign/create` → `compileLegalPack()` → Supabase `inventory` → storefront renders the new horse — and close the carried debt (uncommitted tree, endpoint auth, integration test, lint/type-union residue, doc archive, stale CONTINUE.md).

## Architecture approach

No new architecture. Wire what exists:

```
horse-workspace.tsx ──fetch POST──► /api/campaign/create ──► createCampaignFromIntake()
   (form state)        (bearer token)        (route.ts)            │
                                                                 ▼
                                                  compileLegalPack() → SHA-256
                                                                 ▼
                                                    Supabase inventory INSERT
                                                                 ▼
                                          website getAllCampaigns()/getCampaignBySlug()
```

## Verified assumptions

- `createCampaignFromIntake()` exists, compiles legal pack with real hashes, inserts with id-return check `[verified: apps/mission_control/src/lib/campaign-pipeline.ts:196-197,245-259]`
- `POST /api/campaign/create` exists but is unauthenticated `[verified: apps/mission_control/src/app/api/campaign/create/route.ts]`
- `horse-workspace.tsx` holds publish state (`publishSuccess`, `publishedPdsHash`) but makes **zero** fetch calls `[verified: grep fetch( apps/mission_control/src → 0 hits]`
- Parser output `ExtractedIntakeData` ≠ pipeline input `CampaignIntakePayload` — an adapter mapping is required `[verified: smart-intake-parser.ts:67-79 vs campaign-pipeline.ts:12-63]`
- `supabase-server.ts` (MC) is an env-driven service client `[verified: supabase-server.ts]`
- Media map `HORSE_STILLS` is hardcoded with `?? []` fallback — unknown slugs render empty heroes `[verified: packages/storage/src/cdn.ts:14,84]`
- Hottathanafantasy has 2 mapped stills, no video `[verified: public/horses/hottathanafantasy/, cdn.ts:54-56]`
- Local Supabase stack healthy at :54321 `[ASSUMPTION — recheck `supabase status` at execution]`
- `projects/SSOT_Build/HLT/` archive source location `[ASSUMPTION — locate with find at execution]`

## Chunks (summary — full spec lands in chunks.md at Stage 3)

| ID | Chunk | Depends | Gate |
|----|-------|---------|------|
| C0 | Baseline commit: `just check` green → commit all 29 dirty files as pre-sprint snapshot | — | `git status` clean, `just check` |
| C1 | Publish wire: intake adapter (`ExtractedIntakeData`→`CampaignIntakePayload`) + fetch POST + success/error UI in `horse-workspace.tsx` | C0 | `just check`; manual POST smoke |
| C2 | Endpoint auth: shared-secret bearer check on route.ts (env `OPERATOR_API_TOKEN`), 401 fail-closed; MC client sends header from env | C1 | `just check`; curl 401/201 pair |
| C3 | Integration test: `campaign-pipeline.test.ts` — real `createCampaignFromIntake()` vs local Supabase; assert 201-shape row + 64-hex hashes; delete test row after | C0 | `just check` includes test |
| C4 | Media fallback: branded placeholder hero when slug absent from `HORSE_STILLS` (web-side wrapper, no storage-package breaking change) | C0 | `just check` |
| C5 | Debt close: prefix/remove 6 unused vars; strip `'tokinvest'` from type unions (`legal_engine/types.ts`, `db_models/database.types.ts`, `horses-data.ts`, `campaign-pipeline.ts`) — **keep** `brand_dna/voice.ts` banned-term entry (compliance tooling); append async-vs-cache ADR note to `review-synthesis.md` (decision: async stays); leave `supabase/migrations/00003` literals untouched — historical migration superseded by 00005, editing applied migrations breaks checksums | C0 | `just check`; `grep -ri tokinvest apps packages --include='*.ts' --exclude-dir=dist` → only voice.ts hit |
| C7 | Desk refresh: rewrite `evo_02/CONTINUE.md` (E2E done state + next), sync `evo_00/CONTINUE.md` pointer | C1–C5 | paths resolve |
| FIN | Final gate + E2E walk + Stage 5 independent audit | C7 | see below |

*(Prior sprint's Chunk 4 archive task verified complete 2026-08-25 — `/home/evo/_archive/tokinvest-2026-08-25/{HLT,documents,listings}` populated. No work remaining.)*

Parallel waves after C0: wave 1 = {C3, C4, C5} (zero shared files); wave 2 = C1 → C2 (same component region, serialized); C7 last.
FIN includes the walked proof: MC dev server up → authenticated POST through real HTTP → web dev server renders `/horses/e2e-wire-test` from Supabase → test row deleted.

## Definition of Done (sprint level)

1. One NEW test horse travels link→website: created via the MC publish path, visible at `/horses/<slug>` from Supabase data, with real 64-hex PDS/SA hashes.
2. `just check` fully green (lint 0 errors, typecheck, all tests incl. new integration test).
3. Zero `'tokinvest'` tokens in `apps/**`+`packages/**` TS sources; zero lint warnings.
4. Unauthenticated POST → 401; authenticated → 201.
5. Working tree committed; CONTINUE.md files truthful.

## Out of scope (this sprint)

- R2 upload UI for new-horse media (fallback placeholder covers rendering)
- Any production/live surface action: no merges to `main`, no Evolution-3.0 migrations, no deploys
- V2 payouts, MC restyle, `validateCampaign()` port (`compileLegalPack()` already compliance-validates at compile)
- Video wiring for Hotta (asset located & reported; upload path deferred with R2 UI)

## Canonical / compliance notes

Owner/lessor = **Evolution Stables** (never Ltd/Bloodstock). Trainers: Stephen Gray Racing (Copper Belt Lodge = address), O'Sullivan & Scott (Wexford, Matamata), Barbara Kennedy Racing (Byerley Park, Karaka). New DSLs = `subscription_float`; tokinvest-era = `upfront`. Banned-terms list in `@evo/brand_dna` governs copy. Test horse uses obviously-fake name (`e2e-wire-test`) and is deleted after proof.
