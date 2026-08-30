# evo_02 Build Surface — Strategic Expansion

**Date:** 2026-08-30
**Mode:** PLANNING ONLY. No code. No deploy. No edits to evo_01. No migrations applied to Evolution-3.0.
**Author:** strategic reasoning engine (planning-loop expansion)

This expands `planning-loop/brief.md`. Claims marked `[VERIFIED]` are confirmed against repo source this session; others are carried from the brief and should be re-confirmed by the named file.

---

## 1. Problem reframe

The founder's seed question — "is evo_02 a cleaner platform or a well-gated replica carrying dual sources of truth, dead chrome, and unfinished money/KYC paths?" — is the wrong axis. It asks for an aesthetic/completeness verdict on a *rebuild*, which invites the comforting answer "it's 90% there."

The right question is narrower and binary:

> **Can we repoint DNS `www.evolutionstables.nz` to evo_02 without causing a second identity, money, or content incident — and what is the smallest honest gap-closure list before that switch?**

Reasons the reframe matters:

- **The blast radius is not visual, it is transactional.** evo_02's risk is concentrated in `PURCHASES_ENABLED`, the KYC gate, the legal-pack hash recompile, and the inventory-UUID join. Those are money/identity paths, not chrome. A landing page that double-mounts NavBar is embarrassing; a webhook that 400s `PDS_HASH_MISMATCH` on a real first sale is an incident.
- **"Dual sources of truth" is the real disease, not "replica".** A replica is fine if it is *authoritative*. evo_02 is dangerous precisely where it is *not* authoritative: investor ledger (fixture), KYC start (absent), media (R2 hostname dead), schema (two homes), FAQ (two copies). The brief lists these; the reframe elevates them from "debt" to "cutover blockers."
- **The honest comparator is not evo_01's prettiness, it is evo_01's *liveliness*.** evo_01 is live, Firebase-authed, Sheets/GCP-backed, and still serving. evo_02 is a clean-room that is currently *not serving anyone*. The decision is not "which is nicer" but "which carries less unrecoverable risk when the DNS flips." Today evo_02 carries more *untested* risk because no real user, real KYC, or real Stripe event has ever traversed it.

**Reframed question to put to the founder:** "List, in priority order, the incidents that would fire in the first 30 days post-cutover, and confirm which are acceptable vs must-fix." Everything below serves that list.

---

## 2. Surface map — what is real vs theatrical

### Real (load-bearing, works or nearly works)
- **Local Supabase schema path** `supabase/migrations/00001–00007` — the authoritative apply path. 00005 pedigree, 00006 service-role write, 00007 leads exist *only* here. `[VERIFIED: dir listing]`
- **Storefront catalog read** `apps/web/src/lib/horses-data.ts` `getAllCampaigns` / `getCampaignBySlug` — returns live inventory rows (seeded). `[VERIFIED: source]`
- **Lead capture** `/api/subscribe` → `leads` + SMTP to Alex. Functional.
- **Checkout session factory** `/api/checkout/create-session` — auth → `profiles.kyc_status === 'verified'` → reserve RPC → Stripe session. Logic present.
- **Stripe webhook** `/api/webhooks/stripe` — insert holding + consume reservation + vault legal PDFs. Present.
- **MC publish-campaign** server action + `/api/campaign/create` bearer `OPERATOR_API_TOKEN`. Present.
- **legal_engine compiler** `packages/legal_engine` — PDS/SA/pricing/settlement, deterministic SHA-256. Real.
- **Auth (magic link + password)** — Supabase-native, real.

