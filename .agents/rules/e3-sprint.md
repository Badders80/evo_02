# E3 Sprint — Scope Fence (read before ANY edit)

**Sprint:** E3 — pre-purchase terms (right-rail drop-downs + acceptance gate).
**Source of truth for decisions:** `build-loop/e3-right-rail-deepdive.md` (founder-locked 2026-08-31).
**Design source:** Stitch project "E3 Pre-Purchase Terms" (designs fetched via Stitch MCP, implemented from fetched design).

## You may touch (whitelist)

- `apps/web/src/components/horse/right-rail.tsx` — the E3 surface
- `apps/web/src/components/marketplace/` — card/badge components that feed the rail
- `apps/web/src/app/marketplace/[slug]/page.tsx` — page wiring for the rail
- `apps/web/src/app/api/checkout/create-session/route.ts` — checkout tail (acceptance gate handoff)
- `apps/web/src/app/api/webhooks/stripe/route.ts` — ONLY if the acceptance record needs it (see deep-dive §5)
- `apps/web/src/lib/nellie-loop.ts` — pricing/units helpers (read-only unless a gate needs a new helper)
- `apps/web/src/tests/` — new tests for E3 surfaces
- `build-loop/` — planning artifacts only
- `CONTINUE.md` — session wrap only

## You may NOT touch (blacklist — hard)

- `supabase/migrations/` and `packages/db_models/src/schema/` — **no new migrations in this sprint.** If the acceptance record needs a schema change, STOP and flag it to the founder (it becomes a separate founder-gated migration).
- `apps/mission_control/` — operator console is out of scope, no restyle, no edits.
- `apps/web/src/app/mystable/` — post-purchase (E4) is a SEPARATE sprint. Do not build E4 surfaces here.
- `apps/web/src/lib/investor-mailer.ts`, `bcc-lists*`, `/api/bcc` — E4 scaffolding was rolled back 2026-09-01. Do not recreate it in this sprint.
- `apps/web/public/` — no new public assets unless the design requires them (then flag first).
- `apps/web/src/lib/horses-data.ts` — data layer root cause only; no caller patches.
- `evo_01/`, `evo_00/` trees — hands-off.
- `PURCHASES_ENABLED`, live Stripe keys, prod OAuth — never.

## Rules

1. **Implement from the fetched Stitch design.** If the design contradicts the deep-dive, the deep-dive wins — flag the conflict to the founder, do not silently pick.
2. **No scope creep.** If a task needs a file outside the whitelist, STOP and ask. Do not "just also fix" adjacent things.
3. **No new dependencies** unless the design requires them (flag first).
4. **Design tokens only.** @theme v4 tokens + `apps/web/src/dna/`. Never invent colors, radii, or fonts.
5. **Voice compliance.** Every new string passes the vocabulary whitelist (AGENTS.md). No exclamation marks. British English.
6. **$$$$ rule.** Never lead with dollars. Price appears as computed monthly pricing in the rail, not as a hook.
7. **Status pills.** Fully Subscribed + Completed = amber outline; Coming Soon = green. The rail header pill is the CTA ("Become an Owner" / "Acquire Units"), not a status.
8. **Acceptance gate flow (locked):** investor sees horse → decides X% → sees cost → PDS scroll-through + checkbox → SA scroll-through + checkbox → checkout. Button disabled until both checked.
9. **Deferred (do not build):** "Download Terms Summary (PDF)" secondary CTA — founder decision pending. Acceptance record location — deep-dive §7 open question; if the design implies a record, flag it.
10. **Commit discipline.** One bounded change per commit on `design-alignment` (LOCAL-ONLY). Never push. Never merge.
11. **Slider math (locked share-math, CONTINUE.md):** min 1%, step 0.5%, percentages only. Pricing via `pricingForUnits(campaign.wholesaleMonthlyNzd, units)` from `nellie-loop.ts` — never invent pricing math. `stakePctToStepUnits` stays at the checkout boundary.
12. **Approval gate (build-loop GATE 1):** after planning + review, STOP and present to the founder. No execution of any kind until the founder approves. "Ready to proceed" is not approval.
13. **Gate content source:** the PDS/SA shown in the acceptance gate come from the existing compiled legal pack (`getCompiledLegalPackForCampaign` in `horses-data.ts`) — no new legal_engine work, no new document rendering.

## Verification (before "done")

1. `just check` (10/10) from repo root.
2. `pnpm --filter @evo/web typecheck` green.
3. Dev server :3010 — walk the rail: expand each pillar, slider updates pricing, gate modal scrolls + checkboxes enable the button.
4. Adjacent screens: /marketplace cards, horse page hero, status pills — unchanged.
5. Report to founder with evidence (screenshots or CDP walk output). Founder clicks Next.
