# MID-1: Inventory Share Invariant Walk

**Purpose:** Verify the locked share invariant (total_shares = round(listed_stake_pct / stake_step_pct, 2)) holds across all inventory rows, and document constraint/grant findings.

---

## 1. CHECK Constraint (canonical rule)

**File:** `packages/db_models/src/schema/00001_initial_schema.sql` **line 134**

```sql
total_shares NUMERIC(5,2) NOT NULL CHECK (total_shares = round(listed_stake_pct / stake_step_pct, 2) AND total_shares > 0 AND total_shares <= 100),
```

- **Canonical rule:** `total_shares = round(listed_stake_pct / stake_step_pct, 2)`
- **Actual constraint text:** matches exactly — no deviation detected. The file contains expected uncommitted sprint edits.

---

## 2. Service Role Grants (migration 00006*)

**File:** `supabase/migrations/00006_service_role_inventory_write.sql` **line 5**

```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory TO service_role;
```

- **Grant lines for inventory:** `SELECT, INSERT, UPDATE, DELETE` — all four operations present, satisfying the service_role DML path used by the webhook/purchase pipeline.

---

## 3. REST-Query: All Inventory Rows

**Endpoint:** `http://127.0.0.1:54321/rest/v1/inventory` (headers: `apikey` + `Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY` — value redacted, loaded from gitignored `.env.local`)

| slug            | stake | step | shares | computed       | OK-or-VIOLATION |
|-----------------|-------|------|--------|----------------|-----------------|
| nellie          | 5.00  | 0.50 | 10.00  | round(5.00/0.50)=10.00 | OK |
| tml-x-yearn     | 5.00  | 0.50 | 10.00  | round(5.00/0.50)=10.00 | OK |
| prudentia       | 5.00  | 0.25 | 20.00  | round(5.00/0.25)=20.00 | OK |
| hottathanafantasy | 5.00  | 0.25 | 20.00  | round(5.00/0.25)=20.00 | OK |
| i-stole-a-manolo| 5.00  | 0.50 | 10.00  | round(5.00/0.50)=10.00 | OK |
| first-gear      | 10.00 | 1.00 | 10.00  | round(10.00/1.00)=10.00 | OK |

- **nellie** (stake=5, step=0.5, shares=10): `round(5/0.5) = round(10) = 10` → **OK**
- **tml-x-yearn** (stake=5, step=0.5, shares=10): `round(5/0.5) = round(10) = 10` → **OK**

All 6 rows satisfy the invariant.

---

## 4. Verdict

**ZERO INVARIANT VIOLATIONS**

- Every row in `public.inventory` passes the CHECK constraint `total_shares = round(listed_stake_pct / stake_step_pct, 2)`.
- The `service_role` grants (`SELECT, INSERT, UPDATE, DELETE ON public.inventory`) are present and correct per migration `00006_service_role_inventory_write.sql` line 5.
- **No fixes path required.** The invariant is locked and satisfied.

---

*Walk completed: inventory constraint ✓, grants ✓, data rows ✓, verdict ✓.*

## 5. Storage/CDN

**R2-skipped-unless-env assertion** (from `pnpm --filter @evo/web test` output, `nellie_loop.test.ts` line 164):
```
✅ R2 skipped unless env exists
```

**Placeholder-fallback assertion** (from `media-fallback.ts` / `placeholder-hero.svg`):
- `PLACEHOLDER_HERO = '/brand/placeholder-hero.svg'` — used as fallback when no cover image is available
- `getHorseMediaWithFallback(slug)` returns `{ heroConformation: cover ?? PLACEHOLDER_HERO }` — falls back to placeholder SVG when `cover` is undefined/null

**R2 / Cloudflare grep verdict** (`grep -rn 'R2\|cloudflare' apps packages --include='*.ts' --include='*.tsx'`):
- All 19 hits are **env-var references** (`env.R2_ACCOUNT_ID`, `env.R2_ACCESS_KEY_ID`, `env.R2_SECRET_ACCESS_KEY`, `env.R2_BUCKET_NAME`) or **internal identifiers/imports**:
  - `nellie-loop.ts`: env var reads only — no hardcoded keys
  - `webhooks/stripe/route.ts`: internal `@evo/storage/client` import
  - `nellie_loop.test.ts`: test fixture values (`'acct'`, `'key'`, `'secret'`, `'vault'`) — clearly mock values for test context
  - `packages/storage/*`: internal R2 client config (`accountId`, endpoint pattern `*.r2.cloudflarestorage.com`) — library-level identifiers, not credentials
  - `mission_control/operations-dashboard.tsx`: UI display text ("Cloudflare R2", "$0 Egress") — no secrets
- **No hardcoded credentials, account IDs, or secret keys found.** All `R2`/`cloudflare` references are either env vars, internal package identifiers, test mocks, or UI text.

- **`nellie-loop.ts` lines 65-68**: `env.R2_ACCOUNT_ID`, `env.R2_ACCESS_KEY_ID`, `env.R2_SECRET_ACCESS_KEY`, `env.R2_BUCKET_NAME` — all env-var references, safe.
- **`nellie_loop.test.ts` lines 158-161**: `R2_ACCOUNT_ID: 'acct'`, `R2_ACCESS_KEY_ID: 'key'`, `R2_SECRET_ACCESS_KEY: 'secret'`, `R2_BUCKET_NAME: 'vault'` — test fixtures only, not real credentials.
- **`packages/storage/src/client.ts` line 9**: `const endpoint = \`https://\${config.accountId}.r2.cloudflarestorage.com\`;` — internal config pattern, no real account ID embedded.
### 5.1 Host-audit correction (2026-08-26)
The chunk brief claimed apps/web tests already covered the placeholder fallback. Source-check found
NO such assertion in `apps/web/src/tests/nellie_loop.test.ts` (only "R2 skipped unless env exists" is
tested there). Gap closed rather than left documented: new deterministic test added at
`apps/web/src/tests/media_fallback.test.ts` (unknown slug → `/brand/placeholder-hero.svg`; known slug →
CDN still), wired into `apps/web/package.json` test chain; host rerun of `just check` → 10/10 PASSED.

## 6. Live-DB constraint vs edited schema template (R3 MIGRATION-EDIT disposition)

Auditor flagged `packages/db_models/src/schema/00001_initial_schema.sql` as an edit to an applied migration.
Ground-truth check (2026-08-26, host):
- `git diff 2e5bc31 --stat -- supabase/migrations/` → **empty** (all applied-migration copies untouched).
- The sprint edit lives only in the packages/db_models source template (1 line: the shares-invariant CHECK).
- Live local DB, actual enforced constraints via psql (postgresql://postgres@127.0.0.1:54322/postgres):
  - `inventory_check2 :: CHECK (((total_shares = round((listed_stake_pct / stake_step_pct), 2)) AND (total_shares > 0 AND <= 100)))`
  - plus boundary guard `chk_inventory_shares_boundary :: CHECK ((shares_available + reserved_shares) <= total_shares)`
- Conclusion: live DB already enforces the canonical rule; source template and applied copies are consistent in effect; no migration rewrite occurred. Non-violation.
