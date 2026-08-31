# Today — 2026-09-01 (parallel work while E3 runs in Antigravity)

## In flight
- [ ] **E3 — right-rail + acceptance gate** (Antigravity, Stitch MCP) — waiting on its approval gate; founder reviews plan before execution
- [ ] **C15 — first-gear latestUpdateUrl** (dispatched, DB-only) — was prose+404 URL → null. Verify: `build-loop/c15-result.txt`

## Queued (safe now — no E3 file overlap)
- [ ] **E4 plan doc** — build-loop/ only; makes E3→E4 handoff instant (welcome email, bcc lists, MyStable success state, vault docs)

## Blocked (touches E3's files — wait for E3 to land)
- [ ] **JSON-LD** — `horseWebPageJsonLd` exists in `lib/seo.ts`, unused on /marketplace/[slug]. Same file E3 edits → defer to avoid merge conflict

## Founder TODOs (need you, not agent)
- [ ] Verify 2 trainer quotes carrying `[DRAFT — verify with trainer]` (Prudentia + First Gear)
- [ ] Close 3 deferred E3 decisions: PDF CTA · acceptance record location (schema change? → founder-gated migration) · pillars validation
- [ ] E3 approval gate: review Antigravity's plan when it stops

## Cutover prep (Phase 3, founder-gated — plan only, no action)
- [ ] Test-purchase runbook (create session → pay → webhook → holding → email → vault → MyStable)
- [ ] Stripe live checklist (live keys, prod webhook endpoint)
- [ ] Cutover sequence: prod OAuth callback `153078526638-*` → Vercel → `PURCHASES_ENABLED` → archive evo_01

---
**DoD:** real investor completes a real purchase on the live site, verified end-to-end.