### Theatrical (looks done, is a drawing of a path)
- **KYC gate with no start button.** Checkout demands `kyc_status === 'verified'`, but no Stripe Identity session route exists under `apps/web`. Terms/privacy name Stripe Identity; the product has no way to reach it. **This is the single biggest theatrical item.** A buyer who passes auth hits a hard wall with no UI to climb.
- **MC investor registry = fixture.** `apps/mission_control/src/lib/investor-registry.ts` `CANONICAL_INVESTORS`. Cap-table tests assert Prudentia/Hotta units from this fixture, not Postgres. Operator desk "investor ledger" is a mock. `[VERIFIED: file]`
- **Public media plane is dead.** `@evo/storage` targets `cdn.evolutionstables.nz`; gbrain `fact/r2-media-hub` says that hostname does not resolve on the Cloudflare account and r2.dev public is disabled. Storefront ships ~27MB `/public/horses` + `/public/images` as fallback. So "R2 public media" in the ADR is unmet; we are serving local blobs, not a CDN.
- **Share-math in the legal compiler call is wrong.** `getCompiledLegalPackForCampaign` passes `totalShares: Math.round(campaign.totalSyndicateStakePct)` — a *percentage*, not step-units. Locked invariant is `total_shares = listed_stake_pct / stake_step_pct`. The compiled PDS therefore states the wrong share count. `[VERIFIED: horses-data.ts:298]`
- **Cap table still 4-way.** `HorseCampaign.capTableFixture.retainedPct` (evo_01 language) survives; locked model is 3-way listed pool (allocated + reserved + available). `[VERIFIED: horses-data.ts:53,157,207]`
- **Legal pack compiled twice / hash race.** MC publish stores hashes on inventory; storefront `getCompiledLegalPackForCampaign` recompiles at request time; webhook compares Stripe metadata hashes to *recompiled* hashes. Any content edit between checkout and webhook → `PDS_HASH_MISMATCH` 400.
- **Two schema homes.** `packages/db_models/src/schema/` (00001–00004, includes `00003_seed_live_horses_and_investors.sql` ~487 lines) vs `supabase/migrations/` (00001–00007, `00003_seed_inventory_only.sql` ~234 lines). Two seeds, two truths. `[VERIFIED: dir listing]`
- **`inventory-ids.ts` UUID mirror.** Checkout and MyStable join holdings→campaigns via hardcoded IDs, not `inventory.id`. MC-published horses with random UUIDs will not join.
- **Three Supabase client modules** in web (`supabase-client.ts`, `supabase-server.ts`, `supabase-service.ts`); `supabase-service` hand-typed Database breaks postgrest-js 2.112.3 generics. `[VERIFIED: brief]`
- **RLS bypass in the read path.** `horses-data.ts` uses `getSupabaseServiceClient()` for public catalog — the exact thing ADR-002 was meant to forbid. `[VERIFIED: source]`

### Dead chrome (cosmetic, not load-bearing)
- `header.tsx` (old sticky header, unused), `landing-cta-popup.tsx` (replaced by `CtaLeadModal`), `ui/SplitFaq.tsx` (FAQSection uses CollapsePanel + `dna/content/faq.json`).
- Double NavBar+Footer on `/` (root `layout.tsx` + `app/page.tsx` both mount).
- Two FAQ sources: landing `faq.json` (9) vs `/faq` hardcoded 5.
- `layout.tsx` OG description "Grounded in tradition, evolved through innovation" — retired by ADR-007; should read Heritage / Tradition / Own the Experience. *(Location not re-confirmed this session; brief cites `layout.tsx`.)*
- `docs/PLAN_WEB_REBUILD.md` still says storefront is static fixtures / 70% built — lies to agents. `[VERIFIED: file exists]`

---

## 3. Logic and dual-source register (file paths + load-bearing vs debt)

