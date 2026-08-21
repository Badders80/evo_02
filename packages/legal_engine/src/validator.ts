/**
 * Compliance & Terminology Purge Validator for Evolution Stables legal packs.
 * Authority: evo_00/doc/VOICE_AND_TONE_MANUAL.md and evo_00/migration_bridge/04_LEGAL_DIFF_AUDIT.md
 */

import type { SyndicateLegalContext, ValidationIssue, ValidationReport } from './types';
import { BANNED_LEGAL_TERMS } from '@evo/brand_dna/voice';

export const MANDATORY_SA_CLAUSES = [
  'Clause 6: Equine Welfare Supremacy',
  'Clause 8: Default & Float Reserve Drawdown',
  'Clause 11: Syndicate Management Fee',
  'Clause 12: Manager Removal',
  'Clause 13: Governing Law',
] as const;

export const MANDATORY_PDS_SECTIONS = [
  '§1. Title & Structure',
  '§2. Asset Specifics',
  '§3. Commercial Model',
  '§4. Float & Billing',
  '§5. Gross Stakes Split',
  '§6. Exit & Close Style',
] as const;

/**
 * Validates a compiled legal pack for banned terminology and mandatory clause presence.
 */
export function validateLegalPack(
  pdsMarkdown: string,
  saMarkdown: string,
  context?: SyndicateLegalContext,
  termSheetMarkdown?: string
): ValidationReport {
  const issues: ValidationIssue[] = [];
  const combined = `${termSheetMarkdown || ''}\n${pdsMarkdown}\n${saMarkdown}`.toLowerCase();

  // 1. Banned terminology purge
  for (const term of BANNED_LEGAL_TERMS) {
    const pattern = new RegExp(`\\b${term.replace(/\\s+/g, '\\\\s+')}\\b`, 'i');
    if (pattern.test(combined)) {
      issues.push({
        severity: 'error',
        code: 'BANNED_TERM',
        message: `Prohibited legacy term detected: "${term}". Purge per NZTR compliance gate.`,
      });
    }
  }

  // 2. Mandatory PDS sections
  for (const section of MANDATORY_PDS_SECTIONS) {
    if (!pdsMarkdown.includes(section)) {
      issues.push({
        severity: 'error',
        code: 'MISSING_PDS_SECTION',
        message: `PDS missing mandatory section: ${section}`,
      });
    }
  }

  // 3. Mandatory SA clauses
  for (const clause of MANDATORY_SA_CLAUSES) {
    if (!saMarkdown.includes(clause)) {
      issues.push({
        severity: 'error',
        code: 'MISSING_SA_CLAUSE',
        message: `SA missing mandatory clause: ${clause}`,
      });
    }
  }

  // 4. Mathematical pricing anchors
  if (context) {
    const expectedList = Math.ceil(context.pricing.costMonthlyNzd * 1.05 * 1.03);
    if (context.pricing.listPriceNzd !== expectedList) {
      issues.push({
        severity: 'error',
        code: 'PRICING_MISMATCH',
        message: `listPriceNzd (${context.pricing.listPriceNzd}) does not match DSL formula CEIL(cost × 1.05 × 1.03) = ${expectedList}`,
      });
    }

    const expectedKeep = Math.ceil(context.pricing.listPriceNzd * 0.01);
    if (context.pricing.monthlyKeepUnitNzd !== expectedKeep) {
      issues.push({
        severity: 'error',
        code: 'KEEP_RATE_MISMATCH',
        message: `monthlyKeepUnitNzd (${context.pricing.monthlyKeepUnitNzd}) does not match CEIL(list × 0.01) = ${expectedKeep}`,
      });
    }

    const expectedFloat = 5 * context.pricing.monthlyKeepUnitNzd;
    if (context.pricing.joinFloatUnitNzd !== expectedFloat) {
      issues.push({
        severity: 'error',
        code: 'FLOAT_MISMATCH',
        message: `joinFloatUnitNzd (${context.pricing.joinFloatUnitNzd}) does not match 5 × keep = ${expectedFloat}`,
      });
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

export function formatValidationReport(report: ValidationReport): string {
  if (report.valid) {
    return '✅ Legal pack validation PASSED. No banned terms, all mandatory clauses present, pricing invariants hold.';
  }

  const lines = ['⚠️ Legal pack validation FAILED:'];
  for (const issue of report.issues) {
    const icon = issue.severity === 'error' ? '🚨' : '⚠️';
    lines.push(`${icon} [${issue.code}] ${issue.message}`);
  }
  return lines.join('\n');
}

/**
 * Checks arbitrary text (PDS soft content, marketing hooks, highlight tags) for compliance hits.
 */
export function validateSyndicateContent(text: string): { ok: boolean; hits: string[] } {
  if (!text || !text.trim()) return { ok: true, hits: [] };
  const hits: string[] = [];

  for (const term of BANNED_LEGAL_TERMS) {
    const pattern = new RegExp(`\\b${term.replace(/\\s+/g, '\\\\s+')}\\b`, 'i');
    if (pattern.test(text)) {
      hits.push(term);
    }
  }

  const guaranteedPattern = /\bguaranteed\s+(return|income|profit|yield|dividend)s?\b/i;
  if (guaranteedPattern.test(text)) {
    hits.push('guaranteed return claim');
  }

  return {
    ok: hits.length === 0,
    hits,
  };
}
