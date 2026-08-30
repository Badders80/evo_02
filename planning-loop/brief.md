# Brief: Review the evo_02 build surface (post-migration from evo_01)

**Date:** 2026-08-30
**Mode:** PLANNING ONLY. Do not write code. Do not propose a deploy. Do not merge.
**Founder request:** Review how the new build is looking — logic, flows, redundancy — vs the retiring evo_01 surface. This is a planning exercise.

## The seed

Is evo_02 actually a cleaner production platform ready to replace evo_01's live website, or is it a well-gated replica that still carries dual sources of truth, dead chrome, and unfinished money/KYC paths?

## Constraints

- No code this session.
- evo_01/02_website is DIRTY and still serves https://www.evolutionstables.nz (Vercel `evolution-3-0` → GitHub `Badders80/02_website`). Hands off.
- ADR-001: greenfield evo_02. ADR-002: Pure Supabase Auth + RLS, purge Firebase. ADR-003: R2 public media + Supabase vault. ADR-004: clean-room storefront, do not copy evo_01 routes wholesale.
- Locked commercial rules: Nellie-only checkout; other horses visible; First Gear = completed track record; Tokinvest horses = `upfront` (never `one_time`); new DSLs = `subscription_float`; owner/lessor public name = "Evolution Stables".
- Purchases kill-switch: `PURCHASES_ENABLED=true` + Stripe key. Live holdings = 0.
- Do not apply evo_02 migrations 00001–00007 to live Supabase project Evolution-3.0 (`coqtijrftaklcwgbnqef`) — live has no `profiles`.
- Pass 2 content sweep is founder-gated (`build-loop/pass2-content-sweep.md`). Subtractive only.
- Branch `design-alignment` is not merged. Founder look verdict pending.

## What evo_02 actually is (evidence 2026-08-30)

Monorepo `/home/evo/new/evo_02`:

```
apps/web            Next.js storefront :3010
apps/mission_control Operator desk :3011
packages/legal_engine  PDS/SA/pricing/settlement compiler
packages/brand_dna     tokens, identity, voice
packages/db_models     types, registry, schema copies
packages/storage       R2 + SHA-256 vault
supabase/migrations    00001–00007 (local apply path)
```

Public web routes that exist:
`/`, `/horses/[slug]`, `/horses/[slug]/about`, `/login`, `/mystable`, `/faq`, `/privacy`, `/terms`, `/learn/returns`, `/auth/callback`, `/auth/signout`
API: `/api/checkout/create-session`, `/api/webhooks/stripe`, `/api/legal/download`, `/api/subscribe`

evo_01 public routes that did NOT come over:
`/marketplace` (dedicated), `/insights`, `/press`, `/handshake`, `/brand-guidelines`, `/updates/*`, `/auth/login` (Firebase)

Continue.md claim: "full lifecycle built (intake → docs → MC → site → KYC-gated buy)". Gates `just check` 10/10. Kimi audit WARN, 0 FAIL on shipped claims.

## Flows to judge

1. **Discover** — landing (ported evo_01 8-section sequence + lead modal) → marketplace teaser `#marketplace` → horse page.
2. **Trust** — horse commercials + about tab; pricing card, 3-way cap table, data-room (compiled PDS/SA hashes).
3. **Capture** — CTA modal → `/api/subscribe` → `leads` + SMTP notify Alex.
4. **Auth** — magic link + password + Google OAuth. Local Google needs `scripts/google-callback-shim.mjs` because inherited OAuth client only has NextAuth-era `localhost:3000/api/auth/callback/google`.
5. **Own** — `/mystable` middleware-gated; holdings by `user_id`; light console theme.
6. **Buy (Nellie only)** — checkout create-session: auth → profile.kyc_status must be `verified` → reserve RPC (percent → 0.5% step-units at this boundary only) → Stripe session. Webhook: insert holding + consume reservation + vault legal PDFs.
7. **Operate** — MC publish-campaign server action + `/api/campaign/create` bearer `OPERATOR_API_TOKEN`. Investor registry in MC is still a typed fixture (`CANONICAL_INVESTORS`), not live `holdings`.

## Known dual-homes / redundancy (name these; add more if you find them)