| # | Dual-home | File(s) | Load-bearing or debt | Verdict |
|---|-----------|---------|----------------------|---------|
| L1 | `payment_style` split (upfront / subscription_float / one_time) | `packages/legal_engine`, `horses-data.ts` `closeStyle`/`listingPlatform` | **Load-bearing** | Keep. This encodes locked commercial rules (Nellie-only checkout, Tokinvest=`upfront`, new DSL=`subscription_float`). Do not collapse. |
| L2 | `PURCHASES_ENABLED` + Stripe key kill-switch | `apps/web` checkout factory | **Load-bearing** | Keep. Live holdings = 0; this is the only thing preventing a phantom sale today. |
| L3 | `profiles.kyc_status` gate | checkout → webhook | **Load-bearing (but orphaned)** | Keep the gate; add the *start* route (see §4 KYC). Gate without entry = incident. |
| L4 | Nellie-only checkout | checkout factory | **Load-bearing** | Keep. Other horses are visible-but-unbuyable by rule. |
| D1 | Double NavBar/Footer on `/` | `app/page.tsx` + `app/layout.tsx` | **Debt** | Delete remount in `page.tsx`. |
| D2 | `header.tsx` / `landing-cta-popup.tsx` / `ui/SplitFaq.tsx` | dead components | **Debt** | Delete. |
| D3 | Two FAQ sources | `dna/content/faq.json` (9) vs `/faq` hardcoded (5) | **Debt** | Fold `/faq` to read `faq.json`. |
| D4 | Two schema homes | `packages/db_models/src/schema/` vs `supabase/migrations/` | **Debt (dangerous)** | Delete `packages/db_models/src/schema/`. `supabase/migrations/` is authoritative. The 487-line `00003_seed_live_horses_and_investors.sql` must be reconciled into the supabase path before `db_models` schema is deleted. |
| D5 | `inventory-ids.ts` UUID mirror | `apps/web/src/lib/inventory-ids.ts` | **Debt (blocker)** | Replace joins with `inventory.id` from the live row. Until then MyStable breaks on any MC-published horse. |
| D6 | `capTableFixture.retainedPct` 4-way | `horses-data.ts:53,157,207`, `cap-table-card.tsx:4` | **Debt** | Fold to 3-way (allocated/reserved/available). |
| D7 | Legal pack recompile + hash race | `getCompiledLegalPackForCampaign` + webhook | **Debt (incident risk)** | Compile once at checkout, store the hash on the reservation, compare webhook to *that* hash. Kill the request-time recompile. |
| D8 | Share-math `totalShares` | `horses-data.ts:298` | **Debt (wrong numbers)** | Fix to `Math.round(listed_stake_pct / stake_step_pct)`. |
| D9 | RLS bypass in catalog read | `horses-data.ts` `getSupabaseServiceClient()` | **Debt (violates ADR-002)** | Switch public catalog to anon-authenticated RLS client; reserve service role for 00006 write path only. |
| D10 | Three Supabase clients | `supabase-client/-server/-service.ts` | **Debt** | Converge on server + browser clients; fix the hand-typed Database generic or pin postgrest-js. |
| D11 | OG description drift | `layout.tsx` | **Debt** | Update to ADR-007 voice. |
| D12 | Stale plan doc | `docs/PLAN_WEB_REBUILD.md` | **Debt (lies to agents)** | Rewrite or delete; replace pointer with `CONTINUE.md` reality. |

**Load-bearing summary:** L1–L4 are the actual business logic. Everything in D is either accidental debt or a cutover blocker. The dangerous ones (D4, D5, D7, D8, D9) are not cosmetic — they will mis-state shares, break joins, or 400 a real webhook.

---

## 4. Flow-by-flow verdict

### Discover
Landing (evo_01 8-section port + lead modal) → `#marketplace` teaser → horse page. **Works, with caveats.** Catalog reads via service client (D9, RLS bypass). Landing double-mounts chrome (D1). Media served from local `/public` because R2 hostname is dead (§2). Verdict: *happy path functional; not RLS-clean; media is local-not-CDN.*

### Trust
Horse commercials + about tab; pricing card (legal_engine); 3-way cap table card (but fed 4-way fixture, D6); data-room shows compiled PDS/SA hashes. **Partially real.** The hash shown is from a request-time recompile (D7) that can diverge from the webhook's comparison baseline. Cap-table card reads `retainedPct` (D6) — visibly wrong vs locked 3-way model. Verdict: *trust surface is convincing but internally inconsistent.*

