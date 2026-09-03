# investor-flow-build — chunk-4 audit

**Date:** 2026-09-04
**Auditor:** kimi-k2.7-code:cloud (diff embedded — 2 chunk files)
**Scope:** commit c58f734 (base 3db0ae6) — Steps 4–6 wiring

## Verdict: PASS (5 findings, all OK)

| # | Finding | Severity | Disposition |
|---|---|---|---|
| 1 | Verify Identity CTA no longer mutates kycState — only console.warn remains (inert stub) | OK | — |
| 2 | pending/rejected UI states driven solely by server `body.kycStatus` — no synthetic pending | OK | — |
| 3 | Verified users see unchanged behavior (gate falls through to existing flow when kyc_status = verified) | OK | — |
| 4 | No dead imports; `kycStatus ?? null` + strict string equality safe for non-string values; typecheck + just check pass | OK | — |
| 5 | Scope fence respected — only create-session/route.ts + purchase-flow-modal.tsx touched | OK | — |

## What chunk-4 actually was

**Step 4 Verify** — `/auth/verify` absent (verified 404; KYC port = separate workstream, not built). The chunk-4 change makes the stub **honest**: previously clicking "Verify Identity" set `kycState='pending'` → fabricated "Your identity check is being reviewed…" when no check ever started (same dishonesty class as chunk-3's tick-revert fix). Now:
- CTA is inert (console.warn only, marker kept for the port).
- Server 403 KYC_REQUIRED carries the investor's real `kycStatus` from `profiles.kyc_status` (replaces bare `requireVerifiedKyc` throw).
- Modal renders the honest state machine: `pending` → pending copy, `rejected` → rejected copy, else → prompt.

**Step 5 Pay** — already wired (chunk-3): Stripe hosted redirect, success_url → `/mystable?checkout=success&slug&units`, cancel_url → horse page `?units=`. Unchanged, verified present.

**Step 6 Own** — already landed (chunk-1 f8): `/mystable?checkout=success` green "Welcome to the syndicate" banner. Unchanged, browser-verified.

## Walk evidence (headless Chromium :3010, authenticated alex kyc=unverified)

- Login → /mystable ✓
- Step 6: success banner shown — "Welcome to the syndicate — your 1.0% stake in nellie is being finalised." ✓
- Nellie → Become an Owner → modal → Invest in → Step 3 → both docs ticked (authenticated ticks succeed; Proceed false→true) → Proceed → **KYC prompt shown (1)** ✓
- Fake pending copy: **0** before and after Verify Identity click ✓ (stub no longer fabricates)
- Verify Identity click → prompt still shown (1), no state change ✓
- Screenshot: `chunk4-kyc-prompt.png`

## Gates

- `pnpm --filter @evo/web typecheck` — PASS
- `just check` — 10/10 PASS

**Chunk-4 complete → chunk-5** (f9 5 stepper error states + f10 7-code Stripe error→copy mapping).
