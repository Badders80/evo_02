/**
 * Master compiler for Evolution Stables legal packs.
 * Combines PDS + SA generation, validation, and SHA-256 hashing.
 */

import { computeSha256 } from '@evo/storage/hash';
import type { SyndicateLegalContext, CompiledLegalPack, ValidationReport } from './types';
import { generateTermSheetMarkdown } from './term_sheet';
import { generatePdsMarkdown } from './pds';
import { generateSaMarkdown } from './sa';
import { validateLegalPack } from './validator';

export interface CompileOptions {
  skipValidation?: boolean;
}

/**
 * Compiles a complete legal pack (Term Sheet, PDS, SA) and computes canonical SHA-256 digests.
 */
export function compileLegalPack(
  context: SyndicateLegalContext,
  options: CompileOptions = {}
): { pack: CompiledLegalPack; validation: ValidationReport } {
  const termSheetMarkdown = generateTermSheetMarkdown(context);
  const pdsMarkdown = generatePdsMarkdown(context);
  const saMarkdown = generateSaMarkdown(context);

  const validation = options.skipValidation
    ? { valid: true, issues: [] }
    : validateLegalPack(pdsMarkdown, saMarkdown, context, termSheetMarkdown);

  if (!validation.valid) {
    throw new Error(
      `Legal pack validation failed:\n${validation.issues.map((i) => `[${i.code}] ${i.message}`).join('\n')}`
    );
  }

  const pack: CompiledLegalPack = {
    termSheetMarkdown,
    pdsMarkdown,
    saMarkdown,
    termSheetHash: computeSha256(termSheetMarkdown),
    pdsHash: computeSha256(pdsMarkdown),
    saHash: computeSha256(saMarkdown),
    metadata: {
      syndicateName: context.syndicateName,
      campaignSlug: context.campaignSlug,
      ownerName: context.ownerName,
      pdsVersion: context.pdsVersion,
      saVersion: context.saVersion,
      effectiveDate: context.effectiveDate,
    },
  };

  return { pack, validation };
}

export { generateTermSheetMarkdown, generatePdsMarkdown, generateSaMarkdown, validateLegalPack, computeSha256 };
