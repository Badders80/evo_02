# Today — 2026-09-01 (post Session 4: Investor Flows scoping LOCKED)

## In flight
- [ ] **Rung 4 — purchase content spec** — exact content per Flow C step (choose → accept → checkout → pay → own). Prompt: `build-loop/carry-on-prompt-rung4.md`. Output: `build-loop/purchase-content-spec.md` → then wireframes.

## Queued (after rung 4 content)
- [ ] **Wireframes** — 4 screens: marketplace, horse page (rail + gate modal), login, KYC (port from prod UX)
- [ ] **E4 plan doc** — welcome email + bcc lists + MyStable success state (content spec'd in rung 4, build after)

## Blocked / queued fixes (from Session 4 audit — all small)
- [ ] Stepper+input replaces slider (`right-rail.tsx`) — opens at min, DSL-driven bounds
- [ ] Min bound reads `campaign.min_stake_pct` (currently hardcoded 1.0, `marketplace/[slug]/page.tsx:216`)
- [ ] Cancel-stake Option A: `?units=` in `cancel_url` (`create-session/route.ts:106`) + page pre-fill
- [ ] Login redirect carries stake: `next` = pathname + units (`right-rail.tsx:271-272`)
- [ ] OAuth error path preserves `next` (`api/auth/google/callback/route.ts:37`)
- [ ] Password path friendly errors (7 codes mapped; raw Supabase messages shown)
- [ ] KYC badge: pending ("Being reviewed") / rejected ("Re-verify required") labels (`mystable-dashboard.tsx:39-48`)

## Founder TODOs (need you, not agent)
- [ ] Transfer fee % — "standard fees apply" (likely 5%+3%, undecided)
- [ ] Reservation-expired UX: auto re-reserve vs manual (open decision)
- [ ] KYC port: `rejected` enum vs prod `requires_input` reconcile
- [ ] Verify 2 trainer quotes carrying `[DRAFT — verify with trainer]` (Prudentia + First Gear)

## Cutover prep (Phase 3, founder-gated — plan only, no action)
- [ ] Test-purchase runbook (create session → pay → webhook → holding → email → vault → MyStable) — THIS run is the DoD proof
- [ ] Stripe live checklist (live keys, prod webhook endpoint)
- [ ] Cutover sequence: prod OAuth callback `153078526638-*` → Vercel → `PURCHASES_ENABLED` → archive evo_01

---
**DoD:** real investor completes a real purchase on the live site, verified end-to-end.
