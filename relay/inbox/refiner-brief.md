# Refiner Brief for Kimi (kimi-k2.7-code:cloud)

## Context
- Repo: evo_02 branch `sprint-1-nellie-loop`
- Task: Forensic Sprint 1 Nellie-loop audit
- Author floor: `pnpm typecheck && pnpm test` green
- Do not merge/push/apply SQL to Evolution-3.0

## Invariants
1. Cap table: implied allocated = total_shares - shares_available - reserved_shares. Consume decrements reserved only; must not double-count.
2. Prize 75/25/0 Evolution (legal_engine SSOT).
3. Zero PII: `kyc_audit_digest` `^[a-f0-9]{64}$` or null. No guest, no sha256_placeholder.
4. Fail closed on reserve/consume/holdings/HMAC.
5. Nellie-only checkout. Mission Control source untouched.

## Dispatch
Sent to Ollama Cloud `kimi-k2.7-code` (2026-08-21). Findings ingested; HIGH/MED applied on branch.

See `relay/inbox/kimi-audit-response.md` for the refiner output.
