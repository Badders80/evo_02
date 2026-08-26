# FIN — Walked Proof (sprint e2e-wire)

**Date:** 2026-08-25 (overnight run) · **Verdict:** WALKED ✅

## Path walked
`POST /api/campaign/create` (bearer auth) → `createCampaignFromIntake` → inventory row + legal pack (64-hex hashes) → storefront `/horses/<slug>` renders from Supabase → row deleted.

## Evidence

### 1. Auth pair (fail-closed) — MC dev on :3011
```
POST /api/campaign/create (no token)    → {"error":"unauthorized"} HTTP 401
POST /api/campaign/create (wrong token) → {"error":"unauthorized"} HTTP 401
POST /api/campaign/create (correct)     → 201 (below)
```

### 2. Create via real publish path
```
POST /api/campaign/create  HTTP 201
inventoryId: c2b24398-7dc6-4f61-816c-5e79f73cad2f  (first attempt, slug-mangled — deleted)
inventoryId: (second attempt, clean)  → row verified via REST:
```
REST: `GET /rest/v1/inventory?slug=eq.e2e-wire-test-1787649948` → `200`
```json
[{"slug":"e2e-wire-test-1787649948","status":"draft",
  "pds_hash":"e6db1c898654118a41de8ae52af6b39ff8b9914291e27cb6263218c7e293f905",
  "sa_hash":"a620cc1d290275262d79ba10396771890309f15878e3eb604b9c8789b36e913e",
  "total_shares":10.0}]
```

### 3. Server action (browser path) — tsx eval
`c1-smoke` invoked `publishCampaignAction` directly:
```
ACTION RESULT: {"ok":true,"inventoryId":"8591bb1e-…","pdsHash":"036fb284ca10…","saHash":"16d4913582e5…"}
PASS: publishCampaignAction ok:true  (64-hex asserted)
CLEANUP OK: deleted 8591bb1e-…
```

### 4. Storefront render from Supabase — web dev server :3010
`GET /horses/e2e-wire-test-1787649948` → HTTP 200, 130KB page:
```
title_contains_E2E_Wire_Test: PASS   <title>E2E Wire Test (E2E Wire Test) | Commercials & Terms | Evolution Stables</title>
slug_in_page:             PASS
three_64hex_hashes:       PASS   (termSheetHash/pdsHash/saHash in RSC flight data, live-compiled)
pdsMarkdown_present:      PASS
saMarkdown_present:       PASS
```

### 5. Cleanup (test horse MUST be deleted)
```
DELETE /rest/v1/inventory?slug=eq.e2e-wire-test-1787649948 → HTTP 204
GET  /rest/v1/inventory?slug=like.e2e-wire-test%25 → []   (0 rows)
psql: SELECT count(*) … LIKE 'e2e-wire-test%' → 0
```

### 6. Final gate
```
✅ [evo_02] All lint, typecheck, and test gates PASSED.  (10/10 tasks, FULL TURBO)
```

### 7. Dev servers
MC (:3011) + stale web (:3010) both killed; ports verified free.

## Files changed this sprint (uncommitted, per rules)
- `apps/mission_control/src/app/actions/publish-campaign.ts` (new) — C1
- `apps/mission_control/src/lib/intake-adapter.ts` (new) — C1
- `apps/mission_control/src/components/horse-workspace.tsx` — C1 (+ repaired parse/type errors left by killed C1 executor)
- `apps/mission_control/src/app/api/campaign/create/route.ts` — C2 (bearer auth, fail-closed, timing-safe)
- `apps/mission_control/src/lib/campaign-pipeline.test.ts` (new) — C3 (in pnpm test)
- `apps/web/src/lib/media-fallback.ts`, `apps/web/public/brand/placeholder-hero.svg` (new) — C4
- `apps/web/src/lib/horses-data.ts`, `apps/mission_control/package.json` — C3/C4/C5 wiring
- `apps/mission_control/.env.example`, `apps/web/.env.example` (new/updated) — C2 placeholders
- `apps/mission_control/.env.local`, `apps/web/.env.local` (gitignored) — OPERATOR_API_TOKEN, fixed truncated service key
- `build-loop/plan-graph.json` — chunk states
- `CONTINUE.md` — C7 desk rewrite
- `.env.local` in both apps verified gitignored

**Stage 5 (paid audit) is founder-gated — not run.**
