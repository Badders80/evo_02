# format-pass — plan

**Date:** 2026-09-04 (rev. 2 — post-audit fixes)
**Cycle dir:** `/home/evo/porch/new/evo_02/build-loop/format-pass/`
**Head at session start:** `0c96996` (3 commits past locked `7023c8f`)
**Status:** Stage 1 — audit-cleaned (APPROVE-WITH-FIXES → APPROVE pending re-audit)

---

## Context

The investor purchase flow (Flow C, 6 steps) is **shipped and audited PASS-WITH-WARNINGS** across chunks C1–C5 at head `7023c8f`, branch `design-alignment` local-only (`build-loop/investor-flow-build/CONTINUE.md`). All logic works end-to-end. Today's job is **visual polish** — make it look right against:

- **Production benchmark:** `/home/evo/porch/new/evo_01/02_website/` (the live site). User shared a Step 2 popup reference: dark theme, Inter, `#d4a964` gold, `max-w-lg` wide, ~900px tall, two pricing cards on top, 4-row summary with green investor return row, BUY NOW CTA, NZTR fine print.
- **Mockup surfaces:** `build-loop/flow-mock/*.png` — `rail.png`, `rail-scrolled.png`, `step1.png`, `popup2.png`, `popup2-stepper.png`, `popup3.png`, `step4.png`, `full.png`, plus `index.html` (Tailwind, with locked evo_02 design tokens hard-coded in the config).

**Scope locked 2026-09-04 (founder):** all 6 steps end-to-end — right rail (Step 1) + popup (Steps 2–6) + MyStable success state (Step 6). Modal height bumped from `h-[720px]` to `h-[900px]` to match prod's natural content fit. Popup stays ONE FIXED SIZE for Steps 2–6, never resizes between steps. PDS/SA scroll inside Step 3 remains the one ugly exception (revisit later — out of scope today).

**Why now:** "ship working flow first, gloss later" — logic ships today, gloss catches up via this pass before founder eyeballs + cutover.

---

## Goal

Polish the shipped investor purchase flow (C1–C5, head `7023c8f`) to match the production benchmark look + the `build-loop/flow-mock/*.png` surface set. All 6 steps end-to-end. Pixel-aligned vs the mockups, gold accent + Inter + dark theme matching evo_01 prod Step 2 reference. Chunk-by-chunk, each audited by kimi-code-audit before the next starts.

## Architecture approach

- **Single fixed popup size.** Width `max-w-lg`, height `h-[900px]`. One size for Steps 2–6 — does not resize between steps. PDS/SA scroll inside Step 3 stays the one ugly exception.
- **Polish is overlay, not rewrite.** C1–C5 logic stays — we are wrapping/polishing visual surfaces only. No behaviour changes, no copy edits beyond visual grammar (kerning, colour, rhythm).
- **Tokens stay locked.** All visuals pulled from `apps/web/src/dna/` (evo_02 DNA) + @theme v4. Inter font is the prod reference but current DNA uses Geist (`globals.css:15`) — F2 swaps `--font-sans` to Inter (1 line). Gold accent `#d4a964` already exists as `--color-gold` (`globals.css:37`) and `--color-accent` (`globals.css:35`) — use directly via Tailwind `text-gold` / `text-accent`. No new token additions needed.
- **Tool chain (UI toolkit only):** Stitch MCP → wireframe aligned vs `flow-mock/*.png`; `impeccable` skill → polish pass (hierarchy/typography/spacing/a11y/responsive); chrome-devtools MCP → live walk on :3010; playwright → a11y/regression. Mobbin off-table (paywalled, per TOOLKIT).
- **Right rail is its own surface.** Step 1 is the marketplace page's right rail — not in the popup. Polished separately so the rail itself matches evo_01 prod rail density.

## Tech constraints

