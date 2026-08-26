# CONTINUE — evo_02

**Date:** 2026-08-26 night — **TRACK A COMPLETE (UI wired, committed 22338b4) · Track B in progress (gbrain repairs, separate session)**
**Branch:** `ui-sprint-1` @ 22338b4 (cut from cb4ac12). NOT merged — founder click-through pending.
**Live site:** still served by evo_01/02_website via Vercel. evo_01 working tree is DIRTY — hands off. Cutover = founder manual step after click-through.

**SSOT:** `evo_00/doc/ASSET_LOCK.md` · Legal pack = PDS/SA (per horse).

---

## ⛔ THE LINE (founder, 2026-08-26)

> **Content & core logic: LOCKED ✓ (cb4ac12) · UI look: WIRED ✓ (22338b4) — pending founder click-through.**

### Track A wrap — what changed (commit `sprint(ui):` 22338b4 on ui-sprint-1)

1. **@theme tokens** — `apps/web/src/app/globals.css`: brand HSL channels from
   `packages/brand_dna/src/theme.css` mapped into Tailwind v4 `@theme --color-*`
   (background/card/border/foreground/etc.). Root cause of raw pages fixed.
2. **Favicon + logo** — favicon set wired in `apps/web/src/app/layout.tsx`;
   horizontal-gold lockup in `apps/web/src/components/header.tsx`.
3. **Fonts** — no change needed: design doc (`evo_00/doc/DESIGN_SYSTEM_AND_TOKENS.md` §2.3)
   specs ui-sans-serif (UI) + ui-monospace (financial tables); both already mapped.

### Verification evidence (re-run host-side after subagent timeout)

- `just check` → **10 successful / 10 total** ✅ (lint + typecheck + tests)
- Compiled CSS grep (`apps/web/.next/static/css/app/layout.css`) → `.bg-card`, `.bg-card\/40`,
  `.bg-card\/60`, `.border-border`, `.border-border\/60`, `.border-border\/80`, `.text-foreground` all generate ✅
- Zero diff confirmed on: `packages/legal_engine/**`, `apps/mission_control/src/lib/**`, migrations ✅

## 🖱️ FOUNDER CLICK-THROUGH CHECKLIST (~5 min)

```bash
pnpm --filter @evo/web dev -p 3010
```

1. [ ] Header logo renders (horizontal-gold lockup, dark header).
2. [ ] Favicon shows in browser tab (gold SVG).
3. [ ] Cards have dark elevation surfaces (`bg-card`, not flat black).
4. [ ] Gold accents present (#d4a964 — selection, buttons, highlights).
5. [ ] Pricing/cap-table figures render monospace.
6. [ ] No layout breakage on: home, `/horses/nellie`, marketplace.

**Happy →** merge `ui-sprint-1` → main locally; then FOUNDER-only: point Vercel at
`Badders80/evo_02` (root dir `apps/web`), verify `/horses/nellie` returns 200,
then demote evo_01/02_website to archive.

---

## Track B — gbrain repairs ✅ COMPLETE (2026-08-26 ~20:45 NZST)

Evidence-backed wrap:
1. **Sync script fixed** — `|| true` removed from data steps; marker conditional; journal shows clean runs (20:27, 20:37, 20:41).
2. **Sync verified** — evo00 `staleness_class: fresh`, last-sync today 08:13Z @ commit b8d723d; `unacknowledged_failures: 0`.
3. **Queue drained** — 14 facts-absorb + 1 embed-backfill executed inline via CLI (`jobs submit --follow`); stats now 0 waiting / 15 completed / 0 failed.
4. **Hub index repaired** — fact/e2e-wire-pipeline linked into hub (ranks #1 on search), 3 missing cards added to index, timeline entry added for cb4ac12 lock + ui-sprint-1.
5. **Dedupe done** — 17 default-source duplicates of evo00 docs soft-deleted (72h recoverable); dead `new` source removed (0 pages). Brain score 83→84, pages 57→39, 0 dead links.
6. **Naming drift** — `/home/evo/new/evo_00/AGENTS.md` got git-discipline law (#5). Home CLAUDE.md rewrite BLOCKED (protected-file approval needed — pending founder OK). Stray `/home/evo/evo_01/` inspected: only `05_industry-data/racing-content/output`, NO git — safe to delete, FOUNDER-GATED.
Deferred: gbrain self-upgrade 0.46.23→0.46.29 (parked).

---

## Prior state — sprint e2e-wire (locked cb4ac12, all chunks done + audited)

- Share-math lock (canonical): lot/share/unit = increment (0.5%); min investment = floor (1%);
  units = stake ÷ step; investor-facing percentages only ("Lots" banned); whole multiple enforced + tested.
- Operator auth: fail-closed 401 before cookie issuance, timing-safe sha256 compare, httpOnly `mc_op`.
- Boundary units fix: checkout converts PERCENT → RPC step-units once (`stakePctToStepUnits`);
  Stripe metadata stays percent; webhook float-parse + mismatch-guard.
- Paid audit trail R3–R5 in `build-loop/paid-audit-*`; R5 residual #27 resolved host-side
  (seed line corrected to match live DB truth). Full detail: `build-loop/chunk-audits-r3.md`.

### Known non-blockers (documented, untouched)
- prudentia/hotta MC seeds show simplified track-record values (live closed rows differ; publish-gated off).
- `horses-data.ts` publish-payload carries legacy ignored `totalShares/sharesAvailable` fields.

### Commands
- `just check` (lint + typecheck + tests, 10/10 must pass)
- `pnpm --filter @evo/mission_control test` / `pnpm --filter @evo/web test`
- Dev: web :3010, mission_control :3011
- Local Supabase :54321 (svc key from gitignored `.env.local`)

---

## Locked (don't reopen)

- One site. Branch replaces `main` later — do not splice pages into a separate landing.
- Nellie only for buy. Others visible, not buyable. No all-horses loop. No MC restyle.
- Prudentia + Hotta: who-owns-what locked in seed/MC (5% each, fully sold). Payouts = v2. First Gear = KYC names only.
- Tokinvest horses = one-time/`upfront`. New DSLs = `subscription_float`.
- Owner/lessor = "Evolution Stables" (never "Ltd"/"Bloodstock"). NZTR-authorised names per `evo_00/doc/IDENTITY.md`.

## Do not

- Merge/push until founder signs off post-click-through.
- Apply `00001`–`00006` to Evolution-3.0 (prod).
- Treat website Terms as the legal pack.
