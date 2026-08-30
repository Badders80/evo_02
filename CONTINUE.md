# CONTINUE — evo_02

**Date:** 2026-08-29 — **PASS 1 COMPLETE + Kimi audit (WARN, F1–F3 fixed) + 404 hydration fix + local Google SSO + FIREBASE TEMPLATE REMOVED · Pass 2 = founder content sweep, handoff ready**
**Prod auth is now Supabase-native** (evo_01 swap live 2026-08-29, `d3d3a4b`) — evo_02 Supabase auth now aligns with prod layer (Google OAuth client differs: local uses inherited `851430309148-*` + shim, prod uses `153078526638-*` + native callback; reconcile at cutover).
**Branch:** `design-alignment` (cut from ui-sprint-1 — superseded, never merge that). NOT merged — founder gate pending.
**Page model:** `build-loop/page-model-notes.md` — LEFT/RIGHT page model planning notes (founder walkthroughs).
**Live site:** still served by evo_01/02_website via Vercel. evo_01 working tree is DIRTY — hands off.
**DoD recap:** full lifecycle built (intake → docs → MC → site → KYC-gated buy). Remaining: founder gate → Pass 2 → cutover.

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