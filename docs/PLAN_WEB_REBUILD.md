# evo_02 Web Rebuild — Starting Point

**Date:** 2026-08-21  
**Authority:** `evo_00/migration_bridge/02_DATA_MAPPING.md`, `evo_00/doc/DSL_MANUAL.md`, `evo_00/doc/OPERATIONS_SOP.md`, `evo_00/CONTINUE.md`  
**Goal:** Replace the static `apps/web` storefront with a live, Supabase-driven marketplace and myStable dashboard wired to the canonical backend model.

## Overall Readiness: 70% Built, 30% Integration/Invention Remaining

| Workstream | % Done | Status |
| :--- | ---: | :--- |
| Legal / Compliance Engine | 85% | PDS/SA gen, hashing, compliance gating, settlement math all tested. Remaining: consumption wiring for payment model + PDS §4 display. |
| Database Schema | 80% | Tables, checks, enums, seed, RPCs, step-unit model designed and validated. Remaining: apply to real Supabase + generate fresh types. |
| Mission Control Intake UI | 75% | Workspace, pure-lock fields, compliance badge, auto-draft marketing, Save & Re-Hash button built. Remaining: actual server action that writes to Supabase. |
| Public Storefront Shell | 60% | Routes and components exist, hard/soft split is right. Remaining: live data fetch, 3-way cap table, upfront pricing, token purity. |
| KYC + Payment Workflows | 30% | Schema has holdings/reservations/RPCs. Remaining: Stripe Identity, Checkout, Portal, webhook handler, holding creation. |
| PDS/SA Sign-Off | 25% | Documents generate and hash. Remaining: e-signature capture, investor agreement record, immutable signed-version vault. |

**Verdict:** The hard design decisions are complete. The remaining work is a mix of pulling existing pieces together (legal engine, schema, MC UI, storefront shell) and building two from-scratch flows (Stripe commerce + e-sign ceremony). The ratio is roughly **2:1 existing-to-new**.

## Backend Readiness (Locked)
- **Payment model:** canonical `upfront` across legal engine, DB enum, seed, docs.
- **Cap table:** 3-way listed pool only (`allocated + reserved + available = total_shares`).
- **Schema:** `inventory.total_shares`, `shares_available`, `reserved_shares` are `NUMERIC(5,2)`; `listed_stake_pct`, `min_stake_pct`, `stake_step_pct` added.
- **Step-unit model:** `total_shares = listed_stake_pct / stake_step_pct`.
  - Nellie/Mulan: 5% @ 0.5% step → 10 units.
  - Prudentia/Hotta: 5% @ 0.25% step → 20 units.
  - Manolo: 5% @ 0.5% step → 10 units.
  - First Gear: 10% @ 1% step → 10 units.
- **Investor registry:** 10 canonical co-owners / 12 active holdings in step units; First Gear KYC co-owners listed for audit only.
- **Legal engine:** `canonicalizeSoftLegal()` for hash determinism, `validateSyndicateContent()` compliance gate, 3-way `computeHorseCapTable()`.
- **Tests + typecheck:** `pnpm turbo run test typecheck --force` → 14/14 green.

## Web Frontend Current State
- Static fixture-driven: `apps/web/src/lib/horses-data.ts` hardcodes all campaigns.
- `/horses/[slug]` exists with hard/soft split, but cap table is still **4-way** and pricing card defaults to `subscription_float`.
- `/horses/[slug]/about` exists for soft narrative.
- Marketplace landing (`/`) uses `CAMPAIGNS_DATA`.
- No live Supabase connection for content or holdings.

## Mission Control Studio Readiness
- New **PDS Soft Content & Website Studio** tab in `horse-workspace.tsx`.
- Pure-lock fields: `aboutHorse`, `trainerBio`, `racingOutlookAndPedigree`.
- Forward-derived marketing: `marketplaceHook`, `highlightTags`.
- Live `validateSyndicateContent()` compliance badge.
- **1-Click "Save & Re-Hash" button wired to React callback** — persistence path not yet implemented.

## Sprint Roadmap (Do Not Skip Sequence)

### Sprint A — Web → Supabase (Tomorrow)
**Goal:** MC-authored content appears live on the website; storefront matches canonical backend model.

#### Phase A1: MC → Supabase Write Path (1–2h)
1. Add server action or tRPC route under `apps/mission_control`:
   - Accept `horseSlug`, `aboutHorse`, `trainerBio`, `racingOutlookAndPedigree`, `marketplaceHook`, `highlightTags`.
   - Run `canonicalizeSoftLegal()` and `validateSyndicateContent()` on server.
   - Call `compileLegalPack()` to get `pdsHash`, `saHash`.
   - Upsert `public.inventory` soft fields + hash fields.
   - Insert immutable row into `public.horse_content_versions`.
2. Connect the existing `onFreezePack` callback in `horse-workspace.tsx` to this server action.
3. Add optimistic UI feedback (success toast, hash display).

#### Phase A2: Web → Supabase Read Path (1–2h)
1. Replace static `CAMPAIGNS_DATA` reads with Supabase SSR queries.
2. Create `apps/web/src/lib/supabase-campaigns.ts`:
   - `getCampaignBySlug(slug)` — server component query.
   - `getAllCampaigns()` — marketplace index query.
3. Update `page.tsx` and `/about/page.tsx` to fetch live rows.
4. Keep ISR/revalidation strategy explicit (e.g., `revalidate = 60`).

#### Phase A3: 3-Way Cap Table & Step-Unit Pricing (1–2h)
1. Refactor `CapTableCard` to accept:
   - `totalShares`, `allocatedShares`, `reservedShares`, `availableShares`
   - remove `retainedPct`.
