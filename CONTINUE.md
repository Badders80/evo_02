# CONTINUE — evo_02

**Date:** 2026-08-26 (sprint e2e-wire CLOSE-OUT · LINE DRAWN UNDER SESSION)
**Branch:** `sprint-1-nellie-loop` — **COMMITTED & FROZEN** (not merged, not pushed)
**Live site:** still `main` (Vercel) — untouched by everything below.

**SSOT:** `evo_00/doc/ASSET_LOCK.md` · Legal pack = PDS/SA (per horse).

---

## ⛔ THE LINE (founder, 2026-08-26)

> **Content & core logic: LOCKED ✓ · Look & style: DEFERRED to UI sprint.**

Founder click-through verdict: content correct everywhere; visual brand absent (no logo, no brand
fonts, pages render semi-unstyled). Merge explicitly withheld ("DO NOT MERGE"). Next sprint =
UI sprint; see `build-loop/ui-sprint-plan.md`.

### Root cause of the look gap (diagnosed 2026-08-26 — start here, warm)
Stack is **Tailwind v4** (`@import "tailwindcss"` in `apps/web/src/app/globals.css`). In v4,
semantic utilities (`bg-card`, `text-foreground`, `border-border`, `text-primary`…) are ONLY
generated when `@theme` registers `--color-card`, `--color-foreground`, etc. Today `globals.css`
registers fonts only; `packages/brand_dna/src/theme.css` defines shadcn-style HSL *channels*
(`--card: 0 0% 10%`) that are never mapped into `@theme --color-*`. Served CSS proof: structural
utilities present (`rounded-xl`, `grid-cols-4`), semantic color utilities ABSENT; only
`--color-black/--color-white` registered. Fix ≈ 20-line `@theme` block mapping every token
(background/card/popover/primary/secondary/muted/accent/destructive/border/input/ring/radius +
status colors) using `hsl(var(--x))` channel syntax. Then logo + fonts + favicon.

---

## Current state — sprint e2e-wire, ALL CHUNKS DONE + AUDITED

Chunks C0–C5 + FIN + **BACK-1, BACK-2, MID-1, MID-2, FRONT-CONFIRM complete**.
Per-chunk audit evidence: `build-loop/chunk-audits-r3.md` · walks: `back-office-walk.md`, `mid-office-walk.md`.

- **Share-math lock (canonical):** lot/share/unit = increment (0.5%); min investment = floor (1%),
  never a divisor; units = stake ÷ step; investor-facing percentages only ("Lots" banned);
  stake must be a whole multiple of the step (adapter-enforced + tested).
- **Operator auth:** login route fail-closed 401 before cookie issuance, timing-safe sha256-digest
  compare, httpOnly `mc_op` cookie (never raw token), guard-first publish action, unit-tested helpers.
- **Boundary units fix (this session):** checkout converts investor-facing PERCENT → RPC step-units
  exactly once at the reservation boundary (`stakePctToStepUnits`). Pre-existing bug found where X%
  purchases reserved only X/2% against inventory. Stripe metadata stays percent; webhook parses float
  (no parseInt truncation) and compares mismatch-guard in matching dimensions. Locked by tests.
- **Storefront selector:** every 0.5% multiple from the 1% floor (Nellie 1.0–5.0%), capped at availability.
- **Secret hygiene / migrations / tokinvest purge / 64-hex hashes:** all verified PASS by independent
  re-query and by the paid auditor.

## Paid audit trail (deepseek-v4-pro, self-refreshing runner `build-loop/scripts/run_round3_audit.py`)

- R3: FAIL → fixed (SHARE-UI rename, migration-edit resolved w/ live-DB proof, pack runner dir-expansion bug).
- R4: FAIL → fixed (N1 half-step options, N2 step-multiple validation, N3 ENOENT) + host-found percent/unit RPC bug fixed.
- R5 (final): findings #1–26 ALL PASS; single residual #27 = first-gear MC seed `stakeStepPct 0.5` vs live DB truth `1.0`.
  Host corrected the seed line to match the DB (`10% / 1.0 / 10 shares`) and re-ran the gate green.
  **The corrected tree has NOT been re-audited by the paid gate** (fix budget exhausted per plan).

## Founder decision — RESOLVED 2026-08-26

**Line drawn:** content/logic LOCKED · look/style DEFERRED. **No merge this cycle** (founder:
"DO NOT MERGE" after click-through showed missing visual brand — logo/fonts/theme utilities).
Branch committed & frozen on `sprint-1-nellie-loop`; `main` untouched. Next steps decided in a
fresh session starting from `build-loop/ui-sprint-plan.md`.
Then: single future merge ships logic + look together → push origin → feed gbrain
(`fact/e2e-wire-pipeline`: locked share rule + operator cookie gate + boundary unit semantics;
MCP `POST localhost:3456/mcp`, Bearer `GBRAIN_API_KEY`).

### Known non-blockers (documented, untouched)
- prudentia/hotta MC seeds show simplified track-record values (live closed rows differ; publish-gated off).
- `horses-data.ts` publish-payload carries legacy ignored `totalShares/sharesAvailable` fields (pipeline computes its own).

### Commands
- `just check` (lint + typecheck + tests, 10/10 must pass)
- `pnpm --filter @evo/mission_control test` / `pnpm --filter @evo/web test`
- Dev: web :3010, mission_control :3011
- Local Supabase :54321 (svc key from gitignored `.env.local`)

---

## Locked (don't reopen)

- One site. Branch replaces `main` later — do not splice pages into a separate landing.
- Nellie only for buy. Others visible, not buyable. No all-horses loop. No MC restyle.
- Prudentia + Hotta: who-owns-what locked in seed/MC (5% each, fully sold). Payouts = **v2**. First Gear = KYC names only, no stakes.
- Tokinvest horses = one-time/`upfront`. New DSLs = `subscription_float`.
- Owner/lessor = "Evolution Stables" (never "Ltd"/"Bloodstock"). NZTR-authorised names per `evo_00/doc/IDENTITY.md`.

## Do not

- Merge/push until founder signs off (R5 residual documented above).
- Apply `00001`–`00006` to Evolution-3.0 (prod).
- Treat website Terms as the legal pack.
