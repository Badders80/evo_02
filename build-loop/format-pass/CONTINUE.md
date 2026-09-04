# format-pass — session wrap 2026-09-04 (ALL 7 CHUNKS DONE)

**Status:** FORMAT PASS COMPLETE — 18 chunks shipped, working tree clean of format-pass changes (dirty tree is pre-existing terminology sweep). **Session wrap 2026-09-04.**

## What's done (chunks F1–F18)

| Chunk | Scope | Commit | Audit |
|---|---|---|---|
| F1 | Right rail polish (verify-only) | LARGELY LANDED at `0c96996` | PASS (code-level) |
| F2 | Modal shell + Step 2 term sheet | `145a8ba` | PASS-WITH-FIXES → sm: padding fixed |
| F3 | Step 3 accept gate polish | (verify-only) | APPROVE |
| F4 | Step 4 verify polish | (verify-only) | APPROVE-WITH-FIXES → spec copy drift OOS |
| F5 | Step 5 pay polish (error affordance) | `7b8ca48` | APPROVE-WITH-FIXES → WARN applied |
| F6 | Step 6 own (MyStable success) polish | `9bc1eed` | visual-only, byte-identical |
| F7 | Error states visual polish | `9bc1eed` (combined) | visual-only, byte-identical |
| **F8** | **Lift PurchaseFlowModal to page-level (global CTA mount)** | **`1ed18e2`** | **APPROVE (10/10 OK)** |
| F9 | Step 1 right rail prod-evo_01 polish | `98e481a` | visual-only |
| F10 | In-modal back Step 3 → Step 2 | `aa2ea00` | APPROVE-WITH-FIXES → copy trimmed, type=button |
| F11 | Remove dot-grid background (marketplace + login) | `e4cacc0` | APPROVE (7/7 OK) |
| F12 | Reduce gold on login page | `98e481a` | visual-only |
| F13 | Right-rail text-column alignment | `d368285` | APPROVE (10/10 OK) |
| F14 | Remove duplicate green status chip (right rail) | `5fa046e` | visual-only (text reverted per founder) |
| F15 | mix-blend-mode: lighten on horse images | `d368285` | visual-only |
| F17 | L-section back-link alignment | `5fa046e` | visual-only |
| **F18** | **Align mystable + status badge to canonical style** | **`6574e90`** | visual-only (sweep) |

## What is missing — **STYLE GUIDE IS NOT LOCKED IN** ⚠️

**Critical risk:** This entire format-pass arc has been **reactive** — founder spots a visual mismatch, I fix that surface, repeat. We never locked the canonical style guide into a single source of truth, so:

1. **No documented style guide.** The "canonical" patterns I used (eyebrow `font-medium uppercase tracking-[0.2em]`, back-link `text-muted-foreground + ArrowLeft + hover:text-accent`, `font-mono` reserved for tabular data, no `font-serif italic` decoration) are **implicit** in the right rail + my sweep edits. They live in my head + in scattered `className` strings, not in `evo_00/doc/STYLE_GUIDE.md`.

2. **No shared component primitives.** Every surface rolls its own eyebrow / back-link / status-pill / stat-row. When a new surface ships, the next mismatch appears. Right rail uses inline `<div className="...">`, mystable uses inline `<span className="...">`, login uses `<button>`, CampaignStatusBadge uses `<Badge>` — four different implementations of the same pattern.

3. **No diff against prod (`evo_01/02_website`).** I never formally diff'd the new build against prod to confirm we ARE matching the reference. The canonical patterns I used came from the right rail + the few prod screenshots you shared, not from a documented source.

4. **Many surfaces not yet audited.** F18 covered marketplace horse page L section + mystable + (partially) login. Not yet audited:
   - Marketplace listing grid (`marketplace-listing-grid.tsx`)
   - Marketplace card hover/expanded states
   - Mystable sub-tabs (feed / vault / billing)
   - Login (after F12 + F11) — only one `font-mono` left, likely OK
   - Mission control (`apps/mission_control/`)
   - Landing page / marketing surfaces
   - FAQ / learn / returns pages
   - Documents gate, detail tabs

5. **Tokens exist but aren't enforced.** `--color-gold` / `--color-accent` / `--color-status-active` exist in `globals.css` but some code still uses the brighter `--color-success` (#22c55e vs status-active #10b981). F18 fixed CampaignStatusBadge, but `Badge` component itself still has `success` variant.

**Risk if we don't lock this in:** we'll keep doing reactive fix-pass loops. Each new surface ships with its own stylistic interpretation. The build stays functional but visually drifts surface-by-surface. By cutover, the whole thing is a patchwork.

## Next cycle — **STYLE GUIDE LOCK-IN** (proposed scope)

