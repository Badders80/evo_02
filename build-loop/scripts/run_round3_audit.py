#!/usr/bin/env python3
"""Round-3 paid audit runner — evidence is ALWAYS regenerated fresh at run time.
Never hand-build packs; this script is the single source of audit evidence.
Usage: python3 build-loop/scripts/run_round3_audit.py"""
import json, subprocess, time, urllib.request
from pathlib import Path

BASE = Path("/home/evo/new/evo_02")
OUT = BASE / "build-loop" / "paid-audit-deepseek-v4-pro-r3.out"
EXCLUDE = ("tsconfig.tsbuildinfo",)

def sh(cmd: str) -> str:
    return subprocess.run(cmd, shell=True, cwd=BASE, capture_output=True, text=True).stdout

def read(rel: str) -> str:
    return (BASE / rel).read_text()

parts = []

# 1. Fresh diff (tracked changes vs base)
diff = sh("git diff 2e5bc31 -- . " + " ".join(f"':!**/{x}'" for x in EXCLUDE))
parts.append(f"===== FRESH GIT DIFF vs base 2e5bc31 (generated {time.strftime('%Y-%m-%dT%H:%M:%S')}) =====\n{diff}")

# 2. ALL new/untracked sprint files, verbatim, discovered live from git status
status = sh("git status --porcelain")
untracked = []
for ln in status.splitlines():
    if not ln.startswith("??"):
        continue
    u = ln[3:].strip()
    if u.endswith("/"):  # git lists new directories with trailing slash — expand to their files
        out = subprocess.run(["git", "ls-files", "--others", "--exclude-standard", u],
                             cwd=BASE, capture_output=True, text=True).stdout
        untracked.extend(f for f in out.splitlines() if f.strip())
    else:
        untracked.append(u)
sprint_untracked = [u for u in untracked if u.startswith(("apps/", "packages/")) and not u.endswith(EXCLUDE)]
for rel in sprint_untracked:
    p = BASE / rel
    if p.is_file() and p.stat().st_size < 60_000 and ".env.local" not in rel:
        parts.append(f"===== NEW FILE :: {rel} =====\n{p.read_text()}")

# 3. Reports + delta plan
for rel in [
    "build-loop/final-sprint-report.md",
    "build-loop/audit-report.md",
    "build-loop/chunk-audits-r3.md",
    "build-loop/back-office-walk.md",
    "build-loop/mid-office-walk.md",
    "build-loop/delta-share-auth-plan.md",
]:
    p = BASE / rel
    if p.exists():
        parts.append(f"===== REPORT :: {rel} =====\n{p.read_text()}")

