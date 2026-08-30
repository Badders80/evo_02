Thinking: The user wants me to read a brief file and then provide a strategic analysis of a production rebuild. Let me start by reading the brief file to understand the context.
Thinking: Now I have the brief. Let me analyze it carefully and provide the structured markdown response as requested. I need to:

1. Reframe the problem
2. Surface map - real vs theatrical
3. Logic and dual-source register
4. Flow-by-flow verdict
5. Redundancy - keep/fold/delete
6. Risks
7. Adjacent layer not asked about
8. What to do first (planning actions only)

Let me be specific, name files, and not hedge.
# 1. Problem Reframe

**The user is asking the wrong question.** "Does evo_02 look like evo_01?" is cosmetic. The real question: **Can we cut DNS to evo_02 without a second identity/money/content incident?**

evo_01 still runs on Firebase Auth + Firestore + GCP Functions + Sheets. evo_02 is Supabase Auth + Postgres + RLS + R2. There is **zero shared identity plane**. The cutover is not a deploy — it is a **data migration with user-facing auth breakage**. Every live user must re-authenticate. Every holding must be re-verified. The "Nellie-only" kill switch (`PURCHASES_ENABLED`) masks that the buy path is untested end-to-end with real Stripe + real KYC + real webhook → holding insert.

# 2. Surface Map: Real vs Theatrical

| Surface | Real (works now) | Theatrical (drawing of a path) |
|---------|------------------|--------------------------------|
| **Landing `/`** | 8-section sequence rendered, lead modal submits to `/api/subscribe` → `leads` table + SMTP | Double NavBar/Footer mount (`app/layout.tsx` + `app/page.tsx` both mount) |
| **Horse page `/horses/[slug]`** | Commercial data from `getCampaignBySlug` (service-role bypass), pricing card, cap table, data-room hashes | Cap table still uses `capTableFixture.retainedPct` (4-way evo_01) not 3-way locked model |
| **Auth** | Magic link, password, Google OAuth all compile; `scripts/google-callback-shim.mjs` handles legacy redirect | Google OAuth client only has `localhost:3000/api/auth/callback/google` — production callback URL not configured |
| **KYC gate** | `profiles.kyc_status === 'verified'` checked in checkout | **No Stripe Identity session route exists**; no "Start KYC" button; no webhook to flip `kyc_status` |
| **Checkout (Nellie)** | `create-session` → auth → KYC check → reserve RPC → Stripe session | Reserve RPC uses **percent → step-unit conversion at boundary only** (not in compiler); webhook consumes reservation + inserts holding — **never tested with live Stripe** |
| **MyStable** | Middleware-gated, reads `holdings` by `user_id`, light theme | Joins via hardcoded `inventory-ids.ts` UUID map — **MC-published horses with random UUIDs will not appear** |
| **Mission Control** | Publish-campaign server action + `/api/campaign/create` (bearer `OPERATOR_API_TOKEN`) | Investor registry = typed fixture `CANONICAL_INVESTORS`; cap-table tests assert against fixture, not Postgres |
| **Media** | `@evo/storage` targets `cdn.evolutionstables.nz` | Hostname **does not resolve**; r2.dev public disabled; **~27MB ships in `/public/horses` + `/public/images`** |

# 3. Logic & Dual-Source Register (Load-Bearing vs Debt)