This is the conversation starter for the next planning round. Proposed scope:

**Phase A — Document the canonical style guide (1 chunk, ~half day)**
- Write `evo_00/doc/STYLE_GUIDE.md` derived from the right rail + prod screenshots + the patterns we landed on
- Diff against `evo_01/02_website` prod to confirm we're not inventing vs matching
- Lock the eyebrow / back-link / status-pill / stat-row / CTA / image-bg / dot-grid rules

**Phase B — Extract shared primitives (3-4 chunks, ~1 day)**
- `<Eyebrow>` — replaces inline `text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground`
- `<BackLink href icon>` — replaces `inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-accent transition-colors` + ArrowLeft
- `<StatusPill status="listed"|"fully_subscribed"|"coming_soon"|"completed">` — replaces both right-rail `statusChip` + CampaignStatusBadge (single component, single token set)
- `<StatRow label value>` — replaces right-rail PRICE/RETURN/DURATION pattern
- `<WhitePillCTA onClick>` — the right-rail CTA style (white pill, gold-on-hover)

**Phase C — Refactor every surface (many chunks)**
- Marketplace horse page L+R + MediaDeck + DetailTabs + DocumentsGate
- Mystable + tabs + success state
- Login + signup
- Marketplace listing grid
- Mission control
- FAQ / learn / returns
- All new surfaces auto-use the primitives

**Phase D — Lock enforcement**
- Add a lint rule (eslint plugin or simple grep check) that flags any inline `font-medium uppercase tracking-[0.2em]` etc. — must use `<Eyebrow>`.
- Add a Storybook (or similar) for the primitives.
- Update `AGENTS.md` + `GEMINI.md` to point at `STYLE_GUIDE.md` as the single source.

**Estimated effort:** Phase A + B = ~1.5 days. Phase C = ~2-3 days depending on surface count. Phase D = ~half day. Total ~4-5 days.

**Alternative:** keep the reactive format-pass loop going and accept the visual drift. **Not recommended** — we'll hit this same wall at cutover.

## Head

`6574e90` on `design-alignment` local-only. All gates green. Working tree dirty tree = pre-existing terminology sweep (out of format-pass scope).

## Pre-existing gaps NOT addressed (out of format-pass scope, for follow-up)

1. **F4 spec copy drift** — Step 4 KYC prompt copy differs from spec L182.
2. **Step 6 success-state copy drift** — slug interpolation vs legalName.
3. **Many surfaces not yet audited** (see "What is missing" section above).
4. **PDS/SA internal scroll in Step 3** — known ugliness, founder 2026-09-04.
5. **Modal height spec deviation** — logged in `purchase-content-spec.md:34`.
6. **E4 welcome email** — separate workstream.
7. **KYC port itself** — separate workstream.

## Locked decisions honored

- Modal popup = Dialog over marketplace page, URL-driven (`?open=1&units=X`)
- Modal `max-w-lg × h-[900px]` + responsive guard `max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)]`
- Steps 2–6 share one fixed-size modal
- Geist font stays (source = evo_01 codebase, NOT mockup screenshot)
- Gold tokens pre-existing (`--color-gold: #d4a964` etc.)
- Stepper opens at min, 0.5% steps, max = availablePct
- Numbers from `pricingForUnits` only
- Audit tick `{horse_slug, stake_pct, doc, doc_hash, user_id}`
- KYC states only from server `kycStatus`
- Vocabulary whitelist (Stakes/Co-owners, zero !, British English)

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
| **F8** | **Lift PurchaseFlowModal to page-level (global CTA mount)** | **`1ed18e2`** | **APPROVE (10/10 OK, no findings)** |

## F8 shipped (founder-suggested, post-format-pass)

Founder 2026-09-04: "Step 1 CTA in the right block, when triggered, it's a global popup, not just the right block." Lifted modal from right-rail scope to page-level.

Architecture:
- `purchase-flow-host.tsx` (NEW): URL-driven modal mount, gates on `?open=1` only. Exports `usePurchaseFlowOpener()` hook for any CTA.
- `horse-page-shell.tsx` (NEW): thin client wrapper that wires opener to RightRail + renders host beside.
- `right-rail.tsx`: lost `flowOpen` state + inline mount. Added required `onOpenModal` prop.
- `purchase-flow-modal.tsx`: added optional `initialUnits` prop (cleaner than window.location re-read).
- `marketplace/[slug]/page.tsx`: stays async server component (no useSearchParams in RSC). Replaced `<RightRail>` with `<HorsePageShell>`.

Future CTAs (hero, email links, mobile bar) can now call `usePurchaseFlowOpener()` or push `?open=1&units=X` to open the same modal — no re-mounting needed.

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