# 4. Round-2 disposition table (what was real vs stale, what closed it)
parts.append("""===== ROUND-2 DISPOSITION (auditor must verify each row against the material) =====
| R2 finding | Disposition | Where to verify |
|---|---|---|
| F1/F2 BLOCKER share math still old (floor/minStake/??100) | STALE-DIFF artifact (R2 saw pre-fix diff); fix landed | campaign-pipeline.ts buildLegalContext/buildInventoryInsert in the FRESH DIFF below |
| F4 MAJOR adapter accepts missing stake | REAL → CLOSED | intake-adapter.ts REQUIRED_FIELDS + reject-case tests in campaign-pipeline.test.ts |
| F5 BLOCKER server action unauthenticated | REAL → CLOSED | operator-auth.ts guard-first in publish-campaign.ts; login route curl trio in back-office-walk.md |
| F9 MAJOR hardcoded service key | REAL → CLOSED | tests now read gitignored .env.local fail-loud (both apps) |
| F12 WARN unused vars | CLOSED | grep the fresh diff for _stakeStepPct/_totalShares |

===== ROUND-3 DISPOSITION (auditor must verify each row against the material below) =====
| R3 finding | Disposition | Where to verify |
|---|---|---|
| SHARE-UI BLOCKER: pricing-card showed share-count semantics | FIXED by honest rename — value was always correct percent; prop now named availablePct end-to-end | pricing-card.tsx props/lines 11/20/25/105 + horses/[slug]/page.tsx:259 |
| MIGRATION-EDIT MAJOR: 00001 schema edited post-application | RESOLVED — only packages/db_models source template changed; supabase/migrations/* untouched vs base; live DB constraint inventory_check2 verified equal to canonical rule | git diff 2e5bc31 --stat -- supabase/migrations/ (empty); mid-office-walk.md live-constraint evidence |
| AUTH-CODE-GAP MINOR/WARN: login route + publish action absent from pack | RUNNER BUG FIXED — untracked directories now expanded via git ls-files; both sources included verbatim in NEW FILE sections below | sections: apps/mission_control/src/app/actions/publish-campaign.ts, apps/mission_control/src/app/api/operator/login/route.ts |

===== ROUND-4 DISPOSITION (auditor must verify each row against the material below) =====
| R4 finding | Disposition | Where to verify |
|---|---|---|
| N1 BLOCKER integer-only stake options violate 0.5% increments | FIXED — selector emits every 0.5% multiple from 1% floor, capped at availability | pricing-card.tsx STAKE_OPTIONS block (~lines 24-34); options are multiples of SHARE_MATH.DEFAULT_STAKE_STEP_PCT starting at 2*step |
| N2 MAJOR no multiple-of-step validation on total stake | FIXED — adapter rejects non-multiples; reject-case tests assert throws for 5.1/5.25/3.33, accepts 5.5 | intake-adapter.ts step-multiple check after REQUIRED_FIELDS loop; campaign-pipeline.test.ts runRejectCases |
| N3 MINOR raw ENOENT on missing .env.local | FIXED — try/catch with actionable message | campaign-pipeline.test.ts env loading block |
| HOST-FOUND: checkout sent PERCENT into share-count reservation RPC (priced X%, reserved X/2%) | FIXED at boundary only per locked directive: stakePctToStepUnits converts percent→step-units immediately before rpc('reserve_campaign_shares'); metadata/webhook/holdings stay percent; webhook parses float + compares consumed units vs converted expected units | nellie-loop.ts helpers; create-session/route.ts p_units line; webhooks/stripe/route.ts parseFloat + RESERVATION_UNITS_MISMATCH guard; nellie_loop.test.ts boundary tests |

Canonical locked rule (founder 2026-08-26): lot = increment (0.5%); min investment = floor (1%), never a divisor;
units = stake ÷ step (5%/0.5% = 10); investor-facing percentages only, "Lots" banned; no auto-default stake.
DB constraint 00001: total_shares = round(listed_stake_pct / stake_step_pct, 2).""")

context = "\n\n".join(parts)

prompt = f"""You are the independent Stage-5 paid auditor, ROUND 3 (final pre-merge gate), for sprint e2e-wire,
evo_02 monorepo, branch sprint-1-nellie-loop, base commit 2e5bc31. All sprint changes are UNCOMMITTED;
the material below IS the complete sprint (fresh diff generated just now + every untracked file verbatim).

Tasks:
1) Verify every row of the ROUND-2 DISPOSITION table against the material below — cite file:line.
2) Verify the canonical locked share rule end-to-end: legal context math == insert math == DB constraint ==
   integration-test assert == term-sheet/PDS wording (min investment + increments, no 'Lots').
3) Verify operator auth: login route fail-closed before parse, timing-safe compare, httpOnly cookie holds a
   sha256 digest (never the raw token), publish-campaign.ts guard runs BEFORE any payload handling,
   no raw token logged or persisted anywhere.
4) Cross-cutting: secret hygiene (no sb_secret literals; .env.example placeholders only), gitignore coverage,
   tokinvest purge (only brand_dna voice list), 64-hex hashes, no edits to applied migrations, no prod contact.
5) New-issue sweep on the full material.
6) Verdict: PASS iff no FAIL and no WARN touching auth/secret integrity or share math.

Report: numbered findings (# | Claim | PASS/FAIL/WARN | Evidence file:line), cross-cutting results,
new findings (BLOCKER/MAJOR/MINOR), JSON audit graph {{findings, evidence_edges}},
final line exactly "VERDICT: PASS" or "VERDICT: FAIL".

{context}"""

body = json.dumps({
    "model": "deepseek-v4-pro:cloud",
    "messages": [{"role": "user", "content": prompt}],
    "stream": False,
    "options": {"temperature": 0.2},
}).encode()

req = urllib.request.Request("http://localhost:11434/api/chat", data=body, headers={"Content-Type": "application/json"})
t0 = time.time()
with urllib.request.urlopen(req, timeout=570) as r:
    resp = json.load(r)
elapsed = time.time() - t0
content = resp.get("message", {}).get("content", "(no content)")
OUT.write_text(f"elapsed_s={elapsed:.0f}\nmodel={resp.get('model')}\nevidence_files={len(parts)}\n\n{content}\n")
verdict = "VERDICT: PASS" if "VERDICT: PASS" in content else "VERDICT: FAIL" if "VERDICT: FAIL" in content else "VERDICT: UNPARSEABLE"
print(verdict, f"({elapsed:.0f}s, {len(content)} chars, {len(parts)} evidence sections)")
