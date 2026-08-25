# Chunks — Sprint: Horse Intake → Supabase Pipeline

## Dependency graph

```
Chunk 1 (schema + seed) ──────┐──► Chunk 2 (website data layer) ──┐
                              │                                    │
Chunk 4 (archive) ────────────┘                                    │
                                                                    ▼
Chunk 3 (campaign pipeline) ───► depends on Chunk 1 ──────────► FINAL GATE (just check)
```

## Chunk 1: Schema extend + reseed + tokinvest cleanup

**Files to create/modify:**
1. `supabase/migrations/00005_extended_pedigree.sql` — add `pedigree_data JSONB`, `soft_legal JSONB`, `marketing JSONB` columns to `inventory`, reseed all 6 horses with full data
2. `packages/db_models/src/schema/00001_initial_schema.sql` — mirror the new columns
3. `packages/db_models/src/types/database.types.ts` — add `pedigree_data`, `soft_legal`, `marketing` to `InventoryHorse Row/Insert/Update`

**Seed data requirements per horse:**
- `pedigree_data`: foaling_date, gender, colour, breeder, microchip, life_number, stud_book_url, dam_sire, lineage_summary
- `soft_legal`: aboutHorse, trainerBio, racingOutlookAndPedigree (from existing CAMPAIGNS_DATA)
- `marketing`: marketplaceHook, highlightTags, highlights (from existing CAMPAIGNS_DATA)
- `listing_platform`: 'evolution' for ALL horses (strip tokinvest)
- `pds_hash` / `sa_hash`: compute real hashes via `compileLegalPack()` for each horse

**DOD:** `supabase migration up` succeeds, typecheck passes, inventory has 6 rows all with platform='evolution'

**Gate:** `pnpm typecheck`

## Chunk 4: Archive old SSOT_Build Tokinvest docs

**Files to create/modify:**
1. `mkdir -p /home/evo/_archive/tokinvest-2026-08-25/`
2. Move `projects/SSOT_Build/HLT/*.docx` and `projects/SSOT_Build/HLT/*.pdf` to archive
3. Note: CAMPAIGNS_DATA tokinvest tags are cleaned in Chunk 1 seed — no code changes needed here

**DOD:** Files moved, archive dir has content

**Gate:** `ls /home/evo/_archive/tokinvest-2026-08-25/` shows files

## Chunk 2: Nuke horses-data.ts → async Supabase queries

**This is the big one. Strategy:**

1. **Replace `CAMPAIGNS_DATA`** with Supabase queries. `getCampaignBySlug()` does `await supabase.from('inventory').select('*').eq('slug', slug).single()`. The return type adapts the DB row to the `HorseCampaign` interface.

2. **Map DB row → HorseCampaign interface.** The `inventory` row has flat fields + JSONB columns for pedigree/soft_legal/marketing. The adapter function `rowToCampaign(row: InventoryHorse): HorseCampaign` handles the shape conversion.

3. **Move `validateCampaign()`** to the campaign pipeline (at intake time), not at render time.

4. **Keep pricing/CDN/legal helpers as pure sync functions** — they receive data, they don't fetch it.

5. **Update ALL callers to async:**
   - `horses-data.ts` — exports become `async`
   - `page.tsx` — `generateStaticParams()` becomes async, `generateMetadata()` becomes async, component becomes `async`
   - `about/page.tsx` — same pattern
   - `homepage.tsx` — component becomes `async`
   - `sitemap.ts` — function becomes `async`
   - `mystable-dashboard.tsx` — becomes `async` server component or fetches in useEffect
   - `nellie-loop.ts` — callers use `await`
   - `checkout/route.ts` — already async, just awaits the call
   - `stripe/route.ts` — already async, just awaits
   - `legal/download/route.ts` — already async, just awaits
   - `nellie_loop.test.ts` — use `await` in tests

**Files to modify (all in apps/web/src/):**
1. `lib/horses-data.ts` — complete rewrite (CAMPAIGNS_DATA → supabase queries)
2. `app/horses/[slug]/page.tsx` — make async
3. `app/horses/[slug]/about/page.tsx` — make async
4. `app/page.tsx` — make async
5. `app/sitemap.ts` — make async
6. `components/mystable-dashboard.tsx` — make async
7. `lib/nellie-loop.ts` — await data functions
8. `app/api/checkout/create-session/route.ts` — await data functions
9. `app/api/webhooks/stripe/route.ts` — await data functions
10. `app/api/legal/download/route.ts` — await data functions
11. `tests/nellie_loop.test.ts` — await data functions

**DOD:** All 6 horses render identically on site, checkout works, sitemap generates

**Gate:** `pnpm build --no-lint` succeeds with zero errors

## Chunk 3: Campaign pipeline — intake → legal pack → store

**Files to create:**
1. `apps/mission_control/src/lib/supabase-server.ts` — service client (copy pattern from web app)
2. `apps/mission_control/src/lib/campaign-pipeline.ts` — orchestrator: intake → compileLegalPack → store
3. `apps/mission_control/src/app/api/campaign/create/route.ts` — POST endpoint

**Pipeline flow:**
1. Receive horse data (pedigree, pricing, soft_legal, marketing, owner, trainer)
2. Call `compileLegalPack()` from `@evo/legal_engine` → generates PDS/SA markdown + SHA-256 hashes
3. Insert row into Supabase `inventory` with all fields + hashes
4. Return row

**DOD:** POST campaign → 201 response with row containing real PDS/SA hashes

**Gate:** `curl -X POST ...` returns valid campaign row

## Final Gate

`just check` — must be green before audit.
