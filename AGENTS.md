# evo_02 — agent laws

You are pointed at this repo. **Before any other file, any other plan, any code:**

1. [`CONTINUE.md`](CONTINUE.md) — next action + locked facts (SSOT)
2. [`build-loop/e3-right-rail-deepdive.md`](build-loop/e3-right-rail-deepdive.md) — E3 locked decisions
3. [`.agents/rules/e3-sprint.md`](.agents/rules/e3-sprint.md) — E3 sprint scope fence (what you may touch, what you may NOT)

Chat memory is not SSOT. Do not invent a fourth continue file.

## Hard gates

- **No execution before founder `APPROVED:`** on the plan (build-loop Stage 2 gate).
- **No merge, no push, no deploy.** Branch `design-alignment` is LOCAL-ONLY. Cutover is founder-only.
- **No `PURCHASES_ENABLED`.** No live money. Stripe stays on test keys.
- **No migrations 00001–00008.** No touching `supabase/migrations/` or `packages/db_models/src/schema/`.
- **No edits to `apps/mission_control/`.** No edits to the `evo_01` tree (hands-off rule).
- **No prod surfaces.** Live site is still served by evo_01/02_website via Vercel.

## Done means walked

Unit tests are not enough. Before "done":

1. `just check` (10/10 must pass) — from repo root.
2. `pnpm --filter @evo/web typecheck` green.
3. Walk the surface yourself: dev server on :3010, click the new control, walk adjacent screens that share state.
4. Founder must not be the first person to click Next.

## Locked rules (do not reopen)

- Owner/lessor = **"Evolution Stables"** — never "Ltd", "Bloodstock", "Leadco".
- Vocabulary whitelist: `Settlement`/`Distribution`/`Prize money` (NOT Payout/Reward/Yield/Dividend/ROI); `Lease contribution`/`Deposit` (NOT Top-up); `Units`/`Stakes`/`Co-owners` (NOT Pieces/Parts/Shares). Zero exclamation marks. British English.
- $$$$ rule: never lead with dollars. "Attractive offer from Australia" NOT "$300k".
- Status pills: Fully Subscribed + Completed = amber outline (warning variant); Coming Soon = green. Age reads "5yr" (lowercase yr).
- Marketplace page model: `/marketplace/[slug]` = locked 2fr/1fr LEFT/RIGHT. Right rail is the E3 surface.
- Values are PERCENT everywhere (stakePctToStepUnits at checkout boundary only).
- Design tokens: use the @theme v4 token layer + `apps/web/src/dna/` — never invent colors. Clone prod look, re-wire data.

## Git discipline

- `git -C <path>` or verify cwd after cd — never chain onto a fallback directory.
- Dirty working tree after a chunk = chunk not done.
- Commit messages: `feat(web): ...` / `fix(web): ...` / `docs: ...` — one bounded change per commit.

## Session wrap

Overwrite [`CONTINUE.md`](CONTINUE.md). Do not edit `.agents/rules/` on wrap — those are frozen pointers.
