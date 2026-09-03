# investor-flow-build — session wrap 2026-09-04 (ALL 5 CHUNKS DONE)

**Status: BUILD COMPLETE — 5 of 5 chunks committed + audited + live-walked. Next: graphics/format pass (Claude + MiniMax M3, Stitch, pixel vs flow-mock/*.png).**

## Done (committed, audited)

| Chunk | Commits | Audit |
|---|---|---|
| C1 PR-A bug fixes (f2–f8) | `b4790d2` + `efb4437` | PASS-WITH-WARNINGS (1 accepted) |
| C2 PurchaseFlowModal + Step 2 term sheet | `a3d53c7` + `861b183` | PASS-WITH-WARNINGS (4 fixed, 2 accepted) |
| C3 Step 3 accept gate + audit ticks + KYC prompt | `2177c91` + `d361282` + `be01167` | PASS-WITH-WARNINGS (3 fixed, 3 accepted) |
| C4 Steps 4–6 wiring | `c58f734` | PASS (5/5 OK) |
| C5 stepper error states + Stripe error mapping | `7023c8f` | PASS-WITH-WARNINGS (WARNs FIXED + re-walked) |

Audit reports: `audit-report-chunk1.md` … `audit-report-chunk5.md`. Kickstart: `KICKSTART.md`. Chunk graph: all 5 `state: done`.

## Chunk-5 shipped

- **f9:** tap-to-edit stake; non-multiple → "Stake must be a multiple of 0.5%", over → "Stake available is 5% — reduce your stake", under → "Minimum investment is 1% — increase your stake"; empty → revert to min on blur; dull triangles at bounds; error clears on arrow click.
- **f10:** `CHECKOUT_ERROR_COPY` (9 codes) + `investorCheckoutError()` in nellie-loop.ts; route tags 400→INVALID_STAKE, Stripe 500→STRIPE_DECLINE; modal renders investor copy for all non-OK paths; **unknown/null codes → generic copy, never raw server text** (audit WARN-b fix); new test suite `checkout_error_copy.test.ts` wired into `just check` (10/10).

## Next — graphics/format pass (AFTER build, from KICKSTART.md)

Stitch wireframes → Claude + MiniMax M3, pixel-aligned vs `build-loop/flow-mock/*.png`. (Separate session/tooling — the format pass, not code.)

## Locked decisions (all honored, no re-litigation)

- Popup = Dialog over `marketplace/[slug]` · state = `?units=` URL + client step
- Step 2 header "Digital-Syndication Terms" · Step 3 header "Acceptance — {horse} your documents" · CTA "Proceed to Secure Checkout"
- Modal `max-w-lg` × `h-[720px]` · Investor Return row GREEN `text-status-active`
- Numbers from `pricingForUnits` only · Audit tick `{horse_slug, stake_pct, doc, doc_hash, user_id}` · KYC states only from server `kycStatus` · Vocabulary whitelist (Stakes/Co-owners, zero !, British English) · E4 email out of scope

## Environment notes (verified this session)

- Head `7023c8f` · branch `design-alignment` local-only · dirty tree = pre-existing terminology sweep (untouched)
- Dev :3010 up (HMR — edits picked up live; restart only after `hermes verify`)
- kimi audit: `ollama run kimi-k2.7-code:cloud < promptfile` — embed file contents; redirect stdout to a file (SIGPIPE truncates with `| head`)
- Walk scripts: `chunk4_walk.js` (C4 regression), `chunk5_walk.js` + `chunk5_alerts.js` + `chunk5_fix_verify.js` (C5)
- Walk auth: `alex@evolutionstables.nz` / `nellie-demo-2026` (kyc unverified; re-seed after supabase volume wipe)
- Headless-CDP click pattern: `page.evaluate` DOM clicks (locator clicks fail inside modal scroll container); single-open accordion: tick PDS, then open SA, then tick SA
