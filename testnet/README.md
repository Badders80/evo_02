# testnet — the local, structured walk of the money rail

One command runs the whole rail against the **running local app + local Supabase + Stripe test mode**,
judges each step machine-side, prints PASS/FAIL with its evidence, always reverts what it changed, and
writes a report. It exists because three models reviewed this rail and all missed a bug that a single real
payment exposed immediately.

```bash
# prerequisites: dev server on :3000 with the preview flag OFF, `stripe listen` forwarding, local Supabase up
node testnet/run.mjs            # M1..M8
node testnet/run.mjs M4 M5      # a subset (needs the earlier checks' state)
```

Exit code is 0 only when every selected check passes.

## Checks

| id | check | TASKS line |
|---|---|---|
| M1 | investor signs in through the real `/auth/login` form | 2.1 |
| M2 | checkout session created for the **full remaining stake** | 2.1 |
| M3 | test card charges the real Stripe session (asserted against the Stripe API, not the UI) | 2.1 |
| M4 | webhook settles — event marked `processed`, no 409 | 2.1a |
| M5 | holding row: `float_months_held = 5`, both hashes stamped, subscription attached | 2.1 |
| M6 | reservation consumed, availability decremented by exactly the stake | 2.1 |
| M7 | MyStable renders the holding (not the empty dashboard) | 2.2 |
| M9 | a **repeat purchase** of the same horse is refused before payment | 2.1e |
| M8 | revert: horse back to `coming_soon`, stale reservations released | 2.1d |

**M2 deliberately buys out the *entire* remaining stake.** That is the boundary where this rail broke on
2026-09-12: the buyer's own reservation drove `shares_available` to 0, the app's sold-out derivation
reported the horse as `fully_subscribed`, and the webhook's eligibility gate refused the purchase that had
already been charged. A walk that buys 1% of a 5% syndicate would never have found it.

## Guards

- **Refuses to run when the preview bypass is on** (`WORKFLOW_PREVIEW` / `NEXT_PUBLIC_WORKFLOW_PREVIEW`).
  That flag disables every checkout and eligibility gate, so a green run against it proves nothing. It bit
  us once already: `apps/web/.env.local` sets `NEXT_PUBLIC_WORKFLOW_PREVIEW=true`, so anything that loads
  that file without shell overrides is running bypassed. Override with `TESTNET_ALLOW_PREVIEW=1` only when
  you *mean* to walk the preview path.
- **Refuses to run without a `sk_test…` key.** No live mode, ever.
- **Always reverts** in a `finally` block: `release_expired_reservations()` + the horse back to
  `coming_soon` — even if a check throws.
- The walk owns its fixture state: it flips the horse to `listed`, restores availability (`TESTNET_REARM_SHARES`,
  default 8 units), and **deletes this investor's own holdings/reservations for that horse** so a full run always
  starts from the same place. Other users' rows are never written. `TESTNET_REARM=0` disables the re-arm.
- **A failed check skips its dependants** rather than cascading (`M3←M2`, `M4←M3`, `M5←M4`, `M6←M2`, `M9←M5`).
  Skips print as `SKIP`/`⏭️` and are not counted as failures — but any FAIL still exits non-zero.

## Layout

```
testnet/
  run.mjs        runner: guard -> fixtures -> checks -> revert -> report
  checks.mjs     the check definitions (IDs match TASKS.md)
  lib/db.mjs     local Supabase reads + the few reversible fixture writes
  lib/browser.mjs local chromium over CDP + the login and Stripe-card drivers
  reports/<ts>/  report.json + report.md per run (gitignored — evidence, not source)
```

`lib/browser.mjs` reuses the box's cached Playwright chromium and `playwright-core` by path
(`~/.cache/ms-playwright`, `~/.hermes/hermes-agent/node_modules`) — the Hermes browser backend cannot
reach localhost, and `playwright-core` is deliberately not a repo dependency.

## What it does not cover

- The Identity/KYC flow in Stripe's hosted page (needs a human or a hosted-flow driver) — TASKS 2.3.
- The visual steps on the founder's machine — TASKS 2.4.
- Anything on prod: this rig points at the local stack only, by design.