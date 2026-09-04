# STYLE GUIDE — Evolution Stables web surfaces

**Status: DRAFT** (promoted to LOCKED SSOT only on founder approval — sandbox branch `style-guide-lock-in`)
**Date:** 2026-09-04
**Provenance:** format-pass 18-chunk session (head `6b7da76`), canonical surface = `apps/web/src/components/horse/right-rail.tsx`, tokens = `apps/web/src/app/globals.css` / `packages/brand_dna/src/tokens.ts`, prod reference = `evo_01/02_website/DESIGN.md`, token SSOT = `evo_00/doc/DESIGN_SYSTEM_AND_TOKENS.md`.

**Purpose:** one source for every visual pattern. If a surface needs a look not in this document, the pattern does not exist yet — write it here first, get founder eyes, then build. Inline hand-rolling of these class strings is a lint violation (see guard in Part 4).

---

## Part 1 — Tokens (single source of truth)

| Token | Value | Where defined |
|---|---|---|
| Accent (gold) | `#d4a964` | `globals.css:35-37` — `--color-accent` == `--color-gold` == `--color-accent-hover #c49a5a` |
| Muted foreground | `#737373` | `globals.css:25,76` — `--color-muted-foreground` |
| Muted (secondary text) | `#a1a1aa` | `DESIGN.md` `muted` |
| Heading | `#f8fafc` | `globals.css` foreground |
| Pure white (CTA) | `#ffffff` | `globals.css` `--color-pure-white` |
| Background base | `hsl(0 0% 4%)` (#0a0a0a) | elevation L0–L4 in `brand_dna/src/tokens.ts` |
| Surface / card | `hsl(0 0% 10%)` | `--bg-l2` |
| Border default | `border-border` | `globals.css` border token |
| Status-active | `--color-status-active` | globals.css status token (dot + border in listed pill) |

**Rules**
- The accent **is** gold. Never introduce a second accent hex — `brand_dna/tokens.ts:14` documents "3–5% visual weight rule": gold is a highlight, never a fill.
- All surfaces pull from these tokens; arbitrary new hex values in JSX are a code-review fail.

## Part 2 — Patterns (locked rules)

### P1 · Eyebrow (gold, uppercase tracking)
Section eyebrow above an H2/H3.
```tsx
className="text-gold text-[11px] font-medium uppercase tracking-[0.2em]"
```
- Evidence: `right-rail.tsx:174` ("Ownership").
- Do: use for the primary section label when gold emphasis is wanted.
- Don't: re-type this inline — use `<Eyebrow>` from `@evo/ui` (guard flags inline copies).

### P2 · Eyebrow-mono (muted/accent, mono uppercase)
Overline inside cards, no gold — mono + widest tracking.
```tsx
className="text-[10px] font-mono uppercase tracking-[0.25em] text-accent"
```
- Evidence: `right-rail.tsx:279` (ClosedCampaignCard), `cap-table-card.tsx:26`, `pricing-card.tsx:92`, `thoroughbred-attributes.tsx:27`.
- Also seen as `text-[11px] font-light` tabs: `horse/tabs.tsx:24` (tabs are uppercase mono-tracking, not the Pill).

### P3 · BackLink (left-chevron return)
```tsx
<Link className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-accent transition-colors">
  <ArrowLeft className="h-3.5 w-3.5" />
```
- Evidence: `marketplace/[slug]/page.tsx:148`, `terms/page.tsx:16`.
- Locked in format-pass F14/F17. Use `<BackLink>` from `@evo/ui`.

### P4 · StatusPill (campaign status chip)
`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[8px] font-medium uppercase tracking-widest` + 8px status dot + label.

| Status | Classes (evidence `right-rail.tsx`) | Label |
|---|---|---|
| `listed` | `border-status-active/40 bg-status-active/10 text-status-active` (:42) | Become An Owner |
| `fully_subscribed` | `border-accent/40 bg-accent/10 text-accent` (:51) | Fully Subscribed |
| `coming_soon` | same as listed (:60) | Coming Soon |
| `completed` | `border-border bg-card text-muted-foreground` (:68) | Campaign Concluded |

Dot: `h-2 w-2 rounded-full` colored per status. Use `<StatusPill status={...}>` from `@evo/ui`.

### P5 · StatRow (label + value hierarchy)
```tsx
<p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground block mb-1">Label</p>
<div className="flex items-baseline gap-2">
  <span className="text-[30px] font-light tracking-tight text-heading leading-tight">{value}</span>
  <span className="text-base font-light text-muted">{unit}</span>
</div>
```
- Evidence: `right-rail.tsx:184` (Price), `:194` (Return), `:202` (Duration).
- Use `<StatRow label value unit>` from `@evo/ui`.

### P6 · CTA buttons
**P6a WhitePillCTA (primary):**
```tsx
className="flex w-full items-center justify-center gap-2 rounded-full bg-pure-white px-8 py-3 text-base font-bold tracking-wide text-black transition-colors hover:bg-white/90"
```
- Evidence: `right-rail.tsx:240`. Use `<WhitePillCTA>`.

**P6b GoldPill (secondary/forms):**
```tsx
className="rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-[10px] font-medium uppercase tracking-widest text-accent transition-colors hover:bg-accent/20 disabled:opacity-50"
```
- Evidence: `right-rail.tsx:132` (LeadForm submit, "Notify Me").

### P7 · Image backgrounds
- Locked by format-pass as **mix-blend-mode: lighten** over the dark canvas.
- ⚠️ Discrepancy found 2026-09-04: the only surviving instance in the tree is `mix-blend-overlay` at `CtaLeadModal.tsx:213` (`absolute inset-0 opacity-20`). **Open founder decision — the guide records the format-pass lock; the tree disagrees; reconcile before locking P7.**

### P8 · DotGrid background — REMOVED
- Removed from marketplace + login in format-pass (deferred "background-depth" work). Do not re-add without founder sign-off.

### P9 · Divider (gold hairline)
```tsx
<div className="w-10 h-px bg-gold" />
```
- Evidence: `right-rail.tsx:179`.

### P10 · Rail card container
```tsx
className="rounded-3xl border border-border bg-surface backdrop-blur-2xl px-6 py-4 space-y-3.5 shadow-[0_0_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]"
```
- Evidence: `right-rail.tsx:172`.

## Part 3 — Typography

- Prod reference (`evo_01/02_website/DESIGN.md`): Geist Sans body 16px/1.7/-0.02em, headings 56px/400.
- ⚠️ **Open:** format-pass F2 plan noted an Inter swap (founder reference at the time); `globals.css:15` `--font-sans` is the current truth. Guide records both; founder resolves at lock.

## Part 4 — Enforcement contract

1. All 5 primitives (`Eyebrow`, `BackLink`, `StatusPill`, `StatRow`, `WhitePillCTA`) live in `@evo/ui` and are the ONLY sanctioned spellings.
2. `scripts/check-style-guard.sh` (wired as `just check:style`) greps `apps/ packages/` and fails on inline `text-[11px] font-medium uppercase tracking-[0.2em]` and inline `text-[10px] font-mono uppercase tracking-[0.2em]`.
3. As of 2026-09-04, these files still carry inline `tracking-[0.2em]` and are Phase C refactor targets: `header.tsx`, `landing-cta-popup.tsx`, `HowItWorksSection.tsx`, `FAQSection.tsx`, `mystable-dashboard.tsx`, `DigitalSyndicationSection.tsx`, `privacy/page.tsx`, `purchase-flow-modal.tsx`.
4. Badge duplication (known debt): `components/ui/badge.tsx:18` bright-success variant + `marketplace/campaign-status-badge.tsx` — superseded by `<StatusPill>`; deprecate in Phase C.

## Part 5 — UI voice rules (locked in canonical file header)

- Zero exclamation marks. British English. Vocabulary whitelist: Stakes / Co-owners (Units retired 2026-09-01), Settlement / Distribution / Prize money, Evolution Stables.
- Copy source = `evo_00/doc/VOICE_AND_TONE_MANUAL.md` + `PLATFORM_VOICE.md`. Full copy reference: `@evo/brand_dna/src/voice.ts`.

---

**Footer:** This document is DRAFT. Founder sign-off flips it to LOCKED and promotes to `evo_00/doc/STYLE_GUIDE.md`. Until then nothing in Part 1–3 is authoritative outside this branch.
