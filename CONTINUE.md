# CONTINUE — evo_02

**Date:** 2026-09-01 — **SESSION 5 WRAP: Rung 4 content DONE + AGREED FLOW SIGNED OFF (founder 2026-09-01) — reference: `build-loop/purchase-content-spec.md` THE AGREED FLOW section. Locks: 7 decisions + audit-tracker + stake-only terminology + KYC-at-checkout + residency-derived. raceExpectation → PDS §2.4 shipped + audited PASS. Rung-4 audit 23 PASS/4 WARN (build-loop/audit-graph-rung4.json) + hermes verify ok:true at HEAD. Next: wireframes (Stitch) from the signed flow → build (stepper rework + min_stake_pct wiring, KYC port, E4).**
**Dual-surface rule (LOCKED):** "current state" = check BOTH `evo_01/02_website` (LIVE prod — Firebase, full KYC stack) AND evo_02 (:3010, Supabase). Gap in evo_02 + exists in prod = PORT, not rebuild. KYC is a port (Firebase → Supabase), UX already designed + walked.
**Branch:** `design-alignment` (LOCAL-ONLY, never push). Cutover founder-only.
**Live site:** still served by evo_01/02_website via Vercel. evo_01 working tree is DIRTY — hands off (read-only reference for ports).

---

## Session wrap (2026-09-01 — Session 5: Rung 4 purchase content — DONE, agreed flow sculpted + NEW LOCKS + raceExpectation shipped)

**Goal:** Work the EXACT content of each purchase step (choose → accept → checkout → pay → own) so wireframes can be built. No code — BA deliverable only.

**Deliverable:** `build-loop/purchase-content-spec.md` — e3-content-tree node-block style, every string/state/edge case per step, grounded in code (right-rail.tsx, create-session/route.ts, webhooks/stripe/route.ts, nellie-loop.ts, mystable-dashboard.tsx, pricing-card.tsx, marketplace/[slug]/page.tsx). Voice applied throughout: Private Banker Standard, Silent Gavel, Fight Club rule, whitelist, zero exclamation marks, British English, never lead with dollars.

**What the spec covers:**
- **Step 1 Choose:** stepper+input behavior spec (open at min, ▲/▼ step, over/under/non-multiple warnings), locked fine print line, pricing figures, 5 pillars referenced (not rewritten).
- **Step 2 Accept:** gate modal states, scroll-locked checkboxes, hash display, KYC prompt placement (read-then-verify) with pending/rejected copy.
- **Step 3 Checkout:** full server-code → investor-copy error mapping table (KYC_REQUIRED, RESERVE_FAILED, kill switch, etc.), reservation countdown + expired copy.
- **Step 4 Pay:** Stripe line-item naming, success → /mystable?checkout=success, cancel → ?units= pre-fill (Option A).
- **Step 5 Own:** MyStable success state, E4 welcome email full copy (Yard Journal format), vault + billing expectations.
- **Open items resolved with recommendations:** reservation-expired (auto re-reserve on retry, manual-triggered honest copy) · KYC rejected vs requires_input (keep rejected, map requires_input → rejected at port).
- **New flags found in code:** rail opens at Math.max(min, 2.0) (violates locked open-at-min) · fine print line not in code · availablePct ≤ 0 renders buyable rail · two checkout surfaces (E3 rail + legacy PricingCard) · kill-switch CTA visibility.
- **Acceptance criteria** per step — feeds the test-purchase runbook (DoD proof).