| Dual-Home | Files | Load-Bearing? | Verdict |
|-----------|-------|---------------|---------|
| **Chrome double-mount** | `apps/web/app/layout.tsx:18-22` (NavBar+Footer) + `apps/web/app/page.tsx:35-38` (NavBar+Footer again) | **Debt** | Delete from `page.tsx` |
| **Two FAQ sources** | `apps/web/src/dna/content/faq.json` (9 items) vs `apps/web/app/faq/page.tsx` hardcoded 5 items | **Debt** | Single source: `faq.json`; delete hardcoded |
| **Two schema dirs** | `packages/db_models/src/schema/00001-00004.sql` (incl `00003_seed_live_horses_and_investors.sql` 487 lines) vs `supabase/migrations/00001-00007.sql` (00003 = `seed_inventory_only.sql` 234 lines; 00005-00007 only here) | **Load-bearing divergence** | `supabase/migrations` is the canonical apply path; `packages/db_models` is stale artifact — **delete `packages/db_models/src/schema/`** |
| **Hardcoded UUID map** | `apps/web/src/lib/inventory-ids.ts` mirrors seed IDs; checkout + MyStable join via this map | **Load-bearing** (current happy path depends on it) | **Must replace with `inventory.id` FK** before any MC-published horse goes live |
| **Cap table 4→3 way** | `packages/legal_engine/src/types.ts` `HorseCampaign.capTableFixture.retainedPct` | **Debt** | Remove `retainedPct`; enforce 3-way (allocated + reserved + available) |
| **Legal pack double-compile** | MC: `apps/mission_control/src/actions/publish-campaign.ts` stores hashes on inventory; Storefront: `apps/web/src/lib/legal-pack.ts:getCompiledLegalPackForCampaign` recompiles at request time; Webhook: compares Stripe metadata to **recompiled** hashes | **Load-bearing risk** | **Single compile at publish**; store compiled PDF + hashes on `inventory`; webhook compares to stored hashes only |
| **Share math error** | `legal-pack.ts:47` `totalShares: Math.round(campaign.totalSyndicateStakePct)` (percentage, not step-units) | **Load-bearing bug** | Fix to `total_shares = listed_stake_pct / stake_step_pct` (stake_step_pct = 0.5) |
| **Service-role public catalog** | `apps/web/src/lib/horses-data.ts` `getAllCampaigns` / `getCampaignBySlug` use `getSupabaseServiceClient()` | **Debt** (violates ADR-002 RLS) | Replace with anon client + RLS policies; add `public_campaigns` view if needed |
| **Three Supabase clients** | `supabase-client.ts` (anon), `supabase-server.ts` (server anon), `supabase-service.ts` (service role, hand-typed Database breaks generics) | **Debt** | Consolidate to two: anon (client/server) + service (admin only); fix generics or drop hand-typed |
| **Identity copy drift** | `apps/web/app/layout.tsx` OG description still "Grounded in tradition..." | **Debt** | Update to ADR-007 / `doc/IDENTITY.md` (Heritage / Tradition / Own the Experience) |
| **Stale planning docs** | `docs/PLAN_WEB_REBUILD.md` says static fixtures / 70% built | **Debt** | Delete or archive; agents follow wrong file |
| **KYC gate no start** | Checkout checks `kyc_status`; no `/api/kyc/start` route; no Stripe Identity webhook | **Load-bearing gap** | **Must build** before any real purchase |

# 4. Flow-by-Flow Verdict

### Discover (Landing → Marketplace Teaser → Horse Page)
- **Happy path:** Lands, scrolls, clicks CTA → modal → `/api/subscribe` → `leads` + email to Alex. Works.
- **Break:** Double chrome on `/` only. Horse pages clean.
- **Gap:** No `/marketplace` route (evo_01 had dedicated page). Teaser anchor `#marketplace` goes nowhere.

### Capture (CTA Modal → `/api/subscribe` → Leads + SMTP)
- **Happy path:** Modal submits, writes `leads` table, sends email via Resend/SMTP. Works.
- **Risk:** No rate limit, no honeypot, no reCAPTCHA. Spam vector.

### Auth (Magic Link + Password + Google OAuth)
- **Happy path:** Magic link + password work against Supabase Auth. Google OAuth compiles.
- **Break:** `scripts/google-callback-shim.mjs` required because **production Google OAuth client missing callback URL**. No prod callback = Google sign-in fails in production.
- **Gap:** No account linking (Firebase UID → Supabase UUID). Cutover = every user re-authenticates.

### KYC (Gate Only)
- **Happy path:** None. **Gate exists (`kyc_status === 'verified'`), start button does not.**
- **Missing:** `/api/kyc/start` → Stripe Identity session → redirect back → webhook flips `kyc_status`.
- **Assumption:** "We'll add it before Nellie launches." Unstated: Stripe Identity pricing, fallback if Stripe Identity unavailable, manual review queue.

### Buy (Nellie Only)
- **Happy path (local):** Auth → KYC verified → reserve RPC (percent→step-unit) → Stripe Checkout session created.
- **Break points:**
  1. Reserve RPC conversion at boundary only — compiler still uses percentage.
  2. Webhook: inserts holding + consumes reservation + vaults legal PDFs. **Never tested with live Stripe.**
  3. Legal hash comparison uses **recompiled** hashes → `PDS_HASH_MISMATCH` if content edits between checkout and webhook.
  4. `inventory-ids.ts` UUID map — if Nellie's slug changes or UUID regenerates, checkout breaks.
- **Kill switch:** `PURCHASES_ENABLED=true` + Stripe key. Currently false. Live holdings = 0.

