# investor-flow-build — kickstart prompt (2026-09-04)

Copy this block into a fresh chat to resume. Self-contained — no prior context needed.

---

You are resuming the **investor-flow-build** cycle in the evolution stables workspace (branch `design-alignment`, LOCAL-ONLY — no merge/push/deploy).

**Repo:** `/home/evo/porch/new/evo_02` — cycle artifacts in `build-loop/investor-flow-build/` (read `CONTINUE.md` there first; it is the authoritative session state).

**GOAL:** finish the 6-step investor purchase flow (horse page → ownership) to match the locked mockup `build-loop/flow-mock/index.html` (LOOK LOCKED 2026-09-02/03). Work chunk-by-chunk: implement → run gates → kimi-code-audit → commit → next chunk.

## State: 3 of 5 chunks done (all committed, all kimi-audited PASS-WITH-WARNINGS)

| Chunk | Fixes | Commits |
|---|---|---|
| C1 PR-A bug fixes | f2 stepper opens at min · f3 min_stake_pct wired DB→page · f4 locked fine-print line · f5 sold-out→fully_subscribed at data layer · f6 401 keeps ?units= · f6b ?units= restored on mount · f7 cancel_url ?units= + /marketplace/ path · f8 MyStable success banner | `b4790d2`, `efb4437` |
| C2 Modal + Step 2 term sheet | f1+f15 PurchaseFlowModal created · f14 max-w-lg×h-[720px] shell · f12 4-row summary · f11 green 75% row · stepper ▲/▼, live pricing | `a3d53c7`, `861b183` |
| C3 Step 3 accept gate | accordion + Completed badges · audit ticks → `/api/acceptance` (events table) · KYC prompt on 403 KYC_REQUIRED · old embedded gate decommissioned · tick reverts on audit failure · 403 non-KYC throws · stake sync via onStakeChange | `2177c91`, `d361282`, `be01167` |

Files now touching: `apps/web/src/components/horse/purchase-flow-modal.tsx` (Steps 2–3 host), `apps/web/src/components/horse/right-rail.tsx` (rail + modal mount), `apps/web/src/app/api/acceptance/route.ts`, `apps/web/src/lib/horses-data.ts` (minStakePct, sold-out guard), `apps/web/src/app/marketplace/[slug]/page.tsx`, `apps/web/src/app/api/checkout/create-session/route.ts`, `apps/web/src/components/mystable-dashboard.tsx`.

## Next (in order)

**CHUNK-4 — Steps 4–6 wiring** (`purchase-flow-modal.tsx` + `mystable`):
- Step 4 Verify: one-screen KYC. The "Verify Identity" CTA in Step 3 is currently a **stub** (console.warn — C3 delivered the prompt surface only). The Firebase→Supabase KYC port is a separate workstream: wire the CTA to the port's route when it exists (`/auth/verify` per spec); if it doesn't exist yet, keep the stub with a clear marker. Do NOT build the port itself.
- Step 5 Pay: Stripe hosted redirect already wired via `create-session` — modal hands off (window.location.href = data.url already in Step 3).
- Step 6 Own: MyStable success state already landed (C1 f8) — verify the modal links through.
- Gates: typecheck + `just check` + walk :3010 → kimi audit → commit.

**CHUNK-5 — Error states + mapping** (`purchase-flow-modal.tsx` + `create-session/route.ts`):
- f9: 5 stepper error states (spec `build-loop/purchase-content-spec.md`): over max "Stake available is {max}% — reduce your stake" · under min "Minimum investment is {min}% — increase your stake" · non-multiple "Stake must be a multiple of {step}%" (server: stakePctToStepUnits throws INVALID_STAKE) · cleared/empty → revert to min on blur · max/min dull-triangle notes.
- f10: 7-code Stripe error→investor-copy mapping in create-session (KYC_REQUIRED, RESERVE_FAILED, PURCHASES_DISABLED, SUPABASE_NOT_CONFIGURED, INVALID_STAKE + Stripe decline codes): server returns `code`, modal renders investor copy.
- Gates + audit + commit.

**AFTER C5:** graphics/format pass back to Claude + MiniMax M3 (Stitch wireframes, pixel alignment vs `build-loop/flow-mock/*.png`).

## Locked decisions (do not re-litigate)

- Popup = Dialog over `marketplace/[slug]` (no route change) · state = `?units=` URL + client step
- Step 2 header "Digital-Syndication Terms" · Step 3 header "Acceptance — {horse} your documents" · Step 3 CTA "Proceed to Secure Checkout" (all LOCKED)
- Modal shell `max-w-lg` × `h-[720px]` all steps · Investor Return row GREEN `text-status-active`
- Numbers from `pricingForUnits` — never mockup placeholders ($76/$380/21mo are fake) · Lease row: legal engine `termMonths` defaults 12
- Audit tick payload: `{horse_slug, stake_pct, doc, doc_hash, user_id}` via service client, stripe_event_id NULL
- Vocabulary whitelist: Stakes/Co-owners, Settlement/Distribution/Prize money, Evolution Stables. Zero exclamation marks. British English. Values PERCENT investor-facing.
- E4 welcome email OUT of scope (separate workstream)

## Environment (verified)

- **pnpm PATH:** `export PATH="/home/evo/.nvm/versions/node/v22.22.2/bin:$PATH"` before pnpm/just
- **Dev server:** `cd apps/web && pnpm dev --port 3010` (background). **3010 = evo_02 locked port** (3011 mission_control, 54321 Supabase; evo_01 old prod owns 3000). `.env.local` has PURCHASES_ENABLED=true + sk_test_ (dev-only walk path). Restart dev after any `hermes verify` (clobbers .next/).
- **Gates:** `just check` (10/10) + `pnpm --filter @evo/web typecheck` + walk :3010 (`curl -s -o /dev/null -w "%{http_code}" http://localhost:3010/marketplace/nellie` → 200)
- **kimi audit:** `ollama run kimi-k2.7-code:cloud < promptfile` — **NO filesystem access**: embed file contents/diff in the prompt (see the chunk-audit-prompt.txt files in the cycle dir as templates)
- **Browser walk:** `browser_exec` needs Windows Chrome open; else headless chromium `~/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome --headless=new --disable-gpu --no-sandbox --remote-debugging-port=9222` + playwright-core scripts in `/home/evo/.hermes/hermes-agent/` (module resolution needs scripts there). Known quirk: `innerText` returns CSS-uppercased text — match buttons via `textContent`.
- **Git:** commit ONLY chunk files; working tree carries a pre-existing unrelated terminology sweep (don't touch, don't include)

## First actions (under 5 min)

1. Read `build-loop/investor-flow-build/CONTINUE.md` + `chunks.md` (verify state matches this prompt)
2. `git log --oneline -8` — confirm head is `be01167` or newer
3. Start dev server on 3010 if down; verify `/marketplace/nellie` 200
4. Begin chunk-4
