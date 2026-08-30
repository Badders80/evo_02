# Synthesis: evo_02 build-surface review (vs retiring evo_01)

**Date:** 2026-08-30
**Models used:** PLANNER_PAID (glm-5.2:cloud), PLANNER_FREE_A (opencode/nemotron-3-ultra-free), PLANNER_FREE_B (opencode/hy3-free). `x-preview-f-free` gone this week; FREE_A = remaining rated planning workhorse; FREE_B added because this is a cutover review.
**Brief source:** `evo_02/planning-loop/brief.md`
**Status:** Awaiting founder gate. No ACCEPTED stamp yet.

---

## 1. Problem Reframing

Planners agreed: the seed question ("is the new site looking good / is it a replica") is the wrong axis. The right question is:

> **Can we repoint `www.evolutionstables.nz` at evo_02 without a second identity, money, or content incident — and what is the smallest honest gap list before that switch?**

Adjudication: **yes, that is the question.** Visual parity with evo_01 is Pass 2 (founder KEEP/CUT). Architecture is already a real monorepo. Cutover risk is not chrome.

Where they diverged: Nemotron framed identity cutover as "100% of live users locked out." GLM/hy3 treated KYC + webhook hash + UUID joins as the money incident. **Host take:** live holdings = 0, purchases off, catalog already on Evolution-3.0. There is no portfolio to migrate. There *is* a login-generation problem (Firebase users + 18 orphaned `auth.users` + evo_02 `profiles`) and a content-plane problem (`/updates` still lives in evo_01). Do not plan as if existing co-owners will lose MyStable — they have nothing in it. Do plan as if a DNS flip 404s investor updates and bricks Google login unless the OAuth client is re-registered.

## 2. Proposed Approach

**Name: Browse-first cutover. Money stays off until KYC has a start button.**

evo_02 is a cleaner *platform* than evo_01 (packages, RLS schema, Nellie-loop, MC publish). It is **not** a complete *replacement surface*. Treat it as three layers:

| Layer | Status | Cutover? |
|---|---|---|
| Storefront look (landing, horse, login, MyStable chrome) | Real enough for founder Pass 2 | After Pass 2 + double-nav strip |
| Capture (leads) | Real | Yes, with DNS |
| Money (KYC → reserve → Stripe → holding → vault) | Drawing of a path | No. Keep `PURCHASES_ENABLED=false` |

Do not apply evo_02 migrations 00001–00007 to live Evolution-3.0. Do not edit evo_01. Do not merge `design-alignment` until the founder walks localhost:3010.

## 3. Adjacent Opportunities

From planners (keep):
- Investor updates / comms still trapped in `evo_01/02_website/public/updates/` and `evo_01/pipelines/comms`. evo_02 has no `/updates`. DNS flip 404s bookmarked reports.
- No redirect table for retired routes (`/insights`, `/press`, `/handshake`, `/auth/login`, `/updates/*`).
- `docs/PLAN_WEB_REBUILD.md` still says 70% / static fixtures. Agents will follow it.
- Operator ledger is `CANONICAL_INVESTORS` fixture; tests lock that mock in.

**Host additions both/all missed:**
- **Docs already disagree about live auth.** `evo_02/CONTINUE.md` says prod auth is Supabase-native (`d3d3a4b`, 2026-08-29). gbrain `fact/live-auth-and-supabase` and yesterday's `/home/evo/new/planning-loop/synthesis.md` say live Google is still Firebase `evolution-engine`. FOUNDER-SIGNOFF said the Vercel Hobby plan **blocked** that deploy. Do not plan cutover until someone opens `www.evolutionstables.nz/login` and reads the picker host. The knowledge layer is lying in two directions.
- **`compileLegalPack(..., { skipValidation: true })`** in `horses-data.ts`. Hash freeze is not enough if the compiler is told to skip its own compliance gate.
- **`#marketplace` is not dead.** `MarketplaceSection` has `id="marketplace"`. Nemotron claimed the teaser goes nowhere. Pass 2's "/marketplace nav link" note is the leftover; current NavBar is `/#marketplace`.
- **4-island topology is incomplete.** Comms and racing-data still sit under `evo_01/pipelines/`. evo_03 is a thin video sandbox. Cutting over the website does not retire evo_01 as a workspace.
- **Two commercial stories on one landing.** Landing sells one Digital Syndication. Horse pages then split `upfront` (Tokinvest book) vs `subscription_float` (Nellie). That is load-bearing, not debt — but the public story has not been split. Founder should decide in Pass 2 whether Prudentia/Hotta read as "closed book" or "same product, different bill."

## 4. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| DNS flip with KYC gate and no Stripe Identity start | H | H | Cut over with purchases off. Spec KYC start before any `PURCHASES_ENABLED=true`. |
| Webhook `PDS_HASH_MISMATCH` if soft fields change between checkout and pay | M | H | Freeze hashes onto the reservation at session create; webhook compares frozen, never recompiled. |
| Legal PDFs print `%` as `totalShares` (`horses-data.ts` `Math.round(totalSyndicateStakePct)`) | H | H | Compiler input = `listed_stake_pct / stake_step_pct`. Do not ship money with this open. |
| MyStable empty for MC-published horses (`inventory-ids.ts` seed UUIDs) | H | M | Join on `holdings.horse_id` = `inventory.id`. Seed map is a crutch for Nellie demo only. |
| Google OAuth prod uses NextAuth-era localhost callback + shim | H | H | Founder-only GCP redirect URI list, after a written allowlist. No shim in prod. |
| Live auth fact vs CONTINUE vs Vercel Hobby BLOCKED | H | H | Open live `/login` once. Update gbrain `fact/live-auth-and-supabase` to match reality. |
| `/updates/*` 404 after DNS | H | H | Redirect map + decide port vs keep-comms-on-evo_01-subpath. |
| Catalog reads via service role (`horses-data.ts`) | H | M | Anon + RLS before calling ADR-002 "done" on the live read path. |
| `cdn.evolutionstables.nz` does not resolve; 27MB in `/public` | H | M | Attach R2 custom domain or accept local media for browse-first cutover. |
| Double NavBar+Footer on `/` (`layout.tsx` + `page.tsx`) | H | L | First thing the founder will see on Pass 2. Strip `page.tsx` chrome. |
| Two schema homes; `00003` seed diverges (investors vs inventory-only) | M | H | `supabase/migrations` is apply-path. Reconcile `00003` before deleting `db_models/src/schema`. Do not apply to Evolution-3.0. |

