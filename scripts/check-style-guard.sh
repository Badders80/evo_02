#!/usr/bin/env bash
# check-style-guard.sh — inline class-string enforcement for the canonical style guide.
# Contract: evo_00/doc/STYLE_GUIDE.md Part 4. These two class strings must ONLY exist inside
# @evo/ui primitives (<Eyebrow>, <StatRow>). A surface that spells them inline is drifting.
#
# Scan scope (env-overridable for tests): apps/ + packages/ except packages/ui.
# Known debt 2026-09-04: 8 apps/web files still carry inline tracking-[0.2em]
# (Phase C refactor targets — see STYLE_GUIDE.md Part 4 list). Until Phase C lands,
# this guard intentionally exits 1 and names them. That is the point: drift stays visible.
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

SCAN_DIRS="${STYLE_SCAN_DIRS:-apps packages}"

# P1 inline eyebrow — must be <Eyebrow>
INLINE_EYEBROW='text-\[11px\] font-medium uppercase tracking-\[0.2em\]'
# P5 inline stat-row label — must be <StatRow>
INLINE_STAT_LABEL='text-\[10px\] font-mono uppercase tracking-\[0.2em\] text-muted-foreground block mb-1'

violations=0

scan() {
  # shellcheck disable=SC2086
  find $SCAN_DIRS -type f \( -name '*.tsx' -o -name '*.ts' \) \
    -not -path '*/node_modules/*' -not -path '*/dist/*' -not -path 'packages/ui/*' \
    -print0 2>/dev/null | xargs -0 grep -nE "$1" 2>/dev/null || true
}

eyebrow_hits="$(scan "$INLINE_EYEBROW")"
stat_hits="$(scan "$INLINE_STAT_LABEL")"

if [ -n "$eyebrow_hits" ]; then
  echo "STYLE-GUARD FAIL: inline eyebrow pattern found (use <Eyebrow> from @evo/ui):"
  echo "$eyebrow_hits"
  violations=$((violations + 1))
fi
if [ -n "$stat_hits" ]; then
  echo "STYLE-GUARD FAIL: inline stat-row label pattern found (use <StatRow> from @evo/ui):"
  echo "$stat_hits"
  violations=$((violations + 1))
fi

if [ "$violations" -gt 0 ]; then
  echo ""
  echo "STYLE-GUARD: $violations violation group(s). Resolve via @evo/ui primitives."
  echo "Reference: evo_00/doc/STYLE_GUIDE.md Part 4 (enforcement contract)."
  exit 1
fi

echo "STYLE-GUARD OK: no inline eyebrow/stat-row class strings outside @evo/ui."
exit 0
