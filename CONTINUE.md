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

## Track B — gbrain repairs (in progress, separate session)

Brief: `build-loop/track-b-brief.md`. Progress when it lands:
- Sync script `|| true` fix: edited (marker now conditional on data-step success).
- Queue drain: was mid-flight (15 waiting jobs; CLI path attempted via service stop —
  **gbrain-mcp.service was stopped then restarted by host, verified active**).
- Hub index repair, dedupe, CLAUDE.md naming fix: pending. Stray `/home/evo/evo_01/` delete stays FOUNDER-gated.

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
