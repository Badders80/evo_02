# CONTINUE — evo_02

**Date:** 2026-08-28 — **PASS 1 COMPLETE + Kimi audit (WARN, F1–F3 fixed) + 404 hydration fix · Pass 2 = founder content sweep, handoff ready**
**Branch:** `design-alignment` (cut from ui-sprint-1 — superseded, never merge that). NOT merged — founder gate pending.
**Live site:** still served by evo_01/02_website via Vercel. evo_01 working tree is DIRTY — hands off.
**DoD recap:** full lifecycle built (intake → docs → MC → site → KYC-gated buy). Remaining: founder gate → Pass 2 → cutover.

---

## 🖱️ FOUNDER GATE (~10 min)

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
- **Kimi audit: WARN — 0 FAILs on shipped claims.** Deferred to Pass 2 (founder calls): subscribe rate-limit/duplicate guard, leads.status constraint + email uniqueness, horse_name persistence, dup `--color-muted`/`--color-heading` defs, `--color-pure-white` misnomer. Full graph: `build-loop/audit-graph.json`.
- **Gate: `just check` → 10/10 PASS.** Dev verified: `/` 200, `/horses/nellie` 200, `/mystable`→`/login` 200, NavBar/footer/gold lockup server-rendering; 404 route clean post-`0ebf6b1`.

## Pass 2 (founder-guided, subtractive only)

`build-loop/pass2-content-sweep.md` — surface-by-surface KEEP/CUT/CUT list for
founder; known candidates flagged (footer hero dup, /marketplace nav link,
Tokinvest partner logos). Nothing executes without founder input.

## Local auth for click-through (design-alignment)

- Google SSO wired: `supabase/config.toml` `[auth.external.google]` reads
  `SUPABASE_AUTH_EXTERNAL_GOOGLE_*` from **`supabase/.env` (gitignored, piped
  from evo_01's `.env.local` — never print).** Login page has "Continue with
  Google" → `/auth/callback?next=…`.
- **Google flow uses evo_01's inherited OAuth client** (only its NextAuth-era
  redirect URIs are registered; Console edits are founder-only). GoTrue
  presents `http://localhost:3000/api/auth/callback/google`; the shim
  (`scripts/google-callback-shim.mjs`) forwards the code to `/auth/callback`.
  **Shim must be running for Google login** — it needs host :3000, which the
  `admin-panel` docker container also wants (`docker stop admin-panel` first,
  `docker start admin-panel` to restore).
- Full Google stack: `supabase start` + `pnpm --filter @evo/web dev -p 3010`
  + `node scripts/google-callback-shim.mjs`. Then `scripts/seed-local-demo.sh`.
- Password fallback: `alex@evolutionstables.nz` / `nellie-demo-2026` (local only).
- **Every `supabase stop && supabase start` wipes the local volume** — re-seed
  auth user + profile + demo holding (2% Nellie, $760 float, $76/mo) or the
  console renders empty. Trigger auto-creates the profile row from auth.users.
- Google client may need `http://127.0.0.1:54321/auth/v1/callback` added to its
  Authorized redirect URIs in Google Cloud Console (client 851430309148-*) —
  only fixable by founder.

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