2. Refactor `PricingCard` to accept:
   - `paymentStyle: 'subscription_float' | 'upfront'`
   - `listedStakePct`, `totalShares`, `minStakePct`, `stepStakePct`
   - compute per-unit economics from `wholesaleMonthlyNzd`, `listPriceNzd`, etc.
3. Add interactive unit selector constrained by `min_stake_pct` and `stake_step_pct`.

#### Phase A4: Payment Style Display (30–60m)
1. Pass `paymentModel: 'upfront'` from live `inventory.payment_style` into `compileLegalPack()`.
2. Update `PricingCard` to show upfront total when `payment_style === 'upfront'`.
3. Ensure PDS §4 renders the correct wording for each campaign.

#### Phase A5: Token Purity Pass (1h)
- Strip remaining raw hex literals (`#d4a964`, `#0a0a0a`) in `apps/web/src` and map to `@evo/brand_dna` semantic tokens.

#### Sprint A Success Criteria
- Change soft content in MC → see updated content on `/horses/[slug]/about` within revalidation window.
- Change marketing hook in MC → see updated marketplace card on `/`.
- 3-way cap table shows correct allocated/reserved/available for each campaign.
- Upfront campaigns show upfront pricing; float campaigns show `$5×M`.
- `pnpm turbo run test typecheck --force` stays 14/14 green.

### Sprint B — Supabase Lock-In & DevOps
**Goal:** Migrations applied to real project; local dev loop stable.

1. Identify or create Supabase project (local `supabase start` or cloud project).
2. Apply migrations in order:
   - `00001_initial_schema.sql`
   - `00002_cap_table_and_reservations.sql`
   - `00003_seed_live_horses_and_investors.sql`
3. Generate fresh `database.types.ts` via `supabase gen types typescript`.
4. Verify RLS policies work for `anon` read + `service_role` write paths.
5. Document project ref, anon key, service role key in team vault (not in repo).

### Sprint C — KYC + Stripe Commerce
**Goal:** Authenticated user can KYC, reserve units, pay, and receive a holding.

1. **Auth:** confirm Supabase SSR auth middleware is resilient (magic link + callback).
2. **KYC:** integrate Stripe Identity verification session.
3. **Reserve:** call `reserve_campaign_shares()` RPC at checkout start.
4. **Pay:** create Stripe Checkout Session with unit count and price.
5. **Webhook:** `checkout.session.completed` handler:
   - Inserts `investor_holdings` row.
   - Confirms reservation or converts to allocation.
   - Triggers PDS/SA sign-off flow.
6. **Billing portal:** `/api/billing/portal` route for payment-method updates.

### Sprint D — PDS/SA Sign-Off + Investor Vault
**Goal:** Every holding has a timestamped, signed legal record.

1. Build e-signature capture flow (checkbox + timestamp + IP is acceptable for v1).
2. Record agreement on `investor_holdings.signed_*` fields + version IDs.
3. Serve exact signed PDS + SA PDFs from CDN/R2 with signed URLs.
4. Add immutable `horse_content_versions` audit table (if not already created in Sprint A).

## Open Questions to Resolve
1. **Supabase project:** local `supabase start` or existing cloud project? Need ref + keys.
2. **`horse_content_versions` table:** create now, or reuse existing audit table?
3. **Revalidation strategy:** ISR `revalidate`, on-demand revalidation from MC, or realtime subscription?
4. **Auth gate:** is myStable SSR middleware already complete? Verify protected-route behavior.
5. **Stripe account:** which account / webhook endpoint / identity configuration?
6. **E-sign minimum:** checkbox+timestamp acceptable for v1, or require DocuSign/Adobe Sign?

## Files to Touch by Sprint

### Sprint A
- `apps/mission_control/src/components/horse-workspace.tsx`
- `apps/mission_control/src/lib/actions/publish-horse-content.ts` (new)
- `apps/web/src/lib/supabase-campaigns.ts` (new)
- `apps/web/src/lib/horses-data.ts` (deprecate or fallback)
- `apps/web/src/app/horses/[slug]/page.tsx`
- `apps/web/src/app/horses/[slug]/about/page.tsx`
- `apps/web/src/app/page.tsx`
- `apps/web/src/components/cap-table-card.tsx`
- `apps/web/src/components/pricing-card.tsx`
- `apps/web/src/components/thoroughbred-attributes.tsx`

### Sprint B
- `packages/db_models/src/schema/*.sql` (apply to live DB)
- `packages/db_models/src/types/database.types.ts` (regenerate)
- `supabase/config.toml` (if local)

### Sprint C
- `apps/web/src/app/api/checkout/route.ts` (new)
- `apps/web/src/app/api/billing/portal/route.ts` (new)
- `apps/web/src/app/api/webhooks/stripe/route.ts` (new)
- `apps/web/src/components/kyc-modal.tsx` (new)
- `apps/web/src/components/unit-selector.tsx` (new)

### Sprint D
- `packages/db_models/src/schema/00002_cap_table_and_reservations.sql` (add `horse_content_versions` or separate migration)
- `apps/web/src/components/sign-pds-sa-modal.tsx` (new)
- `apps/web/src/app/mystable/page.tsx`
- `packages/legal_engine/src/compiler.ts` (add signed-pack generation if needed)

## Starting Commands (Tomorrow)
```bash
cd /home/evo/new/evo_02
export PATH="/home/evo/.local/share/pnpm/bin:$PATH"
# Verify baseline before changes
pnpm turbo run test typecheck --force
```

## End-of-Session Lock
- Schema, legal engine, and MC intake are ready.
- Website still reads static fixtures; Supabase write/read is the first job.
- KYC/payment/sign-off are defined but not started.
- Do not mix sprints. Finish A before touching B; finish B before C; finish C before D.

Session ended 2026-08-21.