## 5. Next Actions

Ordered. Planning only.

1. **Founder look (10 min):** `http://localhost:3010` — landing, `/horses/nellie`, `/login`, `/mystable`. Mark `build-loop/pass2-content-sweep.md` KEEP/CUT. Expect stacked nav on `/`.
2. **Rank the blocker list** (this synthesis §4 top 5). Must-fix vs accept-with-purchases-off.
3. **Pick cutover mode:** A browse-first (recommended) / B money-on (blocked until KYC start + hash freeze + share-math).
4. **Decide `/updates`:** port a thin route, keep evo_01 serving `/updates` via rewrite, or 410 with email to owners.
5. **Reconcile live auth fact** before any DNS talk: one browser check of the production picker host.

## 6. Out of Scope (for now)

- Stripe Identity implementation (needs a spec, then build-loop).
- Applying 00001–00007 to Evolution-3.0.
- Rewiring MC `CANONICAL_INVESTORS` to live holdings (needed before operator payouts, not before browse cutover).
- R2 custom-domain attach (founder Cloudflare; zone not on the account per `fact/r2-media-hub`).
- Rebuilding `/insights`, `/press`, `/handshake`, `/brand-guidelines`.
- Editing evo_01. Dirty tree stays dirty.
- Identity bridge table on live (deferred in 2026-08-29 auth synthesis).
- Observability baseline (Nemotron #12) — after money path is real.

## 7. Artifact for build-loop

```
build-loop/plan scope:
- Files/areas to touch (only after founder Accepts + pick A or B):
  apps/web/src/app/page.tsx (drop duplicate NavBar/Footer)
  apps/web/src/app/layout.tsx (ADR-007 OG copy)
  apps/web/src/lib/horses-data.ts (share-math, skipValidation, service-role read)
  apps/web/src/lib/inventory-ids.ts (delete after join-on-id)
  apps/web/src/app/api/webhooks/stripe/route.ts + checkout create-session (hash freeze)
  dead: header.tsx, landing-cta-popup.tsx, ui/SplitFaq.tsx
  docs/PLAN_WEB_REBUILD.md (archive)
  faq.json vs app/faq/page.tsx (one source)
- Key decisions made: evo_02 is the greenfield; evo_01 website is archive-in-waiting; purchases stay off until KYC start exists; do not migrate schema onto Evolution-3.0 in this loop.
- Key decisions deferred: DNS date; /updates home; Google Cloud redirect URIs; Stripe Identity on/off; live auth actual state.
- Priority order: Pass 2 marks → double chrome → browse cutover with purchases off → KYC spec → hash freeze + share-math → UUID join → RLS catalog read.
- Risk items to verify in audit stage: no recompile-at-webhook; totalShares is step-units; holdings join inventory.id; kyc_status cannot become verified without a start route; service role not used for public GET.
```

## Planner Comparison Table

| Dimension | PLANNER_PAID (GLM 5.2) | PLANNER_FREE_A (Nemotron Ultra) | PLANNER_FREE_B (hy3) | Adjudication |
|---|---|---|---|---|
| Problem reframe | Cut DNS without money/identity incident | Same; plus "zero shared identity plane" | Same, binary 30-day incident list | All. Host: holdings=0 so identity pain is login/leads, not portfolios. |
| Approach | Plan KYC, hash freeze, UUID join first | 12 planning docs, sequence 1–12 | Browse-first; purchases off unless KYC+D7+D8 land | hy3. Nemotron over-produced docs. |
| Risks flagged | Webhook orphan, share-math, KYC wall, RLS, media | Auth lockout 100%, spam subscribe, no observability | skipValidation, seed investor divergence, DNS TTL unstated | Union. Drop "100% lockout". Keep skipValidation + 00003 seed split. |
| Adjacent layers | Comms `/updates` vanish | Identity cutover + docs that lie + no public/operator boundary | Redirect map + comms orphan = reputational | All three. Host adds live-auth fact collision + two commercial stories. |
| Missed by both/all | — | Claimed `#marketplace` goes nowhere (false; section has the id) | OG line not re-confirmed | Host verified `#marketplace`. CONTINUE vs gbrain auth collision. |

## Surface verdict (host, file-backed)

**What is real:** package split; landing port; horse page from inventory; subscribe → leads; magic/password auth locally; Nellie checkout *code* (reserve RPC, Stripe session, webhook insert); MC publish to inventory; `just check` green.

**What is theatrical:** KYC (gate, no start); MC investor ledger; legal pack shown at request-time recompile; MyStable join via seed UUIDs; R2 CDN hostname; "full lifecycle" in CONTINUE.md.

**What is leftover evo_01 in the new tree:** double chrome on `/`; dead `header.tsx` / `landing-cta-popup.tsx` / `SplitFaq.tsx`; two FAQ copies; two schema dirs; `retainedPct`; retired triad in OG; Tokinvest logos still in the image tree (Pass 2).

**What evo_01 still owns that DNS would drop:** live site, `/updates`, comms pipeline, dirty working tree, whatever auth is actually on Vercel today.
