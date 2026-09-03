# investor-flow-build — session wrap 2026-09-03 (night)

**Status: 2.5 of 5 chunks done. Resume point: chunk-3 Step 3 gate UI.**

## Done (committed, audited)

| Chunk | Commits | Audit verdict |
|---|---|---|
| C1 PR-A bug fixes (f2-f8) | `b4790d2` + `efb4437` | PASS-WITH-WARNINGS (1 WARN accepted: f6b dep array) |
| C2 PurchaseFlowModal + Step 2 term sheet | `a3d53c7` + `861b183` | PASS-WITH-WARNINGS (4 fixed, 2 accepted) |
| C3 part 1: acceptance audit-tick API | `efb13f7` | typecheck green, NOT yet kimi-audited |

Audit reports: `build-loop/investor-flow-build/audit-report-chunk1.md`, `audit-report-chunk2.md`.

## Next (morning, in order)

1. **Chunk-3 part 2 — Step 3 accept gate UI** in `apps/web/src/components/horse/purchase-flow-modal.tsx`:
   - Accordion rows (mockup `flow-mock/index.html` lines 270-345): expand doc → tick → "Completed" badge (text-status-active) → Proceed unlocks. Header "Acceptance — {horse} your documents".
   - Each tick POSTs to `/api/acceptance` (DONE, committed) with `{horseSlug, stakePct, doc: 'pds'|'sa', docHash}`.
   - KYC prompt (spec `purchase-content-spec.md:162-185`): 403 KYC_REQUIRED → modal stays open, error box → "Identity verification is required before checkout. This is a one-time check under New Zealand law." + [Verify Identity] CTA → Stripe Identity port. Pending: "Your identity check is being reviewed…". Rejected: manual-assistance copy.
   - CTA label LOCKED: "Proceed to Secure Checkout".
   - Then: gates (typecheck + just check + walk :3010) → kimi audit → commit.
2. **Chunk-4 — Steps 4-6** (Verify / Pay / Own): Step 4 rides KYC port (prompt only, not the port itself); Step 5 Stripe redirect already wired; Step 6 MyStable success landed in C1.
3. **Chunk-5 — f9 5 stepper error states + f10 7-code Stripe error→copy mapping** in modal + `create-session/route.ts`.
4. **After build:** graphics/format pass back to Claude + MiniMax M3 (Stitch wireframes, pixel alignment vs mockup PNGs in `flow-mock/`).

## Locked decisions (do not re-litigate)

- Popup = Dialog over `marketplace/[slug]` (no route change) · state = `?units=` URL + client step
- Step 2 header "Digital-Syndication Terms" · Step 3 header "Acceptance — {horse} your documents" (mockup, newer)
- Modal shell `max-w-lg` × `h-[720px]` all steps · Investor Return row GREEN `text-status-active`
- Numbers from `pricingForUnits` — never mockup placeholders ($76/$380/21mo are fake)
- Lease period row: legal engine `termMonths` defaults 12; no DB source yet — mockup "21 months" is placeholder
- Audit tick payload: `{horse_slug, stake_pct, doc, doc_hash, user_id}`, stripe_event_id NULL
- E4 welcome email OUT of scope (separate workstream)

## Environment notes

- Dev server: `cd /home/evo/porch/new/evo_02/apps/web && pnpm dev --port 3010` (background). **3010 is the locked port** — evo_01 old prod owns 3000. Restart after `hermes verify` (clobbers .next/).
- PATH: pnpm at `/home/evo/.nvm/versions/node/v22.22.2/bin/pnpm` — export before pnpm/just.
- kimi audit: `ollama run kimi-k2.7-code:cloud < promptfile` — **no filesystem access**, embed file contents/diff in the prompt (see existing prompts in cycle dir).
- Working tree still has the pre-existing terminology sweep (uncommitted, unrelated) — commit only chunk files.
- Mockup HTML committed `5449f3b` — safe.