### MyStable
- **Happy path:** Middleware gates, reads `holdings` by `user_id`, renders light console.
- **Break:** Joins `holdings` → `campaigns` via `inventory-ids.ts` map. **MC-published horses with random UUIDs invisible.**
- **Gap:** No secondary market, no transfer, no documents download (legal pack download exists at `/api/legal/download` but untested).

### Operate (Mission Control)
- **Happy path:** Publish campaign → server action compiles legal pack → writes to `inventory` with hashes → `/api/campaign/create` (bearer token) creates campaign row.
- **Break:** Investor registry = `CANONICAL_INVESTORS` fixture. Cap-table tests assert against fixture. **No live `holdings` read.**
- **Gap:** No operator KYC review queue, no payout scheduling, no investor comms from MC.

# 5. Redundancy: Keep / Fold / Delete vs evo_01

| Item | Keep | Fold | Delete | Notes |
|------|------|------|--------|-------|
| Firebase Auth | | | ✅ | ADR-002 done |
| Firestore / GCP Functions | | | ✅ | ADR-002 done |
| Sheets-backed investor ledger | | | ✅ | Replaced by `holdings` + `profiles` |
| `/insights` (blog) | | | ✅ | Not in evo_02; no replacement planned |
| `/press` | | | ✅ | Not in evo_02; no replacement planned |
| `/handshake` (partner portal) | | | ✅ | Not in evo_02; no replacement planned |
| `/brand-guidelines` | | | ✅ | Replaced by `packages/brand_dna` (internal) |
| `/updates/*` (comms) | | | ✅ | **Trapped in evo_01 `public/updates/` + `pipelines/comms` — no evo_02 equivalent** |
| `/auth/login` (Firebase) | | | ✅ | Replaced by `/login` (Supabase) |
| Landing 8-section sequence | ✅ | | | Ported; works |
| Tokinvest logos on horse cards | | | ✅ | **Copied from evo_01; locked model = Evolution Stables only** |
| Footer hero duplicate | | | ✅ | Double mount on `/` only |
| `header.tsx` (old sticky) | | | ✅ | Dead component in tree |
| `landing-cta-popup.tsx` | | | ✅ | Replaced by `CtaLeadModal` |
| `ui/SplitFaq.tsx` | | | ✅ | Replaced by `CollapsePanel` + `faq.json` |
| Investor updates / comms | | ✅ | | **Must rebuild in evo_02** (MC or separate) |
| KYC start flow | | ✅ | | **Must build** (Stripe Identity) |
| R2 public media (CDN) | | ✅ | | **Must configure** `cdn.evolutionstables.nz` + enable r2.dev public |
| Press / insights content | | ✅ | | **Must decide**: rebuild or retire |

# 6. Risks

| Risk | Location | Cause | Impact |
|------|----------|-------|--------|
| **Auth cutover breakage** | All users | No Firebase → Supabase migration path; no account linking | 100% of live users locked out until password reset / magic link |
| **KYC gate impassable** | Buy flow | No `/api/kyc/start`, no Stripe Identity webhook | Zero purchases possible even with `PURCHASES_ENABLED=true` |
| **UUID map drift** | Checkout, MyStable, MC publish | `inventory-ids.ts` hardcoded; MC publishes random UUIDs | New horses invisible to buyers; MyStable shows empty for new holdings |
| **Legal hash mismatch** | Webhook | Recompiles at request time vs stored at publish | `PDS_HASH_MISMATCH` 400 on legitimate purchases if content edited |
| **Share math wrong** | Legal compiler | `totalShares = percentage` not step-units | Legal PDFs show wrong share count; regulatory risk |
| **Service-role bypass** | Public catalog | `getSupabaseServiceClient()` in `horses-data.ts` | RLS policies ineffective; data exposure if policies added later |
| **CDN hostname broken** | All media | `cdn.evolutionstables.nz` doesn't resolve; r2.dev disabled | 27MB in repo; slow loads; no cache invalidation |
| **Google OAuth prod broken** | Auth | Callback URL only `localhost:3000` | Google sign-in fails in production |
| **MC investor ledger fake** | Operate | `CANONICAL_INVESTORS` fixture; tests assert fixture | Operator cannot see real holdings; payouts impossible |
| **Stale docs mislead agents** | `docs/PLAN_WEB_REBUILD.md` | Says static fixtures / 70% built | Future agents build against wrong assumptions |
| **No rate limit on capture** | `/api/subscribe` | Open endpoint | Spam → SMTP reputation damage |
| **No monitoring/alerting** | All flows | No observability skill applied | Silent failures in production |

