# investor-flow-build — session wrap 2026-09-04 (chunk-4 complete)

**Status: 4 of 5 chunks done. Resume point: chunk-5 (stepper error states + Stripe error mapping).**

## Done (committed, audited)

| Chunk | Commits | Audit |
|---|---|---|
| C1 PR-A bug fixes (f2–f8) | `b4790d2` + `efb4437` | PASS-WITH-WARNINGS (1 accepted) |
| C2 PurchaseFlowModal + Step 2 term sheet | `a3d53c7` + `861b183` | PASS-WITH-WARNINGS (4 fixed, 2 accepted) |
| C3 Step 3 accept gate + audit ticks + KYC prompt | `2177c91` + `d361282` + `be01167` | PASS-WITH-WARNINGS (3 fixed, 3 accepted) — **browser-walked live** |
| C4 Steps 4–6 wiring | `c58f734` | **PASS (5/5 OK)** — browser-walked live |

Audit reports: `audit-report-chunk1.md` … `audit-report-chunk4.md`.
Kickstart prompt for another chat: `KICKSTART.md` (self-contained).

## Chunk-4 what actually shipped

**Step 4 Verify** — `/auth/verify` absent (verified 404; KYC port = separate workstream, NOT built). Fixed the stub's **dishonesty**: it previously set `kycState='pending'` on click → fabricated "Your identity check is being reviewed…" when no check ever started (same class as chunk-3's tick-revert fix). Now:
- CTA inert (console.warn only, marker kept for the port).
- Server 403 KYC_REQUIRED now carries the investor's real `kycStatus` from `profiles.kyc_status` (replaces bare `requireVerifiedKyc` throw; `requireVerifiedKyc` import removed from create-session).
- Modal renders the honest state machine: `pending` → pending copy, `rejected` → rejected copy, else → prompt.

**Step 5 Pay** — already wired (chunk-3): Stripe hosted redirect, success_url → `/mystable?checkout=success&slug&units`, cancel_url → horse page `?units=`. Unchanged, verified.

**Step 6 Own** — already landed (chunk-1 f8): `/mystable?checkout=success` green "Welcome to the syndicate" banner. Unchanged, browser-verified.

## Chunk-4 walk evidence (headless Chromium :3010, authenticated alex kyc=unverified)

Login → /mystable ✓ · Step 6 banner "Welcome to the syndicate — your 1.0% stake in nellie is being finalised." ✓ · Nellie → Become an Owner → modal → Invest in → Step 3 → both docs ticked (auth ticks succeed, Proceed unlocks) → Proceed → **KYC prompt shown (1)** ✓ · fake pending copy **0** before and after Verify Identity click ✓ · prompt persists after click (inert) ✓. Screenshot: `chunk4-kyc-prompt.png`.

## Next (chunk-5, then graphics pass)

1. **C5 — f9 5 stepper error states + f10 7-code Stripe error→copy mapping** (spec: `purchase-content-spec.md`; server returns `code`, modal renders investor copy):
   - f9 (purchase-flow-modal.tsx Step2TermSheet): over max "Stake available is {max}% — reduce your stake" · under min "Minimum investment is {min}% — increase your stake" · non-multiple "Stake must be a multiple of {step}%" (server: `stakePctToStepUnits` throws INVALID_STAKE) · cleared/empty → revert to min on blur · max/min dull-triangle notes.
   - f10 (create-session/route.ts + purchase-flow-modal.tsx): 7-code mapping — KYC_REQUIRED, RESERVE_FAILED, PURCHASES_DISABLED, SUPABASE_NOT_CONFIGURED, INVALID_STAKE + Stripe decline codes. Server returns `code`, modal renders investor copy.
   - Gates → kimi audit → commit.
2. **After build:** graphics/format pass → Claude + MiniMax M3 (Stitch, pixel vs `flow-mock/*.png`).

## Locked decisions

- Popup = Dialog over `marketplace/[slug]` · state = `?units=` URL + client step
- Step 2 header "Digital-Syndication Terms" · Step 3 header "Acceptance — {horse} your documents" · Step 3 CTA "Proceed to Secure Checkout"
- Modal `max-w-lg` × `h-[720px]` all steps · Investor Return row GREEN `text-status-active`
- Numbers from `pricingForUnits` — never mockup placeholders ($76/$380/21mo fake) · Lease row: `termMonths` defaults 12
- Audit tick payload `{horse_slug, stake_pct, doc, doc_hash, user_id}` via service client · stripe_event_id NULL
- KYC states rendered ONLY from server `kycStatus` — never synthesized client-side
- E4 email OUT of scope

## Environment

- pnpm: `export PATH="/home/evo/.nvm/versions/node/v22.22.2/bin:$PATH"`
- Dev: `cd apps/web && pnpm dev --port 3010` · 3010 = evo_02 locked (evo_01 = 3000)
- kimi: `ollama run kimi-k2.7-code:cloud < promptfile` — embed file contents (no fs access). PIPE THE PROMPT FILE ONLY, redirect stdout to a file (SIGPIPE truncates the reply if you `| head`)
- Working tree dirty = pre-existing terminology sweep (unrelated, leave it)
- Walk auth: `alex@evolutionstables.nz` / `nellie-demo-2026`, kyc_status=unverified (re-seed via `scripts/seed-local-demo.sh` after supabase volume wipe) — chunk-4 walk script: `/home/evo/.hermes/hermes-agent/chunk4_walk.js`
- Modal-scroll clicks in headless CDP: use `page.evaluate` DOM clicks (Playwright locator clicks fail "element outside viewport" inside the modal scroll container); single-open accordion: tick PDS first, then open SA and tick it
- Head: `c58f734`
