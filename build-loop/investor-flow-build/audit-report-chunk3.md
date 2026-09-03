# investor-flow-build — chunk-3 audit

**Date:** 2026-09-04
**Auditor:** kimi-k2.7-code:cloud (diff embedded — apps/web/src only)
**Scope:** commit 2177c91 (base efb13f7) + fix commit d361282

## Verdict: PASS-WITH-WARNINGS (14 findings: 8 OK / 6 WARN)

| # | Finding | Severity | Disposition |
|---|---|---|---|
| 1 | Step 3 accordion/Completed badge/locked CTA implemented | OK | — |
| 2 | Hash truncation 4+4 format | OK | — |
| 3 | `handleTick` swallows server failures — silent fake acceptance | WARN | **FIXED** (d361282) — tick only sets true on res.ok, reverts on failure |
| 4 | 403 handling assumes every 403 is KYC_REQUIRED, never reads body code | WARN | **FIXED** (d361282) — checks `body.code === 'KYC_REQUIRED'`, other 403s throw |
| 5 | KYC prompt copy + pending/rejected states correct | OK | — |
| 6 | "Verify Identity" button is a stub (console.warn) | WARN | **ACCEPTED** — by design: KYC port (Firebase → Supabase) is a separate workstream, wiring happens in chunk-4; prompt surface is the deliverable |
| 7 | /api/acceptance: requireUserId before insert, service client, HttpError mapping | OK | — |
| 8 | Payload numeric validation "not visible in diff" | WARN | **FALSE ALARM** — route.ts validates `Number.isFinite(stakePct)` + doc whitelist (verified in final file, route committed efb13f7) |
| 9 | AcceptanceGateModal + gateOpen removed from rail | OK | — |
| 10 | Duplicate LegalPackDigest interface possible | WARN | **FALSE ALARM** — both interfaces used: rail's own prop type + modal's own; no import conflict (both define identical shape, no shared import) |
| 11 | 401 redirect preserves ?units= | OK | — |
| 12 | Modal shell max-w-lg × h-[720px], stake lifted, initialStakePct plumbing | OK | — |
| 13 | Rail slider can drift from modal stake when user closes | WARN | **FIXED** (d361282) — `onStakeChange` callback syncs rail state |
| 14 | Vocabulary/tone clean | OK | — |

Gates re-run after fixes: typecheck PASS, just check 10/10 PASS.

**Chunk-3 complete → chunk-4** (Steps 4–6: Verify prompts + Pay redirect + Own success). Note: chunk-4 wires the KYC "Verify Identity" CTA to the real port (audit #6) — the port itself is a separate workstream.