**Unstated assumptions:**
- Stripe Identity will be approved and configured before launch
- Founder Pass 2 content sweep is subtractive only — no new pages
- `design-alignment` branch merge = founder sign-off on visual parity
- Live Supabase project (Evolution-3.0) will get `profiles` table via separate migration (not 00001–00007)
- Nellie is the only horse ever sold on this platform (no multi-horse checkout path needed)

# 7. Adjacent Layer Not Asked About: **Identity Cutover & Comms Plane**

The founder asked about "the new website." They did not ask about:

**Identity cutover plane** — How 100+ live Firebase users become Supabase users. No migration script exists. No communication plan. No fallback. This is a **product incident waiting to happen**, not a technical detail.

**Comms/updates plane** — evo_01 has `/updates/*` (markdown files in `public/updates/`) and `pipelines/comms` (email templates, send logic). evo_02 has **zero** equivalent. Investor updates, press releases, product announcements — all trapped in evo_01. If DNS cuts, comms die.

**Operator vs public data plane separation** — MC uses service role + fixture data. Public uses service role bypassing RLS. There is **no clean read-replica or public API layer**. The "operator desk" and "public storefront" share the same Supabase project with no boundary. One bad MC query locks the storefront.

**Docs that lie** — `docs/PLAN_WEB_REBUILD.md` claims static fixtures. `CONTINUE.md` claims 10/10 gates passed. Kimi audit WARN. Agents will follow the wrong file. This is a **knowledge integrity risk** that compounds across sessions.

# 8. What to Do First (Planning Actions Only)

1. **Auth cutover decision** — Document the exact user migration strategy (password reset flow? magic link bulk send? account linking table?) before any DNS discussion. Write to `planning-loop/auth-cutover-strategy.md`.

2. **KYC start flow spec** — Define `/api/kyc/start` → Stripe Identity session → webhook → `kyc_status` flip. Include fallback (manual review queue). Write to `planning-loop/kyc-flow-spec.md`.

3. **UUID map elimination plan** — Replace `inventory-ids.ts` joins with `inventory.id` FK across checkout, MyStable, MC publish. Define MC publish contract: operator supplies slug, system generates UUID, returns both. Write to `planning-loop/uuid-map-elimination.md`.

4. **Legal pack single-compile** — Move compilation to MC publish only. Store compiled PDF + hashes on `inventory`. Webhook compares to stored hashes. Write to `planning-loop/legal-pack-single-compile.md`.

5. **Share math fix** — Correct `totalShares = listed_stake_pct / stake_step_pct` in `legal-pack.ts`. Add unit test asserting invariant. Write to `planning-loop/share-math-fix.md`.

6. **CDN hostname resolution** — Provision `cdn.evolutionstables.nz` on Cloudflare R2 + enable public access. Migrate `/public/horses` + `/public/images` to R2. Remove 27MB from repo. Write to `planning-loop/cdn-media-migration.md`.

7. **Google OAuth prod callback** — Add production callback URL to Google Cloud Console. Remove `scripts/google-callback-shim.mjs`. Write to `planning-loop/google-oauth-prod.md`.

8. **Service-role → RLS migration** — Define `public_campaigns` view or RLS policies for anon read. Replace `getSupabaseServiceClient()` in `horses-data.ts` with anon client. Write to `planning-loop/rls-public-catalog.md`.

9. **MC investor ledger wiring** — Replace `CANONICAL_INVESTORS` fixture with live `holdings` + `profiles` joins. Add operator KYC review queue. Write to `planning-loop/mc-investor-ledger.md`.

10. **Comms plane rebuild decision** — Choose: (a) rebuild `/updates` in evo_02 + email pipeline, (b) keep evo_01 comms on subdomain, (c) migrate to external (Buttondown, Resend Broadcast). Write to `planning-loop/comms-plane-decision.md`.

11. **Stale docs purge** — Archive `docs/PLAN_WEB_REBUILD.md` to `docs/archive/`. Update `CONTINUE.md` gates to reflect actual state (KYC = 0/10, Buy = 3/10). Write to `planning-loop/docs-hygiene.md`.

12. **Observability baseline** — Add structured logs + health endpoints + failure-state persistence to checkout webhook, KYC webhook, MC publish. Write to `planning-loop/observability-baseline.md`.

**Sequence:** 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12. Items 1, 2, 3, 4, 5 are **blockers for any real purchase**. Items 6, 7, 8 are **blockers for production traffic**. Items 9, 10, 11, 12 are **blockers for sustainable operations**.