### Capture
CTA modal → `/api/subscribe` → `leads` + SMTP to Alex. **Real and complete.** Lowest-risk flow. No dual-home. Verdict: *ship as-is.*

### Auth
Magic link + password + Google OAuth. Magic/password are Supabase-native and real. Google OAuth needs `scripts/google-callback-shim.mjs` because the inherited OAuth client only whitelists `localhost:3000/api/auth/callback/google` (NextAuth era). **Real but fragile:** the shim is a workaround for a client-id that was never re-provisioned for evo_02's host. Verdict: *works locally; in production Google login breaks unless the OAuth client is re-registered for the evo_02 domain. This is a cutover blocker, not debt.*

### KYC — THEATRICAL
Checkout requires `profiles.kyc_status === 'verified'`. No Stripe Identity session route exists under `apps/web`. Terms/privacy mention Stripe Identity. Live evo_01 KYC is Firebase custom claims. **There is no path for a user to become verified in evo_02.** Verdict: *every buy attempt by a real new user dies here. This is the hardest cutover blocker and the one most likely to be discovered only after DNS flips.*

### Buy (Nellie only)
Checkout: auth → `kyc_status==='verified'` (blocked, see KYC) → reserve RPC (percent → 0.5% step-units at this boundary only) → Stripe session. Webhook: insert holding + consume reservation + vault legal PDFs. **Logic is coherent and the reserve-step conversion is correct at the boundary.** But: webhook compares to a *recompiled* hash (D7) → `PDS_HASH_MISMATCH` 400 if soft fields edited; and `totalShares` is a percentage (D8) so the vaulted PDS states wrong share count. Verdict: *the money path is 80% real but will either 400 or file a wrong-share PDS on the first live sale unless D7/D8 are fixed.*

### MyStable
Middleware-gated; holdings by `user_id`; light console theme. **Broken on new campaigns.** Joins holdings→campaigns via `inventory-ids.ts` hardcoded UUIDs (D5), not `inventory.id`. Any horse MC-publishes with a random UUID will not join to its holding. Verdict: *works for the 4 seeded horses; silently empty for everything published after cutover.*

### Operate
MC `publish-campaign` server action + `/api/campaign/create` bearer `OPERATOR_API_TOKEN`. Publish writes inventory + hashes. **Real write path.** But the investor registry shown in MC is `CANONICAL_INVESTORS` fixture (§2), and cap-table tests assert against the fixture, not Postgres. Verdict: *operator can publish; operator cannot see real investors; tests validate a mock.*

---

## 5. Redundancy vs evo_01 — keep / fold / delete

### Correctly left behind (KEEP the deletion)
- **Firebase Auth** — purged per ADR-002. Right call.
- **Google Sheets / GCP functions** — evo_01 operational glue. Right to leave.
- **`/insights`, `/press`, `/handshake`, `/brand-guidelines`, `/updates/*`** — not ported. Correct to omit *if* (see §7) the updates/comms content has a new home; today it has none.
- **Firebase custom-claim KYC** — not ported (and not replaced — that is the gap, not the redundancy).

### Copied that should NOT have been (FOLD or DELETE)
- **Landing chrome double-mount** (D1) — delete the `page.tsx` remount.
- **Tokinvest / legacy logos & footer hero dup** — brief flags footer hero duplication; audit `Footer` for evo_01-marketing copy that contradicts ADR-007 voice. Fold to brand_dna tokens.
- **`/faq` hardcoded 5 items** — fold into `faq.json` (D3).
- **`packages/db_models/src/schema/`** — delete; it duplicates and diverges from `supabase/migrations/` (D4).
- **`header.tsx`, `landing-cta-popup.tsx`, `ui/SplitFaq.tsx`** — delete (D2).