- **Chrome doubled on `/`:** root `layout.tsx` already mounts NavBar+Footer; `app/page.tsx` mounts NavBar again and Footer again. Horse/login/mystable pages do not remount NavBar. Landing is the one that stacks.
- **Dead components still in tree:** `header.tsx` (old sticky header, unused), `landing-cta-popup.tsx` (replaced by `CtaLeadModal`), `ui/SplitFaq.tsx` (FAQSection uses CollapsePanel + `dna/content/faq.json`).
- **Two FAQ sources:** landing `faq.json` (9 items) vs `/faq` page hardcoded 5 items. Different copy, same product.
- **Two schema homes:** `packages/db_models/src/schema/` (00001–00004, including `00003_seed_live_horses_and_investors.sql` 487 lines) vs `supabase/migrations/` (00001–00007, `00003_seed_inventory_only.sql` 234 lines). 00005 pedigree / 00006 service-role write / 00007 leads exist only on the supabase path.
- **Hardcoded inventory UUIDs:** `apps/web/src/lib/inventory-ids.ts` mirrors seed IDs. Checkout and MyStable join holdings→campaigns via this map, not `inventory.id` from the live row. MC-published horses with random UUIDs will not join.
- **Cap table leftover:** `HorseCampaign.capTableFixture` still has `retainedPct` (4-way evo_01 language). Locked model is 3-way listed pool (allocated + reserved + available).
- **Legal pack compiled twice:** MC publish stores hashes on inventory; storefront `getCompiledLegalPackForCampaign` recompiles from current soft fields at request time. Webhook compares Stripe metadata hashes to *recompiled* hashes — content edit between checkout and webhook can 400 `PDS_HASH_MISMATCH`.
- **Share-math in compiler call:** `getCompiledLegalPackForCampaign` passes `totalShares: Math.round(campaign.totalSyndicateStakePct)` (a percentage, not step-units). Locked invariant is `total_shares = listed_stake_pct / stake_step_pct`.
- **Public catalog via service role:** `horses-data.ts` `getAllCampaigns` / `getCampaignBySlug` use `getSupabaseServiceClient()`, bypassing RLS that ADR-002 made the point of the rebuild.
- **Three Supabase client modules** in web: `supabase-client.ts`, `supabase-server.ts`, `supabase-service.ts`. CONTINUE notes supabase-service hand-typed Database breaks postgrest-js 2.112.3 generics — subscribe route uses supabase-server instead.
- **Identity copy drift:** `layout.tsx` OG description still "Grounded in tradition, evolved through innovation" — retired by ADR-007 / `doc/IDENTITY.md` (Heritage / Tradition / Own the Experience).
- **Stale planning docs inside the repo:** `docs/PLAN_WEB_REBUILD.md` still says storefront is static fixtures / 70% built. CONTINUE and e2e-wire fact say inventory is live. Agents will follow the wrong file.
- **CDN vs local media:** `@evo/storage` targets `cdn.evolutionstables.nz`; gbrain `fact/r2-media-hub` says that hostname does not resolve on the Cloudflare account and r2.dev public URL is disabled. Storefront still ships ~27MB of `/public/horses` + `/public/images`.
- **KYC is a gate with no start button:** checkout requires `profiles.kyc_status === 'verified'`. No Stripe Identity session route exists under `apps/web`. Terms/privacy mention Stripe Identity. Live evo_01 KYC is Firebase custom claims.
- **MC demo data plane:** CONTINUE/evo_00 still say operator desk investor ledger is fixtures until wired. Cap-table tests assert Prudentia/Hotta allocated units from that fixture, not Postgres.

## Questions to explore (answer all)

1. **Reframe:** Is the right question "does the new site look like the old one" or "can we cut DNS without a second identity/money/content incident"?
2. **Logic:** Which dual-homes are load-bearing (payment_style split, Nellie-only) vs accidental debt (double chrome, two FAQ sources, two schema dirs, UUID map)?
3. **Flows:** Walk discover → capture → auth → KYC → buy → MyStable → operator publish. Where does the happy path lie, and where is it a drawing of a path?
4. **Redundancy vs evo_01:** What did we correctly leave behind (Firebase, Sheets, GCP functions, `/insights`)? What did we copy that we should not have (landing chrome, Tokinvest logos, footer hero dup)? What did we fail to replace (investor updates, press, KYC start, R2 public media)?
5. **Cutover posture:** Given live Franken-auth is still Firebase and live DB has no `profiles`, what is the smallest honest sequence after founder Pass 2 — not the aspirational cutover runbook in `migration_bridge/05_cutover_runbook.md`.

## Output expectations

Structured markdown with numbered sections:

1. Problem reframe
2. Surface map (what is real vs theatrical)
3. Logic and dual-source register (file paths)
4. Flow-by-flow verdict (Discover / Capture / Auth / KYC / Buy / MyStable / Operate)
5. Redundancy: keep / fold / delete
6. Risks
7. Adjacent layer the founder did not ask about
8. What to do first (planning actions only — no patches)

Be specific. Name files. Do not hedge. Do not recommend editing evo_01. Do not recommend applying evo_02 migrations to Evolution-3.0.

## Adjacent space prompt

Identify at least one layer beyond "review the new website": identity cutover, content SSOT, operator vs public data planes, docs that lie, or comms/updates still trapped in evo_01 `02_website/public/updates/` and `pipelines/comms`.
