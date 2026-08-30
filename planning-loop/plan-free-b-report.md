Thinking: Let me read the brief first
Thinking: I have the brief and the planner prompt. The free-a and free-b reports are basically empty (the models just thought). The paid report is partial. My job is to produce the strategic analysis. Let me actually investigate the repo to ground my analysis, but the brief is very detailed and well-evidenced. The instruction says "be specific, name files." I should verify a few claims but the brief itself is the evidence. Let me do a few quick verifications to make my analysis credible, then write the output.

This is a planning-only exercise. I should output structured markdown. Let me verify a couple of the load-bearing claims quickly, then write the analysis. But I shouldn't overdo it. Let me check some key files exist as claimed.

Actually, given the brief is comprehensive, I'll do targeted verification of the most important load-bearing claims: the inventory-ids.ts, horses-data.ts service role, the legal pack compile share-math, and the dual schema dirs. Then write the expansion.

Let me be efficient and run a few greps in parallel
Thinking: I have strong evidence. Key confirmations:
- `horses-data.ts` line 272-299: `getCompiledLegalPackForCampaign` passes `totalShares: Math.round(campaign.totalSyndicateStakePct)` — confirms the share-math bug.
- `capTableFixture.retainedPct` confirmed at lines 53, 157, 207 — 4-way leftover.
- `getAllCampaigns`/`getCampaignBySlug` use `getSupabaseServiceClient()` — confirms RLS bypass.
- Dual schema dirs confirmed: `packages/db_models/src/schema/` (00001-00004 + 00003_seed_live_horses_and_investors.sql 487 lines) vs `supabase/migrations/` (00001-00007).
- `CANONICAL_INVESTORS` is in `apps/mission_control/src/lib/investor-registry.ts`.
- `docs/PLAN_WEB_REBUILD.md` exists.
- OG desc grep returned nothing in layout.tsx — so the claim "layout.tsx OG description still 'Grounded in tradition...'" may be in a different file (metadata). Let me not over-claim; brief says layout.tsx. I'll soften slightly but the brief asserts it. Actually my grep on layout.tsx found nothing. Let me note it's likely but unverified location. Actually the brief is the source; I'll trust it but flag location. Let me quickly verify where OG desc is.

Actually I should be efficient. I have enough to write a strong, specific analysis. The OG description claim is minor. Let me do one quick grep for "Grounded" across web to confirm.

Let me just write the analysis now. The task is to produce structured markdown. I'll write it as my final message (output), not to a file necessarily. The brief says "Output as structured markdown." It's a planning exercise. I should present it in my response. But it's long. I could write it to a file in planning-loop. The user said "Expand this brief" — they gave the planner-prompt. I think output in the response is expected. But it's substantial. Given CLI context, I'll produce it as my message.

Actually, given the planning-loop directory contains reports, maybe I should write my expanded analysis to a file too so it's persisted. But the instruction said "Do not write code" — writing a markdown analysis file is fine and useful. But the user prompt (planner-prompt.txt) is the meta-instruction for me now. It says "Output as structured markdown". I'll output in the message. However the previous free-a/free-b reports were written to files. To be safe and useful, I'll write the expansion to a file AND summarize. Actually, re-reading: this is an exercise where I am the strategic engine. I'll write the deliverable to planning-loop/brief-expansion.md and also present key points? That might be too much output. 

Given "Be specific. Name files." the output is long. I'll write to file to keep CLI clean, then give a 1-line pointer. But the persona wants the content visible. Hmm. I think writing to a file is the cleanest and the user can read it. But they may want it inline. I'll write to file and print the full content isn't necessary — but the instructions value conciseness. 

I'll write the expansion to `planning-loop/brief-expansion.md` and give a brief summary line. That respects "output as structured markdown" (in a file) and keeps the CLI readable. Actually the user explicitly might read the file. Let me write it.

Let me write a thorough, opinionated document
I have enough verified evidence. Key confirmations: `horses-data.ts:272-299` passes `totalShares: Math.round(campaign.totalSyndicateStakePct)` (percentage, not step-units), `capTableFixture.retainedPct` at lines 53/157/207, `getAllCampaigns`/`getCampaignBySlug` use service client (RLS bypass), dual schema dirs confirmed, `CANONICAL_INVESTORS` in `apps/mission_control/src/lib/investor-registry.ts`.

Let me write the expansion to a file so the analysis is persisted and reviewable.
Expansion written to `planning-loop/brief-expansion.md`. Headline verdicts:

1. **Reframe:** the question isn't "nicer or replica" — it's "can we flip DNS without a second identity/money/content incident." Blast radius is transactional, not chrome.
2. **Theatrical, not real:** KYC gate with no start route, MC investor ledger (`CANONICAL_INVESTORS` fixture), dead R2 hostname, `totalShares` passed as a percentage (`horses-data.ts:298`), 4-way `retainedPct` (`horses-data.ts:53/157/207`), legal-pack hash recompile race, `inventory-ids.ts` UUID join.
3. **Load-bearing vs debt:** L1–L4 (payment_style, kill-switch, KYC gate, Nellie-only) are real; D4/D5/D7/D8/D9 are cutover blockers, not cosmetic.
4. **Flow verdict:** Capture = ship-as-is; Discover/Trust = works-but-inconsistent; KYC = dead-end; Buy = 80% real but will 400 or file wrong-share PDS; MyStable = breaks on any post-cutover horse; Operate = publishes but shows mock investors.
5. **Redundancy:** keep Firebase/Sheets/Insights purge; delete double chrome, `db_models` schema home, dead components; failed-to-replace = updates/comms, KYC start, R2 CDN.
6. **Risks:** unstated — DNS TTL/ownership, legacy lead/investor migration, Stripe Identity account status, `skipValidation:true` on legal compile (no legal sign-off), webhook failure runbook.
7. **Unasked layer:** Content/Comms SSOT + `/updates` orphaning + missing redirect map = day-one reputational incident for *existing* investors.
8. **First actions:** ranked blocker list → KYC decision → schema reconcile → redirect map → updates decision → flip DNS with `PURCHASES_ENABLED=false` unless KYC+hash+share fixes land.
