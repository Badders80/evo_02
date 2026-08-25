# Review Synthesis — Sprint: Horse Intake → Supabase Pipeline

**Date:** 2026-08-25  
**Reviewer A:** opencode nemotron-3-ultra-free — TIMED OUT (no findings produced)  
**Reviewer B:** kimi-k2.7-code (paid subagent) — 45 findings delivered  
**Orchestrator gap analysis:** below

---

## 🔥 Critical (must fix — non-negotiable)

### Finding 1: `soft_legal` and `marketing` JSONB columns DON'T EXIST in DB
**Source:** plan.md line 31 claims they do. Actual `00001_initial_schema.sql:118-149` has NO JSON columns in `inventory`.
**Fix:** Migration must add `soft_legal JSONB` and `marketing JSONB` columns, not just `pedigree_data`.

### Finding 2: Schema source-of-truth is split
**Source:** `supabase/migrations/` has the live schema. `packages/db_models/src/schema/` has the canonical SQL for package tests. New columns must be mirrored in both.
**Fix:** Plan must add step to update `packages/db_models/src/schema/00001_initial_schema.sql` alongside `supabase/migrations/00005_extended_pedigree.sql`.

### Finding 3: Making `getCampaignBySlug()` async breaks 8+ consumers
**Impact check (`horses-data.ts` callers):**
- `page.tsx` — `generateStaticParams()` and `generateMetadata()` (must become async)
- `homepage.tsx` — server component (must become async)
- `checkout/create-session/route.ts` — synchronous call
- `webhooks/stripe/route.ts` — synchronous call
- `mystable-dashboard.tsx` — synchronous import
- `sitemap.ts` — synchronous import
- `legal/download/route.ts` — synchronous import
- `nellie-loop.ts` — synchronous import

**Fix: Don't make `getCampaignBySlug()` async!** Instead: make the Supabase call **inside** a synchronous adapter that caches at startup. Use a server-side pattern: `horses-data.ts` fetches from Supabase at module init (lazy singleton cache), not at call time. This preserves all sync signatures.

### Finding 4: Verification commands are wrong
- `curl localhost:3010` — no port 3010 anywhere. Should be `:3000` or via test.
- `find /home/evo/new/evo_01` — wrong path. Old Tokinvest PDFs are at `/home/evo/evo_01/01_evolution/horses/*/tokinvest-listing.md` — **markdown files, not PDFs**.
- `just check` has 3 recipes, not "10+ tasks".

**Fix:** Fix all verification commands to match reality.

---

## 🟠 Important (fix recommended)

### Finding 5: The Tokinvest archive target doesn't exist as described
**Reality check:**
- `/home/evo/evo_01/_assets/horses/*/documents/tokinvest-*.pdf` does NOT exist at that path
- Tokinvest refs are: markdown listing notes `tokinvest-listing.md` per horse in `evo_01/01_evolution/horses/`, and asset images in `evo_01/_assets/`
- Old `.docx` PDS docs are in `projects/SSOT_Build/HLT/`

**Fix:** Scope down to: tok invest listing platform tags in seed data + CAMPAIGNS_DATA. Archive old SSOT_Build docs to a cold storage dir. Skip the PDF search that returns nothing.

### Finding 6: `validateCampaign()` runs on every `getAllCampaigns()` call
The plan overlooks that every campaign fetched must pass validation against `getLockedHorse()` / `getSire()` / `getTrainer()`. DB-sourced rows must include all the fields that validation checks.

### Finding 7: `listingPlatform: 'tokinvest'` also lives in CAMPAIGNS_DATA (fallback)
During transition, the hardcoded fallback still reports `tokinvest` for 3 horses. Must be cleaned in the same pass.

---

## 🔵 Good catches — easy wins

| # | Finding | Action |
|---|---------|--------|
| 8 | Migration sequencing: `00005` must be after `00004` | Already correct per plan |
| 9 | `database.types.ts` is manually maintained | Add explicit type update to plan |
| 10 | `inventory-ids.ts` hardcodes UUIDs | New pipeline campaigns need dynamic UUID resolution |
| 11 | Mission Control has no Supabase client file | Add `supabase-server.ts` to mission_control |
| 12 | `computeDslPricing` formula must match seed | Already checked — they match. Add invariant test |

---

## Orchestrator gap analysis

**What BOTH reviewers missed (I have context they don't):**

1. **The simpler architecture:** Instead of API routes between website and Supabase, `horses-data.ts` can import `createServiceClient()` from `@evo/db_models` directly and query Supabase at **module init time** (lazy singleton). This avoids creating new API routes, keeps all signatures synchronous, and removes the fetch/latency layer. The existing `supabase-server.ts` client already exists with service_role access — just import it.

2. **The `horses/route.ts` is redundant** with the approach above — the server component reads DB directly. Remove from plan scope.

3. **Chunk ordering simplification:** Chunks 2 and 3 collapse into one (API layer is unnecessary with direct DB reads from server components).

---

## Revised plan (proposed fixes)

### Key changes from original plan

| Change | Reason |
|--------|--------|
| Add `soft_legal JSONB` + `marketing JSONB` columns | Schema doesn't have them |
| Update BOTH `supabase/migrations/` AND `packages/db_models/src/schema/` | Package tests must stay in sync |
| Remove API route chunks — website reads DB directly via `supabase-server.ts` | Eliminates 8 consumer breakages, keeps sync signatures |
| `getCampaignBySlug()` stays synchronous — uses module-level Supabase cache | Zero blast radius on checkout/webhooks/sitemap |
| Add `validateCampaign()` after Supabase fetch | Asset lock must still gate every campaign |
| Fix verification commands for actual port/paths | They must prove what they claim |
| Archive SSOT_Build docs, not evo_01 PDFs | The target files aren't where the plan says |

### Revised chunk plan

```
Chunk 1: Schema extend (add 3 JSONB columns) + reseed + mirror to db_models schema   (parallel)
Chunk 5: Archive SSOT_Build docs + clean tokinvest tags                                 (parallel)
Chunk 3': Website data layer — import supabase-server.ts, lazy-init cache, keep sync    (depends on Chunk 1)
Chunk 4: Campaign pipeline — intake → compileLegalPack → Supabase store                 (depends on Chunk 1)
Chunk final: just check green                                                           (depends on 3', 4, 5)
```

---

**Decision needed:** Do you approve the revised approach (website reads Supabase directly via server client — no new API routes, keeps all signatures sync)?
APPROVED: 2026-08-25
