# format-pass — session wrap 2026-09-04 (ALL 7 CHUNKS DONE)

**Status:** FORMAT PASS COMPLETE — 4 commits landed, 3 verify-only chunks, all gates green. Visual polish pass against prod reference + flow-mock surfaces.

## Done (committed, audited)

| Chunk | Scope | Commit | Audit |
|---|---|---|---|
| F1 | Right rail polish (verify-only) | LARGELY LANDED at `0c96996` (3 commits past `7023c8f`) | PASS (code-level) |
| F2 | Modal shell + Step 2 term sheet | `145a8ba` | PASS-WITH-FIXES → 1 WARN (sm: padding) fixed |
| F3 | Step 3 accept gate polish | (no commit — verify-only, matches mockup) | APPROVE |
| F4 | Step 4 verify polish | (no commit — verify-only) | APPROVE-WITH-FIXES → WARN #6 spec copy drift, OUT OF SCOPE (chunk-4 pre-existing) |
| F5 | Step 5 pay polish (error affordance) | `7b8ca48` | APPROVE-WITH-FIXES → WARN #6 affordance polish applied |
| F6 | Step 6 own (MyStable success) polish | `9bc1eed` | (visual-only, byte-identical copy) |
| F7 | Error states visual polish | `9bc1eed` (combined with F6) | (visual-only, byte-identical copy) |

## F2 shipped (the headline)

- **Modal height:** `h-[720px]` → `h-[900px]` to match prod's natural content fit for Step 2 term sheet.
- **Viewport guard:** `max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)]` — never clips on short viewports, scrolls inside when clamped.
- **Spec deviation logged:** `purchase-content-spec.md:34` rewritten from "LOCKED 2026-09-03" to "bumped 2026-09-04 + viewport-guard clause".

## F5 + F6 + F7 shipped (visual-only polish)

- All locked copy byte-identical (`investorCheckoutError()` strings, stepper error strings, success-state copy).
- Error affordance styling aligned (rounded-xl, p-4, leading-relaxed, foreground/90 text — was destructive-red on destructive-10 which clashed).
- Success-state surface polished (p-6, status-active glow shadow, dismiss button padding).

## F3, F4, F1 verify-only

- **F3:** Step 3 markup already matches mockup pixel-for-pixel (accordion + Completed badge + audit ticks + KYC prompt). No changes needed.
- **F4:** Step 4 KYC state machine (3 states: prompt/pending/rejected) already correct. Stub marker clear (`/auth/verify` absent, CTA intentionally inert per chunk-4 spec).
- **F1:** Right rail landed in 3 prior commits (`6241106`, `b3bc86a`, `0c96996`). Verified `lg:fixed lg:top-20` + JS track-positioning at L341–L367.

## Pre-existing gaps NOT addressed (out of format-pass scope)

1. **F4 spec copy drift:** Spec says "Required under New Zealand law before you become a co-owner." Modal says "This is a one-time check under New Zealand law." Pre-existing chunk-4 decision. Track as separate work item (chunk-4 retro or copy review).
2. **KYC port itself:** `/auth/verify` does not exist in evo_02 yet. C4 wired the prompt surface only. KYC visual stays a stub.
3. **E4 welcome email:** Out of scope per spec (separate workstream).
4. **PDS/SA internal scroll in Step 3:** Known ugliness, founder 2026-09-04 — revisit later.
5. **Modal height spec deviation:** Logged in `purchase-content-spec.md:34`. Founder-approved 2026-09-04.
6. **Step 6 copy drift:** Spec says "Welcome to the {legalName} syndicate". Modal says "Welcome to the syndicate — your {units}% stake in {slug} is being finalised." Pre-existing chunk-1 copy decision (slug vs legalName). Visual polish landed; copy left alone per format-pass no-copy-edits rule.

## Locked decisions honored

- Modal popup = Dialog over `marketplace/[slug]` · state = `?units=` URL + client step (preserved)
- Modal `max-w-lg × h-[900px]` (bumped from locked 720px) + responsive guard
- Step 2 header "Digital-Syndication Terms" · Step 3 header "{horse} — your documents" · CTA "Proceed to Secure Checkout"
- Numbers from `pricingForUnits` only · Audit tick `{horse_slug, stake_pct, doc, doc_hash, user_id}` · KYC states only from server `kycStatus`
- Vocabulary whitelist (Stakes/Co-owners, zero !, British English) · E4 email out of scope
- Geist font stays (source = evo_01 codebase, NOT mockup screenshot)
- Gold tokens pre-existing (no new token added)

## Environment notes (verified this session)

- HEAD: `9bc1eed` · branch `design-alignment` local-only
- Dev :3010 up (HMR edits picked up live; restart only after `hermes verify`)
- `just check` 10/10 green at each commit
- kimi-code-audit: `ollama run kimi-k2.7-code:cloud < chunkF{N}-audit-prompt.txt`
- Walk auth: `alex@evolutionstables.nz` / `nellie-demo-2026` (kyc unverified; re-seed after supabase volume wipe)
- Audit files: `plan-audit-{prompt,output,clean}.txt` + `plan-reaudit-*` + `chunkF{2,3,4,5}-audit-*`

## Next — founder eyeballs (after today's wrap)

1. Walk `/marketplace/nellie` on :3010 — confirm visual matches prod Step 2 reference
2. Spot-check error surface (force INVALID_STAKE or expired reservation) — confirm polish reads cleanly
3. Spot-check MyStable success state (test checkout flow → /mystable?checkout=success)
4. Sign off format-pass OR flag any additional polish items

After sign-off: ready for **E4 (welcome email)** + **KYC port** + **real PDS/SA docs** + **cutover sequence** (per `go-live-dod.md` Phase 3).