**Founder decisions — ALL LOCKED 2026-09-01 (Session 5):** ① reservation-expired: **explicit [ Reserve Again ], honest copy — no silent auto-reserve** ② KYC rejected: **keep `rejected` enum, map `requires_input` → `rejected` at port; failed check = MANUAL-ASSISTANCE path** ("A member of Evolution Stables will contact you shortly to help complete the process" — matches prod's manual-assistance UX, port it; resolution = founder/ops: approve/deny/re-verify) ③ `availablePct` ≤ 0 → **treat as Fully Subscribed** ④ **consolidate on E3 rail; PricingCard stays legacy, untouched, not retired** (known location if ever needed; no pop-up styling port). Kill-switch CTA: keep visible, honest 503 copy (recommendation, non-blocking).
**Founder decisions — LOCKED LATER IN SESSION 5 (agreed flow):** ⑤ **AUDIT-TRACKER RULE — 100% audit tracker, NOT browsing clicks.** Commitment events only, logged at source the instant they happen regardless of sale outcome: PDS accepted · SA accepted · NZTR declaration accepted · identity check completed · checkout started · payment completed/cancelled/expired. Each row: who + exact document hash + when. Serves investor disputes ("I paid, where is my horse") AND regulator/NZTR/FMA/counsel requests without reconstruction. ⑥ **TERMINOLOGY RULE — investor-facing always "stake" + percentage** ("2.0% stake"); "Units" retired from investor-facing copy (rails, Stripe line item, CTA matrix — survives only in code internals); "Tokens" banned everywhere. ⑦ **KYC AT CHECKOUT (not upfront)** — compliance floor = before contract execution/prize money (SOP §9.1); protects casual investor (they verify only after deciding); reading stays public; NZTR declaration (18+/no disqualification/NZ resident or international — same check for everyone) rides the KYC port, collected on the verify screen.
**AGREED FLOW (SIGNED OFF 2026-09-01 by founder — LOCKED, wireframe source):** Step 1 HOOK (rail: "Become an Owner" · "easier than you think" · From $76/mo per 1% · 75% gross prize money* · Stake available 5% · CTA "Ownership Terms and Conditions") → Step 2 TERM SHEET pop-up (stake pill + price pill moving together, opens 1%, 0.5% steps, tiny bounds line; upfront payment 3+2 months w/ PDS §4 link; duration start—end; 75% return; race-expectation one-liner from PDS §2.4; CTA "Invest in {Horse}") → Step 3 ACCEPT (PDS/SA scroll+tick, hashes, tick = recorded acceptance — audit event at tick time, pre-payment; CTA label LOCKED "Proceed to Secure Checkout") → Step 4 VERIFY (ONE tick — NZTR disqualification attestation; residency DERIVED from Stripe Identity result, never asked; 18+ derived from ID DOB; ambiguous-edge → manual-assistance path; failed check → manual-assistance, founder/ops decide) → Step 5 PAY (Stripe line item "{Horse} ({units}% Stake) — Initial 5×M float deposit", success → /mystable?checkout=success, cancel → ?units= pre-fill + honest 15-min countdown + [ Reserve Again ]) → Step 6 OWN (MyStable success, welcome email E4, vault, keep from Month 2). Full detail: `build-loop/purchase-content-spec.md` THE AGREED FLOW section.
**BACKLOG — SYNDICATION 101 GUIDE (idea, not built, no surface yet):** lightweight plain-language companion to PDS/SA ("ah, I see — it's 75% of my pro-rata share" / "if the horse can't race, the bills stop" / "when do I get paid"). Covers 75%+pro-rata, float/deposit/keep, injury/retirement, quarterly distributions, spelling, exit. Placement TBD at wireframing (candidate: /learn/ownership page — /learn/returns exists in prod as port pattern — or sidebar drawer). Content re-voiced from pillars/term-sheet/PDS, never legal boilerplate.
**raceExpectation → PDS §2.4 (SHIPPED, uncommitted, AUDIT PASS):** new optional `raceExpectation` field (legal_engine types + canonicalize + §2.4 section rendered only when present; horses-data dual-shape reader; test fixtures + assertions updated). **AUDIT: PASS — 6/6 claims (build-loop/audit-graph-raceexpectation.json).** legal_engine + web suites GREEN (multiple runs). Audit ran locally — both dispatched audit subagents (deleg_654f76bd) timed out on the slow free model; orchestrator verified directly per build lesson. Seed values (NOT applied — seed paths forbidden): Nellie "Nellie is in pre-training at Byerley Park, with a spring preparation leading into the autumn 3YO fillies' series." · Prudentia "Prudentia is spelling and expected back in work early in the new year."
**PURCHASES_ENABLED (LOCKED 2026-09-01):** **ON in dev (:3010) — `apps/web/.env.local` already has `PURCHASES_ENABLED=true` + `sk_test_` key (verified). Test mode cannot move real money — full journey walkable (create session → pay → webhook → holding → email → vault) = DoD proof. PROD stays OFF until founder go-live signal with live keys. This amends the AGENTS.md "No PURCHASES_ENABLED" gate for dev only.**

**Next (after founder signs):** wireframes from spec (Stitch) → build: stepper rework + min_stake_pct fix + fine print, KYC port (Firebase → Supabase), E4 email + bcc, MyStable success state, cancel_url ?units= fix.

---

## Session wrap (2026-09-01 — Session 4: Investor Flows scoping — ALL DECISIONS LOCKED)

**Goal:** Lock the investor journey (login · KYC · purchase) end-to-end so wireframes can be built. No code this session — scoping + decision-locking only.

**The 4-rung customer journey (LOCKED 2026-09-01):**
1. **Public** — homepage → marketplace → horse page, full rail visible (pillars, pricing, projections, race stats). No login wall (SEO + no forced signup).
2. **Logged in** — + gate modal: PDS/SA readable in-modal, SHA-256 hashes shown. Checkout still blocked.
3. **KYC'ed** — checkout unlocked. **Read-then-verify confirmed** (docs readable pre-KYC, pay blocked until verified — supersedes e3-flow-map "KYC gate — blocked" node).
4. **Owner** — MyStable: holdings, feed, vault, billing.

**Decisions locked this session (all in investor-flows-report.md):**
- **Stake entry: stepper+input REPLACES slider** (E3 shipped as slider — rework queued). Box opens at minimum, up/down stepper moves in increments, manual entry with out-of-range warning both directions. Fine print: "Minimum investment ___% · Stake available ___% · Contact us for more info" (covers larger-stake interest — no separate tag).
- **Min/step/max are DSL-driven per horse** (`min_stake_pct`, `stake_step_pct`, `availablePct`). **Min currently hardcoded 1.0** (`marketplace/[slug]/page.tsx:216`) — must read `campaign.min_stake_pct`. Max = available % (Nellie 5.0%).
- **Cancel-stake: RESOLVED — Option A** (carry units in `cancel_url`): `create-session/route.ts:106` appends `?units=`, horse page pre-fills from param. Currently NOT preserved (stake-loss bug, fix queued).
- **Transfer facilitation: "standard fees apply"** (fee % TBD by founder — likely 5%+3% but undecided). Incoming buyer re-verified (Ops SOP §9.1). NOT in code (no SA clause, no transfer flow).
- **KYC = PORT from production** (evo_01/02_website: `/api/kyc/create-session|callback|status` + `/auth/verify` + `/marketplace/[id]/kyc-processing`, Firebase claims, resume + sync + manual-assistance UX). Reconcile `rejected` enum (evo_02) vs `requires_input` (prod) at port.
- **Auth fixes queued:** 7 OAuth codes mapped (not 9); password path shows raw Supabase messages — map before E4. OAuth error path drops `next` (`api/auth/google/callback/route.ts:37`) — fix before E4.
- **KYC badge:** collapses pending/rejected into "Unverified" (`mystable-dashboard.tsx:39-48`) — add pending ("Being reviewed") / rejected ("Re-verify required") labels.

**Open items (2, from e3-flow-map):** reservation-expired UX (auto re-reserve vs manual — currently manual) · KYC port details (rejected vs requires_input reconcile).

**Gaps gating "investor can buy a horse" (DoD):** 1. KYC port · 2. E4 post-purchase (welcome email + bcc + MyStable success polish) · 3. 2 open decisions · 4. Test-purchase runbook (create session → pay → webhook → holding → email → vault → MyStable — THIS run is the DoD proof) · 5. Transfer facilitation ("standard fees apply", not in code).

**Artifacts:** `build-loop/investor-flows-report.md` (scoping SSOT, all corrections applied) · `build-loop/service-blueprint.md` (NNGroup-format blueprints for Flows A/B/C + webhook sequence) · `build-loop/e3-flow-map.md` (updated) · `build-loop/e3-content-tree.md` (updated).

**Dual-surface rule baked into:** memory (every turn) · codebase-implementation-audit skill (named pitfall) · evolution-workspace-topology skill (evo_01 row: EXCEPT 02_website = LIVE prod).

---

## Session wrap (2026-09-01 — Session 3: E3 Pre-Purchase Terms SHIPPED, gated, verified)

**Goal:** Implement E3 Pre-Purchase Terms (right-rail accordion with 5 pillars, stake slider with locked share-math, live monthly NZD pricing, and scroll-through acceptance gate modal for PDS and Syndicate Agreement).

**What happened this session (all on `design-alignment`, LOCAL-ONLY, 25 commits, tree clean):**
1. **Stitch Project Ingestion** — Stitch project `589024617828390803` ("E3 Pre-Purchase Terms") fetched via MCP tool endpoint (`list_screens`, `get_screen`).
2. **Locked Rules Enforced** — `build-loop/e3-right-rail-deepdive.md` & `.agents/rules/e3-sprint.md` Rules 1–13:
   - 5 Accordion Pillars: *The Deal*, *What's Included*, *What If*, *Your Return*, *Exit & Transfer* (Private Banker Standard, vocabulary whitelist, zero exclamation marks).
   - Slider math (Rule 11): 1.0% min floor, 0.5% step, percentages only, `pricingForUnits(wholesaleMonthlyNzd, units)` (5% margin + 3% buffer embedded, 5×M join deposit).
   - Acceptance gate (Rule 13): scrollable PDS + SA viewports sourced directly from server-compiled `getCompiledLegalPackForCampaign`, dual checkboxes required to enable `[ Proceed to Secure Checkout ]`.
3. **Commits (design-alignment, LOCAL-ONLY):**
   - `4e88898` `test(web): e3 right rail invariants and slider pricing unit tests` — TDD test suite validating share-math, pricing formulas, hash integrity, and vocabulary whitelist.
   - `40a5c3a` `feat(web): e3 right-rail 5-pillar accordion and acceptance gate modal` — `apps/web/src/components/horse/right-rail.tsx`.
   - `5659a71` `feat(web): wire compiled legal pack and stake parameters to marketplace right-rail` — `apps/web/src/app/marketplace/[slug]/page.tsx`.

**Gates (all green):** `just check` 10/10 PASS · `pnpm --filter @evo/web typecheck` clean · dev server :3010 live walk /marketplace/nellie, /marketplace/prudentia, /marketplace/tml-x-yearn 200.

---

## Session wrap (2026-08-31 — Session 2: audit + founder review fixes + Stitch MCP)

**What happened this session (all on `design-alignment`, LOCAL-ONLY, 22 commits, tree clean):**

1. **Kimi audit DONE** — `build-loop/audit-report.md` + `audit-graph.json`: **13 PASS / 1 FAIL / 1 WARN** on the horse-page-depth sprint diff (`faa6632~1..8fe7eaa`). Auditor `kimi-k2.7-code:cloud` (paid), evidence-attachment pattern (real psql/curl/turbo output, not summaries).
2. **F1 RESOLVED** (`512bf32`) — race_log backfill. Founder decision: **show last 6 + link to official** (no popup, no scroll wall). Prudentia's 6 already ARE the last 6 ✓. First-gear backfilled to full 11-start record from loveracing.nz (HorseID 428364, curl_cffi scrape; prize sum $24,975 = repo total, exact). **Castletown corrected: live page 5th of 9 (old entry said 2nd — repo totals confirm old entry wrong).** Race tab: summary from FULL log (1 Win · 2 Places), timeline shows most recent 6, FULL NZTR RECORD link covers the rest. Reusable parser: `scripts/scrape-race-log.py`. Knowledge repo `race-record.json` starts backfilled to 11 (evo_01 tree touched — hands-off rule noted).
3. **F2 RESOLVED** (`33e7225`) — MediaDeck gallery was reading empty `public/images/content/horses/{slug}`; real stills at `public/horses/{slug}/01-04` via HORSE_STILLS. Now sources `getCampaignMedia().horse.paradeGallery`. Live: `01 · 04` prudentia, `01 · 04` first-gear, `01 · 02` hottathanafantasy.
4. **5 founder review fixes** (screenshots 1-6, prod reference `evolutionstables.nz`):
   - `243bd63` — hero = prod base: `aspect-[16/10]` constant box, no negative-margin bleed (breadcrumb visible, no rail spillover), coming_soon badges green (status-active) not gold
   - `d989f0c` — hero shaded pillbox (`bg-surface-base` fill behind photo) + AGE | SEX | COLOUR | SIRE | DAM spec strip
   - `da4ecc2` — spec strip → content-sized flex cells hugging left (no 5-col spread; Sire/Dam no longer wrap ugly)
   - `ddcdee9` + `c6af68d` — age reads "5yr" (lowercase yr); status pills = prod amber outline: **Fully Subscribed AND Completed = warning variant** (was green/solid). Coming Soon stays green (prod shows it green).
5. **Stitch MCP WIRED** — official Google endpoint `https://stitch.googleapis.com/mcp`, HTTP transport, `X-Goog-Api-Key` header. Config in `~/.hermes/config.yaml` under `mcp_servers.stitch` (set via `hermes config set` — config file is agent-write-protected). **15 tools verified live** (create_project, generate_screen_from_text, edit_screens, generate_variants, list_screens, get_screen, upload_design_md, create_design_system, apply_design_system, etc.). Key stored: `STITCH-KEY-REDACTED`. **NOTE: MCP servers load at Hermes startup — no hot-reload. Restart Hermes to get `mcp_stitch_*` native tools; until then drive the endpoint via curl (proven working).**
6. **E3 flow board** (`build-loop/e3-flow-board.html`) — draggable right-rail section board (The Deal / What's Included / What If / Your Return / Exit & Transfer) + locked acceptance gate strip. **SUPERSEDED by Stitch MCP** — founder designs the right-rail visually in Stitch instead (drag/edit via `edit_screens`). Board kept as reference; public copy removed (planning artifact, not for prod).

**Gates (all green at HEAD `a80c739`):** forced `turbo run lint typecheck test` 22/22 (0 cached) · `hermes verify --json --skip-start` ok:true (build + 8 test phases) · live walk 200 × 5 (/marketplace + prudentia + first-gear + hottathanafantasy + i-stole-a-manolo + tml-x-yearn).

**Dev server:** does NOT auto-start on reboot — `cd /home/evo/new/evo_02/apps/web && pnpm dev --port 3010` (background). Stale-boot server 500s on [slug] with missing vendor-chunk error → restart, not code. `hermes verify`'s prod build clobbers dev `.next/` every run — always restart dev after verify.

**Founder TODOs before live (unchanged):** verify the 2 trainer quotes carrying `[DRAFT — verify with trainer]` (Prudentia + First Gear). Fix first-gear `latestUpdateUrl` prose (C15, hidden by updateCount=null gate).

---

## NEXT — Sprint map (founder-approved order)

| Sprint | Scope | Status |
|---|---|---|
| 1 | E1 + E2 (quick wins) | ✅ DONE (f4ca17e) |
| 2 | **E3 — pre-purchase terms** (right-rail drop-downs from term-sheet DNA, acceptance gate at checkout tail, slider math, 5 pillars) | ✅ DONE (5659a71) |
| 3 | **E4 — post-purchase** (welcome email via SMTP, investor → bcc_lists/{slug}.json, MyStable success state, vault docs surfaced) | ⏳ NEXT — depends on E3 checkout tail |
| 4 | Cutover (purge-then-push, merge, Vercel, prod OAuth client 153078526638-* add /api/auth/google/callback, PURCHASES_ENABLED, archive evo_01) | ⛔ founder |

**Before Sprint 2:** ~~kimi-code-audit on the full diff~~ **DONE 2026-08-31** (13 PASS / 1 FAIL / 1 WARN; F1 + F2 both resolved). Founder verifies the 2 trainer quotes. E3 deferred questions: downloadable investment summary? pillars validated? acceptance record location? **Stitch MCP: restart Hermes to load `mcp_stitch_*` tools (no hot-reload).**

**Go-live DoD:** `build-loop/go-live-dod.md` — 6 layers (Content/Commercial/Identity/Operations/Infra/Verification). Critical path: E1+E2 ✅ → E3 → E4 → real PDS/SA (founder/legal) → cutover → test purchase. Pricing/return LOCKED (legal_engine + DSL_MANUAL).

---

## Prior state — sprint e2e-wire (locked cb4ac12, audited)

- Share-math: lot/share/unit = increment (0.5%); min = floor (1%); percentages only; stakePctToStepUnits at checkout boundary.
- Operator auth: fail-closed 401, timing-safe sha256, httpOnly `mc_op`.
- Known non-blockers: prudentia/hotta MC seeds simplified (publish-gated); horses-data.ts legacy payload fields.

### Commands

- `just check` (10/10 must pass) · web :3010, mission_control :3011 · Supabase :54321
- pnpm: run from repo root ONLY, `export PNPM_HOME="$HOME/.local/share/pnpm"` first.

## Locked (don't reopen)

- One site. design-alignment replaces `main` after gate + Pass 2 — no splice.
- Nellie only for buy. No MC restyle. Payouts = v2. First Gear = KYC names only.
- Tokinvest horses = `upfront`. New DSLs = `subscription_float`.
- Owner/lessor = "Evolution Stables" (never "Ltd"/"Bloodstock").

## Do not

- Merge/push until founder signs off (click-through + Pass 2).
- Apply 00001–00008 to Evolution-3.0 (prod).
- Treat website Terms as the legal pack. Merge ui-sprint-1.

---

## Session wrap (2026-08-31 — 3-Layer Horse Storytelling, SHIPPED + audited)

**Locked model (founder-approved):** L1 invites the click · L2 sells the story · L3 carries the substance. One MC-authored origin (inventory jsonb, camelCase), three presentation depths, complement-never-duplicate.

| Layer | Surface | Field | Rule |
|---|---|---|---|
| L1 | Marketplace card | `marketing.marketplaceHook` + `highlightTags` chips | hook, else first sentence of aboutHorse — never full story |
| L2 | "The story" | `soft_legal.aboutHorse` | verbatim; required at intake |
| L3 | Overview tab | `soft_legal.racingOutlookAndPedigree` | verbatim under "About [Horse]" (heading kept); required at intake |

**Commits (design-alignment, LOCAL-ONLY):** `c533414` writer→camelCase + required-field guard · `326b874` reader dual-shape + firstSentence/getMarketplaceHook · `6f0cc6d` card hook + page meta/OG · `85dab7d` sitemap + robots · `203c5cb` plan/chunks/audit artifacts · `5206fee` highlight tag chips on cards · `c2a0c94` plan doc update. Artifacts: `build-loop/3layer-plan.md`, `3layer-chunks.md`, `3layer-audit-report.md` (10/10 PASS), `3layer-audit-graph.json`.

**Gates:** `turbo run test typecheck --force` 16/16 · `hermes verify --json --skip-start` ok:true · live walk /marketplace 200 (24 chips), /marketplace/nellie 200, /sitemap.xml 200, /robots.txt OK.

**Key-shape fix (root cause):** MC writer wrote snake_case jsonb (`about_horse`), reader+seed used camelCase → MC-created campaigns rendered empty. Writer now camelCase; reader reads both shapes (pattern already existed for pedigree_data).

**Dev server:** does NOT auto-start on reboot — `cd /home/evo/new/evo_02/apps/web && pnpm dev --port 3010` (background). Stale-boot server 500s on [slug] with missing vendor-chunk error → restart, not code.

**Parked (founder-visible, not blockers):**
1. tml barn-name inline cleanup — aboutHorse embeds "(barn name Mulan)"; dupes the future `Meet {Legal} aka {Nick}` header. One-time seed-content edit for tml row.
2. Per-horse JSON-LD — `horseWebPageJsonLd` exists in `apps/web/src/lib/seo.ts`, unused on /marketplace/[slug]. Wire in SEO phase.
3. Race-date smart fallback in MC — when no race dates, MC writes "As [horse] is developing, no race dates are confirmed…" (authoring-side, NOT website).
4. Dev server auto-start on boot (systemd user service) — or keep manual.

**Known dirty file (NOT mine, pre-existing):** `apps/web/src/components/marketplace/pedigree-table.tsx` — was uncommitted pedigree work from before this sprint. **COMMITTED 2026-08-31 `7c8c102`** (subject glow, prod-style metadata bar, centered subject) — founder eyeball-approved. Tree clean.

---

## Session wrap (2026-08-30 late — horse page build COMPLETE, all 11 chunks done, audit PASS)

**Plan artifacts:** `build-loop/horse-page/` — plan.md, plan-graph.json (21 nodes, all 11 chunks `state: done`), review-synthesis.md, kimi-plan-verdict.md. **Model doc: `build-loop/page-model-notes.md` (founder-locked).**

**Complete commit chain on `design-alignment` (LOCAL-ONLY, not pushed):**
- chunk-1 skeleton `3d0640f` · chunk-2 story `a1cae9e` · chunk-3 media deck `7a8a1f0` · chunk-4 tabs/overview/documents `d81d476` · chunk-5b types `d81d476` · chunk-7 race `fbed63c` + `120bcb6` · chunk-8 trainer `99f7589` · verification `120bcb6`
- chunk-6 pedigree + chunk-9 rail + page wiring `31db159`
- chunk-10 walk repairs (grid comma class, race summary comment, loverracing_id key) `4a1f68b`
- kimi audit fixes (CTA pairing, ARIA, overlay layout) `5ee878c`
- audit artifacts + chunk states `d…` (see git log)

**Gates (all green):** just check 10/10 (multiple runs) · production build all routes · CDP browser walk Nellie 13/13 + part2 10/10 + terms overlay + linebreeding hover (fresh-launch hover-capable Chromium). Screenshots 01–14 committed in `build-loop/horse-page/screenshots/`.

**Stage-5 audit:** `build-loop/audit-report.md` + `audit-graph.json` — verdict PASS, 0 FAILs, 6 WARNs (deferred: accent-glow token, year-only age, docs click target, native img, video data-gap; 1 rejected founder-locked copy). Kimi pass: 30 findings; 2 CRITICALs real (fixed), 1 CRITICAL false positive (verified against code + browser).

**Known deferred items (founder-visible WARNs, not blockers):**
- Pedigree glow uses shadow-[rgba] literals — needs a semantic token decision (Tailwind v4 can't var() inside box-shadow color)
- Age = year-only subtraction (southern-hem foaling can read 1 high)
- Documents "Download" click target is text-only
- media-deck uses native <img> (next/image polish later)
- Video 1s-delay code verified structurally; no horse ships a trackwork video yet (data gap)

**Build lessons this session:**
- Tailwind v4 arbitrary grid values: commas are invalid — `[2fr,1fr]` emitted broken CSS; underscores `[2fr_1fr]` required.
- The race-tab eslint "unused" warnings were CORRECT — a JSX comment ended `}}` not `*/}` and swallowed a whole `<p>`. Eslint contradictions deserve line-level reading, not suppression.
- `just build` clobbers `.next/` dev assets — a running dev server serves 404 CSS/JS afterward; restart dev after any production build.
- Headless CDP-attach Chromium reports (hover: none) — Tailwind hover styles AND React hover state checks fail there; use a fresh launch with `--blink-settings=primaryHoverType=2…` flags (browser-e2e-wsl reference).
- DB jsonb key is `loverracing_id` (double-r). Chunk-5b type + page now read both spellings; document in future migrations.
- Founder-locked copy overrides auditor taste: "None Wins · None Places" stays (kimi flagged grammar; page-model-notes locks it).

**Next (founder gate):** FOUNDER GATE section below — click-through on :3010, Pass 2 sweep, then merge design-alignment → main → founder-only Vercel cutover. Branch push remains purge-then-push (old commits hardcode dead sb_secret).

**Prior-session context (chunks 1–5b/7/8, completed earlier):**
- chunk-5 data: local DB migrated (4-gen sire/dam lines all 6 horses; race_log FG=2/PR=6); script at `scripts/migrate-pedigree-racelog.py`
- Live: /marketplace/[slug] 200s; /horses/:slug → 308; Nellie shows Become an Owner, Prudentia Fully Subscribed
- Git: branch NOT pushed (push-protection: old commits 2e5bc31/cb4ac12 hardcode dead local sb_secret; founder said don't push yet, purge-then-push later)
- Build lesson: subagents (nemotron) are slow/unreliable writers — orchestrator writes + gates directly; dispatch only isolated chunks, cap timeouts.

## FOUNDER GATE (~10 min)

```bash
cd /home/evo/new/evo_02 && pnpm --filter @evo/web dev -p 3010
```

Check: ① landing = evo_01 look (hero, 9 sections, glass nav, gold lockup)
② `/horses/nellie` on token layer ③ `/login` reskinned ④ `/mystable` → light
console (needs auth) ⑤ monospace financials.
**Then:** `build-loop/pass2-content-sweep.md` — walk surfaces, mark KEEP/CUT.
After sweep: merge `design-alignment` → main → founder-only Vercel cutover
(root dir `apps/web`) → verify `/horses/nellie` 200 in prod → archive evo_01 website.

## Pass 1 commit chain (design-alignment)

- `2c6ba07` W1+W2 — token layer (@theme v4, dark + light scopes, Geist, dot-grid, film grain), 12 primitives, faq/press/footer json, image trees (27M), deps (gsap/cva/radix/tailwind-merge)
- `b54e862` leads plumbing — 00007 migration, db_models types, /api/subscribe (uses **supabase-server** client: supabase-service's hand-typed Database breaks on postgrest-js 2.112.3 generics — leave as is)
- `45796d2` W3a — landing replication: NavBar (use-auth supabase adapter), Footer, CtaLeadModal, 8 sections, FAQ → CollapsePanel (framer-motion-free), page.tsx = evo_01 section sequence
- `7098055` W3b — token sweep: all hex (#d4a964/#c39853) → accent tokens; red/emerald/amber/slate → destructive/status tokens
- `acec420` W4 — MyStable light console: `mystable/layout.tsx` sets `data-theme="light"` (300ms token transition = dark shell → light x.ai console); status tokens in both scopes
- `8408b6f` audit fixes F1–F3 · `0e588e7` audit docs · `0ebf6b1` not-found.tsx `suppressHydrationWarning` (ClickUp ext class injection on 404)
- `app-mediated-google` Google OAuth re-homed to our app (consent shows our domain, not *.supabase.co): `/api/auth/google` + `/api/auth/google/callback`, `signInWithIdToken` session mint, CSRF nonce cookies, state carries `next`; shim repointed; unit test added to gate
- **Kimi audit: WARN — 0 FAILs on shipped claims.** Deferred to Pass 2 (founder calls): subscribe rate-limit/duplicate guard, leads.status constraint + email uniqueness, horse_name persistence, dup `--color-muted`/`--color-heading` defs, `--color-pure-white` misnomer. Full graph: `build-loop/audit-graph.json`.
- **Gate: `just check` → 10/10 PASS.** Dev verified: `/` 200, `/horses/nellie` 200, `/mystable`→`/login` 200, NavBar/footer/gold lockup server-rendering; 404 route clean post-`0ebf6b1`.

## Pass 2 (founder-guided, subtractive only)

`build-loop/pass2-content-sweep.md` — surface-by-surface KEEP/CUT/CUT list for
founder; known candidates flagged (footer hero dup, /marketplace nav link,
Tokinvest partner logos). Nothing executes without founder input.

## Local auth for click-through (design-alignment)

- **Google SSO is app-mediated (2026-08-30):** `/api/auth/google` plants CSRF+nonce
  httpOnly cookies and redirects to Google from OUR OAuth round-trip — the consent
  screen shows our client/domain, **never `coqtijrftaklcwgbnqef.supabase.co`**
  (GoTrue-mediated `signInWithOAuth` consent branding was investor-facing ugly).
  `/api/auth/google/callback` validates state (`<sha256(csrf)>.<next>`), exchanges
  the code, mints the session via `signInWithIdToken` — Supabase stays the identity
  store (ADR-002). Unit-tested in `google_oauth.test.ts` (in `just check`).
- Env (gitignored): `GOOGLE_OAUTH_CLIENT_ID/SECRET` (piped from supabase/.env) +
  `GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/api/auth/callback/google` (local
  only — presents the inherited client's registered URI). Unset in prod → URI
  derives from request origin; **founder Console step at cutover: add
  `https://www.evolutionstables.nz/api/auth/google/callback` to client
  `153078526638-*`** (and the local-client edit remains founder-only if used).
- Shim (`scripts/google-callback-shim.mjs`) now plain-forwards :3000 →
  `/api/auth/google/callback` (no Supabase state unwrapping). Still needs :3000:
  **`docker stop admin-panel` first** (LibreChat also binds :3000 — stop it too if
  running; `docker start` both after). GoTrue's google provider stays enabled in
  config.toml (harmless; signInWithIdToken validates against it).
- Full Google stack: `supabase start` + `pnpm --filter @evo/web dev -p 3010`
  + `node scripts/google-callback-shim.mjs`. Then `scripts/seed-local-demo.sh`.
- Password fallback: `alex@evolutionstables.nz` / `nellie-demo-2026` (local only).
- **Every `supabase stop && supabase start` wipes the local volume** — re-seed
  auth user + profile + demo holding (2% Nellie, $760 float, $76/mo) or the
  console renders empty. Trigger auto-creates the profile row from auth.users.

---

## Prior state — sprint e2e-wire (locked cb4ac12, audited)

- Share-math: lot/share/unit = increment (0.5%); min = floor (1%); percentages only; stakePctToStepUnits at checkout boundary.
- Operator auth: fail-closed 401, timing-safe sha256, httpOnly `mc_op`.
- Known non-blockers: prudentia/hotta MC seeds simplified (publish-gated); horses-data.ts legacy payload fields.

### Commands

- `just check` (10/10 must pass) · web :3010, mission_control :3011 · Supabase :54321
- pnpm: run from repo root ONLY, `export PNPM_HOME="$HOME/.local/share/pnpm"` first.

## Locked (don't reopen)

- One site. design-alignment replaces `main` after gate + Pass 2 — no splice.
- Nellie only for buy. No MC restyle. Payouts = v2. First Gear = KYC names only.
- Tokinvest horses = `upfront`. New DSLs = `subscription_float`.
- Owner/lessor = "Evolution Stables" (never "Ltd"/"Bloodstock").

## Do not

- Merge/push until founder signs off (click-through + Pass 2).
- Apply 00001–00007 to Evolution-3.0 (prod).
- Treat website Terms as the legal pack. Merge ui-sprint-1.