# investor-flow-build — session wrap 2026-09-04

**Status: 3 of 5 chunks done. Resume point: chunk-4 (Steps 4–6 wiring).**

## Done (committed, audited)

| Chunk | Commits | Audit |
|---|---|---|
| C1 PR-A bug fixes (f2–f8) | `b4790d2` + `efb4437` | PASS-WITH-WARNINGS (1 accepted) |
| C2 PurchaseFlowModal + Step 2 term sheet | `a3d53c7` + `861b183` | PASS-WITH-WARNINGS (4 fixed, 2 accepted) |
| C3 Step 3 accept gate + audit ticks + KYC prompt | `2177c91` + `d361282` + `be01167` | PASS-WITH-WARNINGS (3 fixed, 3 accepted) — **browser-walked live** |

Audit reports: `audit-report-chunk1.md`, `audit-report-chunk2.md`, `audit-report-chunk3.md`.
Kickstart prompt for another chat: `KICKSTART.md` (self-contained).

## Live walk evidence (headless Chromium, :3010)

CTA → modal opens (Digital-Syndication Terms) · stepper 1.0→1.5% price $76→$114 (real pricingForUnits) · 4-row summary + green 75% · Step 3 "— your documents" + real sha256 hashes · Proceed disabled until both ticked · unauth tick REVERTS (401 honest, per audit-fix) · modal shell max-w-lg × 720px.

## Next (chunk-4, chunk-5, then graphics pass)

1. **C4 — Steps 4–6:** wire "Verify Identity" CTA to KYC port when it exists (stub stays if not — port = separate workstream, do not build it) · Pay redirect already wired · Own success landed in C1 (verify link-through). Gates → kimi audit → commit.
2. **C5 — f9 5 stepper error states + f10 7-code Stripe error→copy mapping** (spec: purchase-content-spec.md; server returns code, modal renders copy).
3. **After build:** graphics/format pass → Claude + MiniMax M3 (Stitch, pixel vs `flow-mock/*.png`).

## Locked decisions

- Popup = Dialog over `marketplace/[slug]` · state = `?units=` URL + client step
- Step 2 header "Digital-Syndication Terms" · Step 3 header "Acceptance — {horse} your documents" · Step 3 CTA "Proceed to Secure Checkout"
- Modal `max-w-lg` × `h-[720px]` all steps · Investor Return row GREEN `text-status-active`
- Numbers from `pricingForUnits` — never mockup placeholders ($76/$380/21mo fake) · Lease row: `termMonths` defaults 12
- Audit tick payload `{horse_slug, stake_pct, doc, doc_hash, user_id}` · stripe_event_id NULL
- E4 email OUT of scope

## Environment

- pnpm: `export PATH="/home/evo/.nvm/versions/node/v22.22.2/bin:$PATH"`
- Dev: `cd apps/web && pnpm dev --port 3010` · 3010 = evo_02 locked (evo_01 = 3000) · restart after `hermes verify`
- kimi: `ollama run kimi-k2.7-code:cloud < promptfile` — embed file contents (no fs access)
- Working tree dirty = pre-existing terminology sweep (unrelated, leave it)
- Mockup committed `5449f3b` · head `be01167`
