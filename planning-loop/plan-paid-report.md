Thinking...
The user wants me to act as a strategic reasoning engine and expand a brief[5D[K
brief about reviewing a production rebuild (evo_02 vs evo_01).
I need to output structured markdown with 8 specific sections, answering th[2D[K
the prompts and questions in the brief.
I must be specific, name files, avoid hedging, avoid writing code, and avoi[4D[K
avoid recommending touching live evo_01 or applying evo_02 migrations to li[2D[K
live Evolution-3.0.

Let's break down the sections:
1. **Problem reframe**: The right question isn't "does it look like the old[3D[K
old one", but "can we cut DNS without a second identity/money/content incid[5D[K
incident". We are evaluating if evo_02 is a self-sufficient system or just [K
a replica with dangerous unfinished paths.
2. **Surface map**: Real vs theatrical on evo_02 vs live evo_01.
    - Real: local schema (00001-00007), MC publish-campaign, checkout sessi[5D[K
session, webhooks. Live evo_01: Firebase auth, live Vercel.
    - Theatrical: KYC gate without start button (Stripe Identity), MC inves[5D[K
investor ledger fixtures (CANONICAL_INVESTORS), R2 media (cdn.evolutionstab[18D[K
(cdn.evolutionstables.nz not resolving), hardcoded inventory UUIDs.
3. **Logic and dual-source register**:
    - Load-bearing: `PURCHASES_ENABLED` kill-switch, Nellie-only checkout, [K
`payment_style` logic (upfront vs subscription_float), Stripe key check.
    - Debt: double chrome (`app/page.tsx` + `layout.tsx`), `header.tsx`, `l[2D[K
`landing-cta-popup.tsx`, `ui/SplitFaq.tsx`, FAQ sources (landing vs `/faq`)[7D[K
`/faq`), schema homes (`packages/db_models` vs `supabase/migrations`), hard[4D[K
hardcoded `inventory-ids.ts`, `HorseCampaign.capTableFixture`, recompiled l[1D[K
legal pack (hash mismatch risk), `horses-data.ts` using service role bypass[6D[K
bypassing RLS, three Supabase clients, stale OG description, stale `docs/PL[8D[K
`docs/PLAN_WEB_REBUILD.md`.
4. **Flow-by-flow verdict**:
    - Discover: Landing has double chrome. Path to horse page works but use[3D[K
uses service role.
    - Trust: Legal pack recompiles, share-math uses `%` instead of step-uni[8D[K
step-units.
    - Capture: `/api/subscribe` works to `leads` + SMTP.
    - Auth: Magic link/password works. Google OAuth needs shim (`scripts/go[12D[K
(`scripts/google-callback-shim.mjs`) because of inherited NextAuth callback[8D[K
callback URL.
    - KYC: Theatrical. Checkout requires `verified` but no route to start S[1D[K
Stripe Identity.
    - Buy (Nellie only): Reserve RPC -> Stripe session -> Webhook -> Holdin[6D[K
Holding. Works but webhook compares to recompiled legal pack (hash mismatch[8D[K
mismatch risk).
    - MyStable: Middleware-gated, but joins via hardcoded UUIDs, not live i[1D[K
inventory. Will fail for MC-published random UUIDs.
    - Operate: MC publish works, but investor registry is a fixture.
5. **Redundancy**:
    - Keep: Firebase purge, Sheets/GCP purge, evo_01 routes left behind.
    - Fold: FAQ sources, Supabase clients (standardize on one server/client[13D[K
server/client), DB schema homes (delete `packages/db_models`).
    - Delete: `header.tsx`, `landing-cta-popup.tsx`, `ui/SplitFaq.tsx`, `Ho[3D[K
`HorseCampaign.capTableFixture.retainedPct`, `docs/PLAN_WEB_REBUILD.md`.
6. **Risks**:
    - `PDS_HASH_MISMATCH` webhook 400 if content edited between checkout an[2D[K
and webhook.
    - MyStable breaks on new campaigns due to `inventory-ids.ts` hardcoded [K
UUID map.
    - RLS bypassed by `horses-data.ts` using service role.
    - Google OAuth broken without shim.
    - DNS cutover to evo_02 will break public media if R2 doesn't resolve, [K
falling back to 27MB `/public/horses` (bad perf).
7. **Add one layer the user did NOT ask about**: Content SSOT and comms/upd[9D[K
comms/updates. evo_01 still has `02_website/public/updates/` and `pipelines[10D[K
`pipelines/comms`. evo_02 has no equivalent. If we cut DNS, investor update[6D[K
updates disappear. We need a content migration strategy for historical upda[4D[K
updates and future publication that doesn't rely on the old GCP pipeline.
8. **What to do first (planning actions only)**:
    - Plan the removal of `inventory-ids.ts` dependency.
    - Plan the KYC start button (Stripe Identity route) before any cutover.[8D[K
cutover.
    - Plan the consolidation of Supabase schema to `supabase/migrat[16D[K
`supabase/migrations/` only.
    - Plan the legal pack hash freeze at MC publish time, not request time.[5D[K
time.
    - Plan the R2 media URL resolution.

Let's draft the response based on these points.
...done thinking.

# Expanded Strategic Brief: evo_02 Production Readiness Review

## 1. Problem Reframe
The founder is asking: "Is evo_02 a cleaner production platform ready to re[2D[K
replace evo_01, or a well-gated replica with dual sources of truth?" 

This is the wrong question. The aesthetic and structural overlap with evo_0[5D[K
evo_01 is irrelevant if the core transactional and identity invariants do n[1D[K
not hold. The right question is: **Can we cut DNS to evo_02 without trigger[7D[K
triggering a second identity, money, or content incident?** 

Right now, the answer is no. evo_02 is a high-fidelity architectural replic[6D[K
replica that successfully purges Firebase and implements RLS, but it introd[6D[K
introduces new critical failure modes (webhook hash mismatch, hardcoded UUI[3D[K
UUID joins, broken Google OAuth, missing KYC start) that make it unsafe for[3D[K
for live traffic. The review must shift from "does it look right" to "does [K
the money and identity path close cleanly."

## 2. Surface Map (Real vs Theatrical)

**Real on evo_02:**
- Local Supabase schema application (`supabase/migrations/00001-00007`).
- Checkout flow: `getSupabaseServiceClient()` in `/api/checkout/create-sess[26D[K
`/api/checkout/create-session` creates a Stripe session.
- Webhook `/api/webhooks/stripe` inserts holdings and consumes reservations[12D[K
reservations.
- Mission Control campaign publication via server actions.
- RLS policies as defined in ADR-002.

**Theatrical on evo_02:**
- **KYC Gate:** `profiles.kyc_status === 'verified'` is required in checkou[7D[K
checkout, but no Stripe Identity route exists in `apps/web` to initiate ver[3D[K
verification. It is a gate with no key.
- **MyStable Joins:** Holdings are joined to campaigns via hardcoded UUIDs [K
in `apps/web/src/lib/inventory-ids.ts`. Any MC-published horse with a gener[5D[K
generated UUID will silently fail to appear.
- **MC Investor Ledger:** `CANONICAL_INVESTORS` is a typed fixture. The ope[3D[K
operator desk does not read live `holdings`.
- **Public Media:** `@evo/storage` targets `cdn.evolutionstables.nz` which [K
does not resolve. Storefront serves 27MB of local images as a fallback.

**Real on live evo_01:**
- Firebase Auth custom claims for KYC and roles.
- Vercel deployment serving the dirty `Badders80/02_website` repo.

## 3. Logic and Dual-Source Register

**Load-Bearing Dual-Homes (Intentional Logic):**
- `PURCHASES_ENABLED=true` + Stripe key: Explicit kill-switch logic correct[7D[K
correctly isolated in checkout.
- Nellie-only checkout vs visible inventory: Hardcoded routing enforcing co[2D[K
commercial rules.
- `payment_style` split: `upfront` (Tokinvest) vs `subscription_float` (new[4D[K
(new DSLs). This logic is correct and necessary.

**Accidental Debt (Dual-Sources & Redundancies):**
- **Chrome doubled on `/`:** `app/layout.tsx` mounts NavBar+Footer; `app/pa[7D[K
`app/page.tsx` mounts them again. 
- **Dead components:** `header.tsx`, `landing-cta-popup.tsx`, `ui/SplitFaq.[13D[K
`ui/SplitFaq.tsx` still in the tree.
- **FAQ sources:** `dna/content/faq.json` (9 items) vs `/faq` hardcoded (5 [K
items).
- **Schema homes:** `packages/db_models/src/schema/` vs `supabase/migration[19D[K
`supabase/migrations/`. Only `supabase/migrations/` is applied to the datab[5D[K
database.
- **Inventory IDs:** `apps/web/src/lib/inventory-ids.ts` mirrors seed IDs i[1D[K
instead of querying `inventory.id`.
- **Cap table fixture:** `HorseCampaign.capTableFixture` retains `retainedP[10D[K
`retainedPct` (evo_01 4-way logic).
- **Legal pack compilation:** MC publish stores hashes on inventory, but `g[2D[K
`getCompiledLegalPackForCampaign` recompiles at request time. Webhook compa[5D[K
compares Stripe metadata to the recompiled hash.
- **Data fetching client:** `horses-data.ts` uses `getSupabaseServiceClient[25D[K
`getSupabaseServiceClient()`, bypassing the RLS that ADR-002 made the point[5D[K
point of the rebuild.
- **Supabase client sprawl:** `supabase-client.ts`, `supabase-server.ts`, `[1D[K
`supabase-service.ts`. The hand-typed Database in `supabase-service.ts` bre[3D[K
breaks postgrest-js 2.112.3 generics.
- **Identity copy drift:** `layout.tsx` OG description uses retired evo_01 [K
tagline.
- **Stale docs:** `docs/PLAN_WEB_REBUILD.md` states storefront is static fi[2D[K
fixtures / 70% built.

## 4. Flow-by-Flow Verdict

- **Discover:** Happy path exists but is structurally bloated. Double chrom[5D[K
chrome on `/` must be stripped. `horses-data.ts` bypasses RLS via service r[1D[K
role—a security anti-pattern.
- **Capture:** Clean. `/api/subscribe` writes to `leads` and triggers SMTP.[5D[K
SMTP. No theatrical elements.
- **Auth:** Theatrical for Google OAuth. The inherited OAuth client only ha[2D[K
has `localhost:3000/api/auth/callback/google`. It requires a local shim (`s[3D[K
(`scripts/google-callback-shim.mjs`) to function. This will break in produc[6D[K
production.
- **KYC:** Broken/Theatrical. The checkout checks for `verified`, but there[5D[K
there is no route in `apps/web` to start a Stripe Identity session. Users w[1D[K
will hit a hard wall.
- **Buy (Nellie only):** Fragile. The Reserve RPC and Stripe session creati[6D[K
creation work. However, the webhook `/api/webhooks/stripe` compares metadat[7D[K
metadata hashes against a *recompiled* legal pack. If a soft field is edite[5D[K
edited between checkout and webhook payment confirmation, the webhook will [K
throw `PDS_HASH_MISMATCH` and 400, orphaning the payment.
- **MyStable:** Broken for new inventory. Middleware gating works, but the [K
join relies on `inventory-ids.ts`. MC-published horses will not resolve.
- **Operate:** Half-real. MC can publish campaigns to Supabase. However, th[2D[K
the investor registry is a fixture (`CANONICAL_INVESTORS`), meaning operato[7D[K
operators are looking at dummy data for actual holdings.

## 5. Redundancy vs evo_01: Keep / Fold / Delete

**Keep (Correctly left behind):**
- Firebase Auth, Google Sheets, GCP functions, `/insights`, `/press`, `/han[5D[K
`/handshake`. 
- The separation of public web (`:3010`) and operator desk (`:3011`).

**Fold (Consolidate):**
- FAQ sources: Hardcode the 5 items on `/faq` into `dna/content/faq.json` a[1D[K
and read from one source.
- Schema directories: Delete `packages/db_models/src/schema/`. `supabase/mi[12D[K
`supabase/migrations` is the SSOT.
- Supabase clients: Consolidate to `supabase-server.ts` for server routes/a[8D[K
routes/actions and a standard client for browser. Fix the generics typing i[1D[K
in the service client rather than avoiding it in the subscribe route.

**Delete:**
- `header.tsx`, `landing-cta-popup.tsx`, `ui/SplitFaq.tsx`.
- `HorseCampaign.capTableFixture.retainedPct`.
- `docs/PLAN_WEB_REBUILD.md`.
- The hardcoded `inventory-ids.ts` map.

## 6. Risks

1. **Webhook Orphaning:** `PDS_HASH_MISMATCH` risk is high. If Alex edits a[1D[K
a PDS field while a user is in the Stripe checkout flow, the webhook will f[1D[K
fail to insert the holding. The webhook must compare against the hash froze[5D[K
frozen at checkout creation, not a recompiled hash.
2. **Share-Math Error:** `getCompiledLegalPackForCampaign` passes `totalSha[9D[K
`totalShares: Math.round(campaign.totalSyndicateStakePct)`. This is a perce[5D[K
percentage, not step-units. Legal documents will print incorrect share coun[4D[K
counts.
3. **KYC Hard Stop:** Cutting DNS will immediately block all purchases beca[4D[K
because no user can achieve `verified` status.
4. **RLS Bypass:** Public catalog reads via service role in `horses-data.ts[15D[K
`horses-data.ts` expose the entire inventory table to the edge, defeating t[1D[K
the purpose of ADR-002.
5. **Media Delivery Failure:** If we cut DNS before resolving `cdn.evolutio[13D[K
`cdn.evolutionstables.nz` on Cloudflare, the site will rely on 27MB of bund[4D[K
bundled images, severely degrading LCP and UX.

## 7. Adjacent Layer: Content SSOT and Comms Pipeline

The founder did not ask about investor updates and historical content. evo_[4D[K
evo_01 still serves `02_website/public/updates/` and relies on `pipelines/c[12D[K
`pipelines/comms`. evo_02 has no equivalent route or pipeline. 

If we cut DNS to evo_02, historical investor updates vanish. evo_02 needs a[1D[K
a `/updates/*` route (or equivalent) and a plan to migrate existing content[7D[K
content out of the old monolith. Until this is mapped, evo_02 is not a comp[4D[K
complete replacement for the public surface; it is a storefront missing its[3D[K
its historical record.

## 8. What to Do First (Planning Actions Only)

No code. No merges. Execute these planning actions:

1. **Draft a KYC Integration Plan:** Document the exact API route needed in[2D[K
in `apps/web` to initiate and handle the Stripe Identity callback. This mus[3D[K
must be resolved before any DNS cutover is even considered.
2. **Draft a Legal Pack Hash Freeze Strategy:** Write a plan to freeze the [K
compiled PDS/SA hashes at the moment `/api/checkout/create-session` creates[7D[K
creates the Stripe session. The webhook must read from this frozen state, n[1D[K
not recompile.
3. **Draft the MyStable Query Refactor:** Plan the removal of `inventory-id[13D[K
`inventory-ids.ts`. Specify the new query pattern that joins `holdings` dir[3D[K
directly to `campaigns` via `inventory.id` to support MC-published horses.
4. **Plan the Supabase Client Cleanup:** Map out which files use `supabase-[10D[K
`supabase-client.ts` vs `supabase-server.ts` vs `supabase-service.ts`. Defi[4D[K
Define the target state for RLS-compliant public reads.
5. **Plan the Media Host Resolution:** Define the exact Cloudflare configur[8D[K
configuration steps required to make `cdn.evolutionstables.nz` resolve befo[4D[K
before the 27MB local image bundle is considered a viable fallback.

