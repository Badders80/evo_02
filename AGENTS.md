# website — product agent laws

**Governing laws:** [`../SSOT/AGENTS.md`](../SSOT/AGENTS.md) — single source of laws. Read it first.
**Next action:** [`CONTINUE.md`](CONTINUE.md). **Scope fence:** [`.agents/rules/e3-sprint.md`](.agents/rules/e3-sprint.md).

## Product locks (website-specific; nothing here restates SSOT)

- Hard gates: no push/deploy (branch `design-alignment` LOCAL-ONLY). Founder approved 2026-09-04 the local merge of `style-guide-lock-in` into `design-alignment`. Still no push, no deploy. No migrations 00001–00008; no `apps/mission_control/` or old-workspace edits; no prod surfaces (live site still served by the old evo_01 build via Vercel until go-live).
- Style patterns: [`../SSOT/doc/STYLE_GUIDE.md`](../SSOT/doc/STYLE_GUIDE.md) (LOCKED 2026-09-04). Do not paste the guide into `GEMINI.md` / `CLAUDE.md` / `HERMES.md` — those harnesses read this file (`GEMINI.md` already chains here).
- Money: prod `PURCHASES_ENABLED` stays **OFF** until founder go-live with live keys. Dev :3010 is **ON** with `sk_test_` (`CONTINUE.md` locked 2026-09-01) — test mode cannot move real money; that is the DoD walk path.
- Locked: vocabulary whitelist (Stakes/Co-owners, Settlement/Distribution/Prize money, Lease contribution/Deposit, Stake/Co-owners; zero exclamation marks; British English) · $$$$ rule (never lead with dollars) · status pills (Fully Subscribed + Completed = amber outline, Coming Soon = green; age reads "5yr") · `/marketplace/[slug]` = locked 2fr/1fr LEFT/RIGHT · values PERCENT everywhere (`stakePctToStepUnits` at checkout boundary only) · design tokens from `apps/web/src/dna/` + @theme v4 — never invent colors · visual patterns from `../SSOT/doc/STYLE_GUIDE.md` via `@evo/ui`
- Build loop: [`build-loop/README.md`](build-loop/README.md) — cycle dirs & one-client-first per SSOT build-loop skill Rules 12–13.
- UI tool catalog (which skill/MCP for which job): `../../workspace/war-room/reference/ui-tool-catalog.md` — reference only; enforcement laws stay in this file + `../SSOT/`.

## Verify (island walk commands — done-means-walked is SSOT law 4)

1. `just check` (10/10 must pass) — from repo root.
2. `pnpm --filter @evo/web typecheck` green.
3. Walk the surface yourself: dev server on :3010, click the new control, walk adjacent screens that share state.
4. Founder must not be the first person to click Next.

## Git + wrap

- `git -C <path>` or verify cwd after cd — never chain onto a fallback directory.
- Dirty working tree after a chunk = chunk not done. Commit messages: `feat(web): ...` / `fix(web): ...` / `docs: ...` — one bounded change per commit.
- Session wrap: overwrite [`CONTINUE.md`](CONTINUE.md). Do not edit `.agents/rules/` on wrap — those are frozen pointers.
