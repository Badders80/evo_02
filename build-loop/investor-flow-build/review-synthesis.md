# investor-flow-build — review synthesis

**Date:** 2026-09-03
**Auditor:** kimi-k2.7-code:cloud (via subagent, file contents embedded — ollama CLI has no filesystem access)
**Verdict: APPROVE-WITH-FIXES** (1 BLOCKER + 9 WARN + 4 OK)

## Findings applied

| # | Severity | Finding | Resolution |
|---|---|---|---|
| 1 | BLOCKER | horses-data.ts listed read-only but f3 needs it modified | plan.md Files table → Modify (C1) |
| 2 | WARN | ClosedCard path unclear | False alarm — `ClosedCampaignCard` exists in right-rail.tsx:602 |
| 3 | WARN | 401 redirect file unnamed | False alarm — right-rail.tsx:271-272, already in C1 |
| 4 | WARN | No chunk reads `?units=` on mount | Added f6b to C1 (read URL param on mount) |
| 5 | WARN | Graph node says "modal extracted" in C1 | Fixed — C1 node now says "reads ?units= on mount" |
| 6 | WARN | No per-fix verification | C1 DOD expanded to per-fix checklist |
| 7 | WARN | just-check/walk-3010 not in final chunk | Added to chunk-5 nodes |
| 8 | WARN | Mock MAX=5 vs real max | Correct as-is — mock MAX=5 is placeholder; real = availablePct |
| 9 | WARN | events payload shape undefined | Documented: `{horse_slug, stake_pct, doc, doc_hash, user_id}`, stripe_event_id NULL |
| 10 | WARN | f8 in C1 and C4 | Correct as-is — C1 implements, C4 consumes |
| 11-14 | OK | mockup look captured, events table usable, chunk chain valid, all f1-f15 assigned | — |

**APPROVED: 2026-09-03** — proceed to Stage 4 (execute). Chunk-1 dispatch.
