# STYLE GUIDE LOCK-IN — Audit report (Stage 5)

**Date:** 2026-09-04
**Auditor:** kimi-code-audit procedure — `kimi-k2.7-code:cloud` (paid, per roster) on diff `6b7da76..HEAD`
**Verdict:** **PASS-WITH-WARN** — all claims met; WARNs resolved or accepted with evidence below.
**Sandbox contract:** everything on branch `style-guide-lock-in`. `cmd:founder-approval` = **BLOCKED** — awaiting founder go-live.

## Claims table

| # | Claim | Result | Evidence |
|---|---|---|---|
| 1 | Style guide draft documents 8 pattern rules + tokens, each with file:line evidence, status DRAFT | **PASS** | `build-loop/style-guide-lockin/STYLE_GUIDE-draft.md` — P1 `right-rail.tsx:174`, P2 `:279`/`cap-table-card.tsx:26`, P3 `marketplace/[slug]/page.tsx:148`, P4 `:42/:51/:60/:68`, P5 `:184/194/202`, P6 `:240`/`:132`, tokens `globals.css:35-38,76`; header `**DRAFT**` |
| 2 | `@evo/ui` has 5 primitives emitting ONLY canonical class strings | **PASS** | `packages/ui/src/*.tsx` + `packages/ui/tests/ui.test.ts` asserts each exact string; real test run green (`just test`: "@evo/ui primitives tests passed") |
| 3 | Package imports only react / lucide-react / clsx / tailwind-merge / ./cn — no apps/* | **PASS** | grep of `packages/ui/src` imports; only in-package `./cn` plus the 4 deps (`packages/ui/package.json`) |
| 4 | StatusPill matrix matches original statusChip token sets | **PASS** | `status-pill.tsx:18-28` — status-active ×2, accent ×1, border/card/muted ×1; identical to pre-conversion `right-rail.tsx:42,51,60,68` |
| 5 | Right-rail converted; SSR render identical | **PASS** | inline eyebrow/stat/CTA deleted (`right-rail.tsx:139,148-156,183-186`); aside byte-diff pre/post marker-stripped → identical; `rail-before.txt`/`rail-after.txt` in cycle dir |
| 6 | apps/web depends on @evo/ui workspace:* | **PASS** | `apps/web/package.json:18` |
| 7 | Guard + `just check-style` recipe | **PASS*** | `scripts/check-style-guard.sh` fires exit 1 naming files (fixture + real run), exits 0 clean, excludes `packages/ui/`; `Justfile:31-33` (*WARN: regex intentionally matches P1-FAMILY near-variants, not only the exact gold string — design choice, documented below) |
| 8 | Gates green | **PASS** | `just typecheck` 12/12, `just lint` 12/12, `just test` all suites (incl. `@evo/ui` + right-rail suites), `pnpm --filter @evo/web build` ✓ 36/36 static pages |

## WARN disposition (kimi findings → resolution)

| Kimi WARN | Resolution |
|---|---|
| Raw-TS workspace package may not transpile in Next build | **RESOLVED —** `pnpm --filter @evo/web build` exit 0, ✓ Compiled, 36/36 pages. Same pattern as `@evo/brand_dna` (already proven). |
| WhitePillCTA markup adds `type="button"` vs original | **FALSE POSITIVE —** original `right-rail.tsx` CTA already had `type="button"` (pre-conversion :237-240); aside diff is byte-identical including the attribute. |
| tailwind-merge may reorder emitted classes | **RESOLVED EMPIRICALLY —** tests assert exact class equality and pass; twMerge preserves order for the current inputs. Future caveat only when a conflicting className is passed. |
| No gate output in the diff | **RESOLVED —** this is a local-only branch (no CI); real command output captured in session, keyed in audit-graph.json below. |
| Guard omits `text-gold` from the P1 regex | **BY DESIGN —** near-P1 variants (muted/foreground eyebrows, uppercase tracking labels) are violations of the same family; the guard is intentionally broad. Exact-gold-only narrowing would miss muted eyebrows (`marketplace/[slug]/page.tsx:140`). |

## Additional blockers surfaced (defer to Phase C / founder)

1. **Phase C first targets (guard currently red on):** `apps/web/src/components/sections/MarketplaceSection.tsx:232`, `apps/web/src/app/marketplace/[slug]/page.tsx:140` — exact P1-family inline eyebrows.
2. **8-file `tracking-[0.2em]` sweep** (Part 4 of guide): header, landing-cta-popup, HowItWorksSection, FAQSection, mystable-dashboard, DigitalSyndicationSection, privacy/page, purchase-flow-modal.
3. **Badge duplication:** `components/ui/badge.tsx:18` bright-success + `campaign-status-badge.tsx` → superseded by `<StatusPill>`.
4. **Font open item:** prod reference Geist Sans vs format-pass F2 Inter note — `globals.css:15` current truth.
5. **P7 image-bg blend discrepancy:** format-pass lock says `mix-blend-mode: lighten`; surviving tree instance is `mix-blend-overlay` (`CtaLeadModal.tsx:213`).

## Verdict

**PASS-WITH-WARN.** The style guide is drafted, the 5 primitives exist and render the canonical surface identically, the enforcement guard bites, and all deterministic gates + the production build are green on the sandbox branch. Nothing merges or lands until founder go-live.