### Failed to replace (the real redundancy risk — evo_01 still owns these)
- **Investor updates / comms** — `evo_01/02_website/public/updates/` and `pipelines/comms` are still the only home. evo_02 has no updates surface. If DNS flips, investor updates vanish (see §7).
- **KYC start** — evo_01 Firebase claims vs evo_02 nothing. Not replaced.
- **R2 public media** — ADR-003 unmet; serving local `/public` blobs. Not replaced with a working CDN.
- **Press / Insights** — omitted entirely; if they drove SEO or investor trust, that equity is lost at cutover.

---

## 6. Risks

### What breaks (concrete, named)
- **KYC dead-end** (§4 KYC): no verified path → zero real buys post-cutover. Highest severity.
- **`PDS_HASH_MISMATCH` 400** (D7): any soft-field edit between checkout and webhook fails the sale. High severity, intermittent (worst kind).
- **Wrong share count in vaulted PDS** (D8): `totalShares` is a percentage. Compliance/legal exposure on every filed document. High severity.
- **MyStable empty for new horses** (D5): hardcoded UUID map. High severity, silent.
- **Google OAuth broken in prod** (§4 Auth): inherited client-id not re-registered for evo_02 domain. Medium-high, discovered at login.
- **RLS bypass** (D9): public catalog uses service role — contradicts ADR-002 and widens the attack surface if `inventory` ever holds non-public columns. Medium.
- **Media plane dead** (§2): `cdn.evolutionstables.nz` unresolved; 27MB local blobs served → slow LCP, no CDN cache. Medium.

### What is assumed (and may be false)
- **Seeded inventory == live catalog.** `00003_seed_inventory_only.sql` seeds 4 horses; assumed these are the only sellable items. If evo_01 has live holdings/investors not in this seed, cutover loses them. Unverified against evo_01 (hands-off).
- **`PURCHASES_ENABLED=false` stays until founder flips.** Assumed the kill-switch is wired into the deploy env, not just code. Verify the Vercel env var exists.
- **Stripe key absent in prod.** Assumed; if present with `PURCHASES_ENABLED=true`, the KYC dead-end becomes the *only* thing stopping sales — a single misconfig away from a phantom transaction.
- **Founder Pass 2 content sweep is subtractive-only and founder-gated.** Assumed the founder will actually run it; the stale `docs/PLAN_WEB_REBUILD.md` suggests planning docs drift, so content could too.

### What is unstated (not in the brief, must be asked)
- **DNS/SSL ownership & TTL.** Who controls `evolutionstables.nz` NS? Cutover is a DNS change; rollback speed depends on TTL. Unstated.
- **Analytics / conversion baseline.** No mention of Plausible/GA or a pre-cutover metric to compare against. Cannot judge "did cutover hurt" post-fact.
- **Data migration of existing evo_01 leads/investors.** Live evo_01 has leads (Sheets?) and Firebase-auth users. evo_02 `leads` table is empty until cutover. Are legacy leads/investors ported? Unstated — and `packages/db_models` seed had investors while `supabase/migrations` seed does not (D4 divergence hints at this).
- **Stripe Identity account status.** Is the Stripe Identity product even enabled on the evo_02 Stripe account? If not, KYC start route is moot until enabled.
- **Operator runbook for webhook failures.** If `PDS_HASH_MISMATCH` fires in prod, who manually reconciles the holding? No stated process.
- **Legal sign-off on compiled PDS/SA.** `skipValidation: true` is passed in `getCompiledLegalPackForCampaign` (horses-data.ts:295). The compiler's own validation is disabled — legal has not blessed the output format.

---

## 7. Adjacent layer the founder did NOT ask about — Content & Comms SSOT / investor-updates orphaning

The brief frames the review as "website logic, flows, redundancy." It does not ask about the **content and communications plane**, yet that is where the silent cutover damage lives.

