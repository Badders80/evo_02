# TRACK B BRIEF — gbrain Repairs (separate session, runs parallel to Track A)

**Goal:** restore the knowledge hub to working order. Read/write gbrain + systemd only. ZERO contact with evo_02 code.

**Hard rules:**
- DO NOT touch `/home/evo/new/evo_01/02_website` — its working tree is dirty (93 uncommitted changes on refactor/design-system-cleanup) and must not be stashed/checked-out/"cleaned".
- Write to gbrain through MCP tools (`put_page` / `add_link` / `add_timeline_entry`), NOT the `gbrain` CLI (PGLite single-writer; serve holds the lock). CLI is allowed ONLY for the queue-drain step explicitly listed below.
- Git ops: `git -C <path>` or verify cwd after cd. Never chain onto a fallback directory.
- KYC RULE: never read/feed `migration_bridge/Migrated Existing HLTs/`.

## Work items (in order)

1. **Fix sync script** (~15 min) — `/home/evo/.config/systemd/user/gbrain-sync.sh`
   - Lines 19–21 end in `|| true`, which swallows sync failures; marker gets written unconditionally → timer green while data path red.
   - Remove the failure-swallowing `|| true` from the three DATA steps (lines 19–21: sync/extract/embed). Keep `|| true` on the systemctl stop/restart lines (lines 14, 18) — service control noise shouldn't fail the run.
   - Make the marker file write conditional: only stamp "done" if all three data steps exited 0. On any failure: skip marker, log the failed step name to stderr so journalctl shows it.
   - Do NOT restart the timer yet — finish edits first.

2. **Rerun sync + acknowledge failures** (~10 min)
   - Run the fixed script once by hand; verify exit code 0 and marker written.
   - Check the brain reports a fresh evo00 last-sync timestamp (today), and acknowledge/clear the 4 standing sync failures.

3. **Drain the wedged queue** (~10 min) — PGLite has no background worker; CLI run drains it.
   - Run once manually: facts-absorb for the 10 waiting jobs + embed-backfill for 1 job (queue items date ~Aug 20).
   - Verify queue depth returns to 0 via job stats.

4. **Fix hub index drift** (~10 min)
   - Link orphan card `fact/e2e-wire-pipeline` into `evolution-stables/hub` (it's the freshest card, zero inbound links).
   - Add the 4 missing cards to the hub index: live-auth-and-supabase, r2-media-hub, live-asset-lock, e2e-wire-pipeline.
   - Add one timeline entry: "2026-08-26 — sprint e2e-wire locked at cb4ac12 (content/logic); UI sprint opened on branch ui-sprint-1."
   - Then verify with a query (e.g. search "e2e wire pipeline" → hub-indexed card ranks).

5. **Dedupe default-source copies** (~30 min)
   - Every evo_00 doc exists twice: early manual import in default source + git-sourced evo00 mirror. Keep the git-sourced copy as canonical; remove/archive the default-source duplicates per gbrain's source-archive flow (soft path preferred over hard delete).
   - Also retire the dead "new" source registration if safe.

6. **Fix naming drift** (~5 min) — root cause of two agent misdirections today
   - Update home `CLAUDE.md` build-surface pointer: canonical surfaces live under `/home/evo/new/` — evo_00 = control plane, evo_01 = production website host UNTIL Vercel cutover (then archive), evo_02 = active build surface.
   - Delete stray `/home/evo/evo_01/` ONLY after confirming with founder it's empty scaffolding (contains just racing-content/, no git). Ask first; do not delete unilaterally.
   - Add standing rule to relevant AGENTS.md: "git operations must use `git -C <path>` or verify cwd after cd — never chain onto a fallback directory."

7. **Feed-back rule** — if during any query a canonical fact is new or changed vs the hub, write it back in-session (put_page/add_link/add_timeline_entry). Milestone card for the UI sprint itself waits until founder approves the look post-click-through.

## Wrap

- Report each item done/not-done with evidence (exit codes, timestamps, query results).
- Note anything deferred (gbrain version bump 6 patches behind, cache-hit tuning, volunteer channel, Groq subagent cost — all parked as nice-to-haves, no dates).

## Parallel-safety

Track A owns evo_02 code files; Track B owns systemd/gbrain/evo_00 docs. No overlap. Whoever finishes second writes the combined wrap state in evo_02/CONTINUE.md § handoffs.