- evo_02, branch `design-alignment` LOCAL-ONLY. No merge/push/deploy.
- Dev server on **:3010** (locked). Gates: `just check` (10/10) + `pnpm --filter @evo/web typecheck` + walk `/marketplace/nellie` → 200.
- **No new tools.** Stitch / impeccable / chrome-devtools / playwright / kimi-code-audit only.
- **No content/copy edits.** Copy is locked (founder-signed 2026-09-01). F5/F7 "error copy polish" = visual surface polish (typography, weight, rhythm) on already-locked strings; NO new strings, NO rewording. The 7 Stripe error codes + 5 stepper error strings are unchanged; only their rendering.
- **No behaviour edits.** Stepper logic, audit ticks, Stripe handoff, MyStable success — untouched.
- **Font swap in scope.** Inter is the prod reference; current DNA uses Geist (`globals.css:15`). F2 swaps `--font-sans` to Inter (1 line, founder-blessed by today's prod reference).
- **One token addition permitted** (gold accent) — and only if `#d4a964` is not already in DNA. Add to `apps/web/src/dna/colors.ts`, never inline.
- Working tree carries a pre-existing unrelated terminology sweep — chunks commit ONLY their own files.
- pnpm PATH quirk: `export PATH="/home/evo/.nvm/versions/node/v22.22.2/bin:$PATH"` before pnpm/just.
- Modal height spec deviation logged in `purchase-content-spec.md` § Modal Shell.

## Files

| Path | Action |
|---|---|
| `apps/web/src/components/horse/purchase-flow-modal.tsx` | Modify (F2, F3, F4, F5, F6, F7) — popup shell polish |
| `apps/web/src/components/horse/right-rail.tsx` | Modify (F1, verify-only — already shipped at `0c96996`) |
| `apps/web/src/components/mystable-dashboard.tsx` | Modify (F6) — success state polish |
| `apps/web/src/app/api/checkout/create-session/route.ts` | NOT MODIFIED — F7 dropped server-side edits (modal-only surface polish) |
| `build-loop/purchase-content-spec.md` | Modify — log `h-[900px]` modal height deviation + Step 3 PDS/SA-scroll retention |
| `build-loop/flow-mock/index.html` | Read-only — mockup surface reference |
| `build-loop/flow-mock/*.png` | Read-only — visual target |
| `new/evo_01/02_website/` | Read-only — production benchmark |

**No new token additions needed.** `--color-gold: #d4a964` and `--color-accent: #d4a964` both exist in `globals.css`. Tokens live in `apps/web/src/app/globals.css` (NOT `dna/colors.ts` — that path doesn't exist; `dna/` has only `content/`). Plan uses tokens directly via Tailwind `text-gold` / `text-accent`.

**Font: Geist stays.** Source of truth = evo_01 prod codebase (`layout.tsx:6`, `tailwind fontFamily "Geist Sans"`), NOT the mockup screenshot. No font swap.

## Chunks

| # | Chunk | Fixes | Files | DoD | Gate |
|---|---|---|---|---|---|
| F1 | Right rail polish (Step 1) | **STATUS: LARGELY LANDED at head `0c96996`** (3 commits past `7023c8f`: rail polish, typography, fixed-position pin). **Remaining delta:** verify `flow-mock/rail-scrolled.png` alignment + final walk. No new code expected. | right-rail.tsx (verify only) | rail matches prod density, scrolled state aligns to mockup | typecheck + walk :3010 + kimi audit |
| F2 | Popup shell + Step 2 term sheet | Modal shell `max-w-lg × h-[900px]` bump · dark theme parity vs evo_01 prod · two pricing cards (PRICE / MINIMUM INVESTMENT) · 4-row summary · green investor return row · gold accent · Geist stays (font source = evo_01 codebase, NOT mockup) · NZTR fine print · `flow-mock/step1.png` + `popup2.png` + `popup2-stepper.png` alignment | purchase-flow-modal.tsx, purchase-content-spec.md | Step 2 matches prod reference at pixel level, modal height bumped, **viewport guard added** (`max-h-[calc(100vh-2rem)] my-auto`) | typecheck + walk :3010 + kimi audit |
| F3 | Step 3 accept gate | Accordion + Completed badges · PDS/SA scrollable exception retained · audit ticks · "Proceed to Secure Checkout" CTA · `flow-mock/popup3.png` alignment | purchase-flow-modal.tsx | Step 3 matches mockup, scroll inside exception preserved | typecheck + walk :3010 + kimi audit |
| F4 | Step 4 verify | KYC prompt in-modal polish · one-screen verify visual · CTA weight · `flow-mock/step4.png` alignment | purchase-flow-modal.tsx | Step 4 matches mockup, stub marker still clear (no KYC port work) | typecheck + walk :3010 + kimi audit |
| F5 | Step 5 pay | Stripe hosted handoff visual polish · reservation-expired visual affordance · hand-off reading (not the redirect itself; copy unchanged) | purchase-flow-modal.tsx | Step 5 reads as "we're handing you to Stripe" cleanly | typecheck + walk :3010 + kimi audit |
| F6 | Step 6 own (MyStable success) | Success state polish · return-to-rail affordance · `flow-mock/full.png` alignment · `mystable-dashboard.tsx` success card density | mystable-dashboard.tsx, purchase-flow-modal.tsx | MyStable success matches prod density + mockup | typecheck + walk :3010 + kimi audit |
| F7 | Error states + Stripe copy mapping visual polish | 5 stepper error states (over/under min/non-multiple/cleared/dull-triangle notes) — **modal-only, no server changes**. 7-code Stripe error states render in modal — server returns code, modal renders investor copy. **No edits to `create-session/route.ts`** (dropped from F7 scope). | purchase-flow-modal.tsx | All 5 stepper errors + 7 Stripe errors render with prod visual grammar; copy byte-identical | typecheck + walk :3010 + kimi audit |

**Why 7 chunks (not fewer):**
- F1 stands alone — the right rail is its own surface outside the popup, no shared state, no overlap with F2+.
- F2 is the modal shell + the screen the user personally shared a prod reference for — biggest single risk, deserves its own chunk.
- F3–F6 each bind to one mockup PNG (`popup3.png`, `step4.png`, no PNG for Step 5, `full.png`) — easy to verify per chunk.
- F7 already shipped as C5 logic; visual polish is a surface pass on shipped state, audit-friendly as a discrete chunk.
- Each chunk is small enough that impeccable + chrome-devtools walk + kimi audit lands in one session.

**Re-chunking if needed:** F3+F4 could merge if audit gate proves trivial; F5+F6 could merge if "hand-off + own" reads as one surface. Default plan is 7 chunks; collapse to 5 if first two audits run green and throughput matters.

## Spec changes (`purchase-content-spec.md`)

Three line edits only, in § Modal Shell — **REPLACES the prior "LOCKED 2026-09-03" line at L34**:

> Modal dimensions: `max-w-lg × h-[900px]` (bumped from locked `h-[720px]` on 2026-09-04 to match prod's natural content fit for Step 2 term sheet). On viewports ≥ 900px tall, popup stays ONE FIXED SIZE for Steps 2–6, does not resize between steps. On shorter viewports, modal clamps via `max-h-[calc(100vh-2rem)] my-auto` (responsive exception, founder 2026-09-04) so it never clips top/bottom. Logged deviation.

> **Overflow guard:** modal body content pane carries `overflow-y-auto` so when viewport clamps below 900px, content scrolls inside the modal rather than overflowing. Parent overlay must use flex centering (`items-center justify-center`) for `my-auto` to behave correctly. (Re-audit guard, 2026-09-04.)

> Step 3 retains internal PDS/SA scrolling (founder 2026-09-04 — known ugliness, revisit later). The fixed popup height does not contain the full PDS/SA; users scroll inside the accordion rows.

No other spec edits. Content + structure locked.

## Token additions

NONE. `#d4a964` already mapped in `apps/web/src/app/globals.css`:
- L35: `--color-accent: #d4a964`
- L37: `--color-gold: #d4a964`
- L93: `--primary: #d4a964`
- L99: `--accent: #d4a964`

Tailwind `text-gold` / `text-accent` already resolve. F2 uses them directly.

Font swap (F2 only): `--font-sans` line 15 changes from Geist → Inter. One-line edit.

## Audit gate

Use `chunkN-audit-prompt.txt` pattern from `investor-flow-build/`. Template lives at `investor-flow-build/chunk1-audit-prompt.txt` — copy structure, swap:

1. **Scope:** which mockup PNG(s) this chunk is targeting.
2. **Diff:** embed the file contents/diff (kimi has no filesystem access).
3. **Visual rules:** prod reference path, gold accent, Inter, dark theme, `max-w-lg × h-[900px]`, spacing rhythm.
4. **Output:** PASS / FAIL / WARN per fix, with the 15-gap graph if applicable (no new gaps opened).

Run via `ollama run kimi-k2.7-code:cloud < format-pass/chunkF{N}-audit-prompt.txt`.

## Verification

- `just check` (10/10 must pass) — repo root
- `pnpm --filter @evo/web typecheck` green
- Walk :3010: `/marketplace/nellie` → 200; CTA → modal steps → Stripe handoff → MyStable success
- chrome-devtools MCP: screenshot each step, compare vs `flow-mock/*.png` target
- impeccable skill pass per chunk (hierarchy/typography/spacing/a11y/responsive)
- playwright a11y + regression sweep after F6 + F7 (light/dark, reduced-motion)
- kimi-code-audit per chunk, diff-only, PASS/FAIL/WARN
- Founder eyeballs on F2 (modal shell + Step 2 prod reference match) before F3 starts — this is the riskiest chunk

## Out of scope

- E4 welcome email (separate workstream)
- KYC port itself (Firebase → Supabase) — C4 wired the prompt surface only; KYC visual stays a stub
- Mobbin (paywalled, off-table per TOOLKIT)
- New tokens (gold already exists — see Files table)
- New dependencies: `framer-motion`, `lenis` (absent from `apps/web/package.json`; founder sign-off needed per TOOLKIT). **`gsap ^3.15.0` is INSTALLED** — if F2+ needs micro-motion (button hover, accordion expand), use `gsap` per `TOOLKIT.md` motion rule, not framer-motion.
- Content/copy edits — copy is locked (founder-signed 2026-09-01). Visual surface polish on already-locked strings is in scope (typography, weight, rhythm). New strings = out.
- Behaviour/logic edits (C1–C5 logic stays)
- Stepper logic, audit ticks, Stripe handoff, MyStable success behaviour
- Migration, merge, push, deploy
- evo_01 / mission_control / prod surfaces

### Critical Files for Implementation

- /home/evo/porch/new/evo_02/build-loop/format-pass/plan.md
- /home/evo/porch/new/evo_02/build-loop/purchase-content-spec.md
- /home/evo/porch/new/evo_02/apps/web/src/components/horse/purchase-flow-modal.tsx
- /home/evo/porch/new/evo_02/apps/web/src/components/horse/right-rail.tsx (verify-only at F1)
- /home/evo/porch/new/evo_02/apps/web/src/components/mystable-dashboard.tsx
- /home/evo/porch/new/evo_02/apps/web/src/app/globals.css (NO edit needed — gold tokens exist, font stays Geist)

---

## Audit resolution (kimi-k2.7-code:cloud + founder review, 2026-09-04)

**Round 1 (kimi-code-audit):** APPROVE-WITH-FIXES (2 BLOCKER, 8 WARN) — addressed.
**Round 2 (founder review):** APPROVE-WITH-FIXES (1 BLOCKER, 6 WARN) — addressed below.

| # | Severity | Finding | Resolution |
|---|---|---|---|
| F-1 | BLOCKER (founder) | Baseline stale: head is `0c96996`, not `7023c8f`. 3 commits past locked head ARE F1 scope. F1 re-scoping needed. | F1 marked LARGELY LANDED — verify-only delta (rail-scrolled.png alignment). No re-implementation. |
| F-2 | WARN (founder) | Font swap is 2 files (layout.tsx + globals.css), not 1 line. | Font swap DROPPED entirely — Geist stays (founder 2026-09-04). Source = evo_01 codebase, not mockup. |
| F-3 | WARN (founder) | "Inter is prod reference" is false vs evo_01 code (Geist). | Resolved by dropping font swap (F-2). |
| F-4 | WARN (founder) | `gsap ^3.15.0` IS in package.json. Claim of "all absent" false. | Out-of-scope corrected: framer-motion + lenis absent; gsap INSTALLED, use per TOOLKIT motion rule. |
| F-5 | WARN (founder) | `dna/colors.ts` doesn't exist. Plan listed it as critical. | Removed. Tokens live in `globals.css` (already documented). |
| F-6 | WARN (founder) | F7 `create-session/route.ts` edit is conceptually confused (no typography server-side). | Dropped `create-session/route.ts` from F7. F7 = modal-only surface polish. |
| F-7 | WARN (founder) | h-[900px] fixed modal clips on <900px viewports. | Added viewport guard to spec: `max-h-[calc(100vh-2rem)] my-auto`. "Fixed size" applies only on viewports that can hold it. |
| K-1 | BLOCKER (kimi) | `mystable-dashboard.tsx` claimed not shipped. | File exists. Plan target unchanged. (False positive — kimi only saw `CONTINUE.md` shipped-files list which names route-level files.) |
| K-2 | BLOCKER (kimi) | F5/F7 "copy polish" contradicts "no copy edits". | Tightened to "visual surface polish only — no new strings, byte-identical copy". |

**Round 3 (kimi re-audit):** APPROVE-WITH-FIXES (2 WARN) — addressed below.

| # | Severity | Finding | Resolution |
|---|---|---|---|
| R-1 | WARN | `purchase-content-spec.md:34` still says "LOCKED 2026-09-03" while rev. 2 adds a responsive exception. | Rewrote L34 to: "On viewports ≥ 900px tall, popup stays ONE FIXED SIZE… On shorter viewports, modal clamps via `max-h-[calc(100vh-2rem)] my-auto`". "LOCKED" language removed. |
| R-2 | WARN | Viewport guard implementation risks: `overflow-y-auto` needed on content pane; `my-auto` requires flex-centered parent overlay. | Added explicit Overflow Guard line to spec: modal body = `overflow-y-auto`; parent overlay = `items-center justify-center`. Both become F2 implementation requirements (not just spec). |

**Verdict after Round 3 fixes:** APPROVE.

### Critical Files for Implementation

- /home/evo/porch/new/evo_02/build-loop/format-pass/plan.md
- /home/evo/porch/new/evo_02/build-loop/purchase-content-spec.md
- /home/evo/porch/new/evo_02/apps/web/src/components/horse/purchase-flow-modal.tsx
- /home/evo/porch/new/evo_02/apps/web/src/components/horse/right-rail.tsx
- /home/evo/porch/new/evo_02/apps/web/src/dna/colors.ts
