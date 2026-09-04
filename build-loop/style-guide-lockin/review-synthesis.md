# Stage 2 — Plan review synthesis

**APPROVED: 2026-09-04 (sandbox execution). Go-live deferred to founder approval — everything lands on branch `style-guide-lock-in`, nothing merges.**

Reviewers: A = `opencode/nemotron-3.5-lightning-free` → (server error ×2, fell back to `ollama qwen3.5:9b`), B = `ollama deepseek-v4-pro:cloud`.

## 🔥 Both agree — applied

| Finding | Where | Resolution |
|---|---|---|
| Extraction without first-consumer migration → duplication/dead-weight | B#9, A#1/A#2 | SG-2 converts right-rail.tsx to consume primitives (Rule 13 one-client-first); inline patterns deleted |
| Verification must exercise the package in isolation | B#7 | `pnpm --filter @evo/ui build/test/typecheck` + import guard (react + @evo/brand_dna only) |
| No visual-regression step on class extraction | B#8 | before/after screenshot of right rail :3010 as SG-2 DOD |
| Approval gate missing from graph | B#10, A#5 | `cmd:founder-approval` node added; edge after kimi-audit |

## 🟠 One flagged / orchestrator gap

| Finding | Where | Resolution |
|---|---|---|
| Primitives must stay in existing token vocabulary (both reviewers missed) | orchestrator | class-strings only from globals.css theme; no new arbitrary values — package stays renderable in apps/web |
| Phase C deferral = persistence of debt | A#4 | intentional (wrap-up warning: guide lock BEFORE reactive fixes); proof point supplied by SG-2 first-consumer |
| 39 dirty files frozen | A#3 | pre-existing terminology sweep, out-of-cycle; noted only |

## Contested

None. Contested items are closed by the founder's own sandbox contract (deferral + approval gate are per-founder instruction).

Plan and plan-graph.json updated to carry the amendments. Chunked in chunks.md.