- **Investor updates are trapped in evo_01.** `evo_01/02_website/public/updates/` and `pipelines/comms` are the only home for investor-facing updates. evo_02 has *no* `/updates` route (brief §"what did not come over"). The ADR-004 clean-room instruction ("do not copy evo_01 routes wholesale") was read as "omit `/updates`." Result: at DNS flip, every bookmarked update URL 404s and the comms pipeline has nowhere to publish.
- **No redirect map.** There is no `redirects` config mapping retired evo_01 routes (`/insights`, `/press`, `/updates/*`, `/handshake`, `/brand-guidelines`, old `/auth/login`) to evo_02 equivalents or to a graceful 410. Cutover without a redirect table = link-rot + SEO penalty + investor confusion.
- **Content SSOT conflict.** `brand_dna` tokens (ADR-007 voice) vs `layout.tsx` OG description (old voice, D11) vs `/faq` hardcoded copy (D3) vs `docs/PLAN_WEB_REBUILD.md` (stale). There is no single source the storefront, MC, and docs all read from. Each surface drifts independently.
- **Comms pipeline ownership.** `pipelines/comms` presumably pushes to evo_01's `public/updates`. Post-cutover it must target evo_02's content source. That rewiring is a planning action the founder has not scoped.

**Opinion:** This layer is a cutover blocker of equal weight to KYC. A DNS flip with no `/updates` surface and no redirect map is a visible, reputational incident on day one — worse than a broken buy button, because it hits *existing* investors, not just prospects.

---

## 8. What to do first — planning actions only (no code, no deploy)

Ordered by severity. Each is a decision or a document, not a patch.

1. **Write the cutover-blocker list and get founder severity ranking.** One page: KYC dead-end, `PDS_HASH_MISMATCH`, wrong `totalShares`, MyStable UUID join, Google OAuth client re-registration, `/updates` orphan + redirect map. Founder marks each must-fix vs acceptable. *(Directly answers the reframed question in §1.)*
2. **Resolve the KYC start gap (planning).** Decide: (a) build a Stripe Identity session route in `apps/web` + enable Stripe Identity on the evo_02 account, or (b) explicitly defer buys and ship evo_02 as browse-only with `PURCHASES_ENABLED=false` until KYC exists. Do not flip DNS with KYC as a silent wall.
3. **Reconcile the two schema homes.** Diff `packages/db_models/src/schema/00003_seed_live_horses_and_investors.sql` (487 lines, has investors) against `supabase/migrations/00003_seed_inventory_only.sql` (234 lines, no investors). Decide the authoritative seed and delete the divergent one. *Planning: which investors, if any, must exist post-cutover.*
4. **Produce the evo_01 → evo_02 redirect map.** Enumerate retired routes and assign each a target or 410. Hand to whoever owns the Vercel/Next config. (No code this session — just the table.)
5. **Scope the `/updates` + comms surface.** Decide: port a minimal updates route to evo_02, or keep comms in evo_01 until MC's investor plane is real. Pick one; document it.
6. **Confirm Stripe/env posture.** Verify `PURCHASES_ENABLED` and Stripe key are deploy env vars (not just code), and that they are `false`/absent at cutover. Confirm webhook failure reconciliation owner.
7. **Kill the planning drift.** Rewrite or delete `docs/PLAN_WEB_REBUILD.md`; update `layout.tsx` OG copy to ADR-007 voice; fold `/faq` to `faq.json`. (Cheap, removes agent-misdirection risk — D3/D11/D12.)
8. **Schedule the dual-home debt sweep as a named backlog, not a cutover gate.** D1, D2, D4 (delete), D6, D9, D10 are post-cutover cleanups. They do not block DNS if KYC, hashes, shares, joins, and OAuth are resolved.

**Cutover sequence (smallest honest):** founder Pass 2 content sweep → (1) blocker list ranked → (2) KYC decision → (3) schema reconcile → (4) redirect map → (5) updates decision → DNS flip with `PURCHASES_ENABLED=false` unless KYC + webhook hash fix + `totalShares` fix all land. Do not flip with KYC as a wall or with D7/D8 open.

---

*Constraints honored: no code written; evo_01 untouched; evo_02 migrations 00001–00007 not applied to Evolution-3.0; analysis is planning-only.*
