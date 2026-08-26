'use server';

import { createCampaignFromIntake } from '@/lib/campaign-pipeline';
import { toCampaignIntakePayload } from '@/lib/intake-adapter';
import type { RawPublishPayload } from '@/lib/intake-adapter';
import { isOperator } from '@/lib/operator-auth';

export async function publishCampaignAction(
  rawPayload: RawPublishPayload
): Promise<{ ok: true; inventoryId: string; pdsHash: string; saHash: string } | { ok: false; error: string }> {
  // Fail-closed operator gate: server actions are public POST endpoints.
  if (!(await isOperator())) {
    return { ok: false, error: 'unauthorized' };
  }
  try {
    const intakePayload = toCampaignIntakePayload(rawPayload);
    const { inventoryId, legalPack } = await createCampaignFromIntake(intakePayload);
    return {
      ok: true,
      inventoryId,
      pdsHash: legalPack.pdsHash,
      saHash: legalPack.saHash,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error during publish';
    return { ok: false, error: message };
  }
}