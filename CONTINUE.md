# CONTINUE — evo_02

**Date:** 2026-08-31 — **HORSE PAGE DEPTH SPRINT COMPLETE (chunks 1-7 + E1/E2, all gated + verified). Branch `design-alignment` local-only, 9 commits. Next: kimi audit → Sprint 2 (E3 terms) → Sprint 3 (E4 post-purchase) → cutover.**
**Prod auth is now Supabase-native** (evo_01 swap live 2026-08-29, `d3d3a4b`) — evo_02 Supabase auth now aligns with prod layer (Google OAuth client differs: local uses inherited `851430309148-*` + shim, prod uses `153078526638-*` + native callback; reconcile at cutover).
**Branch:** `design-alignment` (cut from ui-sprint-1 — superseded, never merge that). NOT merged — founder gate pending.
**Page model:** `build-loop/page-model-notes.md` — LEFT/RIGHT page model planning notes (founder walkthroughs).
**Live site:** still served by evo_01/02_website via Vercel. evo_01 working tree is DIRTY — hands off.

---

## Session wrap (2026-08-31 — Horse Page Depth: chunks 1-7 + E1/E2 SHIPPED, verified)

**Goal:** horse pages deep enough that an investor says "they know this horse well enough for my money." All 7 plan chunks + Sprint 1 (E1/E2) complete, gated, verified.

**Commits (design-alignment, LOCAL-ONLY):**
- `faa6632` chunk-1: migration 00008 (race_log column, both locations) + scripts/sync-race-log.py (knowledge repo → inventory, snake→camel)
- `aeef745` chunk-3: MC schema — campaignNarrative/trainerQuote/nextUp/latestUpdateUrl/updateCount (legal_engine types → writer → intake-adapter → reader + HorseCampaign)
- `464f13c` chunk-4: TrainerProfile.bio + full Wexford/Stephen Gray bios
- `9c529c8` fix: new fields persist at inventory insert (test caught the gap) + round-trip test
- `6e81322` chunk-2: race summary computed from race_log (TDD, never hardcoded) + trainer bio line
- `e9d3e5f` scripts/apply-content.py — founder-approved drafts → inventory.soft_legal + Silent Gavel voice check
- `5ed626e` chunk-6: CampaignStatusBlock (what's-next + update link + count + quote)
- `2755701` fix: block renders ALL present blocks (was returning first only)
- `f4ca17e` E1+E2: full marketplace card clickable + MediaDeck carousel wired

**Gates:** `just check` 10/10 · `hermes verify --json --skip-start` ok:true · live walk /marketplace + 3 horse pages 200 · MediaDeck carousel + card click verified in HTML.

**Content applied (founder folder-gate PASSED):** Prudentia (R65→R75, welfare-first spell, 31 updates), Coco (Andrew Scott quote, spring trials), First Gear (attractive offer from Australia, 6 winners from 6 foals, completed showcase). Drafts in `01_evolution/horses/{slug}/content-draft.md`. **Prudentia + First Gear trainer quotes carry `[DRAFT — verify with trainer]` — founder must verify before live.**

**Key fixes this session (subagent timeouts → orchestrator finished):**
- Subagents time out at 600s on packaging — work usually lands; ALWAYS check git status + files before re-dispatching.
- Subagent wrote jest-style test (repo uses tsx + node:assert) + literal `\n` corruption in marketplace-listing-grid.tsx — both caught by typecheck, fixed.
- CampaignStatusBlock returned first block only — composed all present blocks.
- `hermes verify` full readiness probe collides with running dev server (EADDRINUSE) — use `--skip-start`; stale-boot 500s on [slug] → restart dev, not code.

**Planning artifacts (build-loop/):** `horse-page-depth-plan.md` (strategy, locked rules) · `plan.md` + `plan-graph.json` (7 chunks, structurally valid) · `review-synthesis.md` (2-model review, all fixes applied) · `e3-right-rail-deepdive.md` (pre-purchase terms, founder decisions locked) · `go-live-dod.md` (6-layer skeleton + sprint map) · `reviewer-a-findings.json`.

**Locked rules (founder):** $$$$ rule (never lead with dollars — "attractive offer from Australia" NOT "$300k") · hook principle (dial-movers bait the click, values-aligned) · Silent Gavel (voice SSOT evo_00/doc/) · Flight Club (selling ownership without selling it) · 04_comms = build debt (SMTP for automated emails).

**Dev server:** does NOT auto-start on reboot — `cd /home/evo/new/evo_02/apps/web && pnpm dev --port 3010` (background). Stale-boot server 500s on [slug] with missing vendor-chunk error → restart, not code.

---

## NEXT — Sprint map (founder-approved order)

| Sprint | Scope | Status |
|---|---|---|
| 1 | E1 + E2 (quick wins) | ✅ DONE (f4ca17e) |
| 2 | **E3 — pre-purchase terms** (right-rail drop-downs from term-sheet DNA, acceptance gate at checkout tail, term-sheet order in MC: term sheet → PDS → SA) | ⏳ NEXT — deep-dive ready: `build-loop/e3-right-rail-deepdive.md` |
| 3 | **E4 — post-purchase** (welcome email via SMTP, investor → bcc_lists/{slug}.json, MyStable success state, vault docs surfaced) | ⏳ depends on E3 checkout tail |
| 4 | Cutover (purge-then-push, merge, Vercel, prod OAuth client 153078526638-* add /api/auth/google/callback, PURCHASES_ENABLED, archive evo_01) | ⛔ founder |

**Before Sprint 2:** kimi-code-audit on the full diff (chunks 1-7 + E1/E2) → audit-report.md + audit-graph.json. Founder verifies the 2 trainer quotes. E3 deferred questions: downloadable investment summary? pillars validated? acceptance record location?

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