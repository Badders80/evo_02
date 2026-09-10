import { computeDslPricing, SHARE_MATH } from '@evo/legal_engine';
import { getCampaignBySlug, getCompiledLegalPackForCampaign, isCheckoutOpen } from './horses-data';
import { getInventoryId } from './inventory-ids';

export class HttpError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/**
 * Canonical unit semantics (locked 2026-08-26): investor-facing values are PERCENTAGES.
 * The reservation RPC (00002) counts 0.5% step-units against inventory.shares_available,
 * so percent → step-units conversion happens ONLY at this boundary. Percent must be a
 * whole multiple of the step; result is an integer count of step-units.
 */
export function stakePctToStepUnits(stakePct: number, stepPct: number = SHARE_MATH.DEFAULT_STAKE_STEP_PCT): number {
  const unitsExact = stakePct / stepPct;
  const units = Math.round(unitsExact);
  if (!Number.isFinite(stakePct) || !Number.isFinite(stepPct) || stepPct <= 0 || Math.abs(unitsExact - units) > 1e-9 || units < 1) {
    throw new HttpError(400, 'INVALID_STAKE', `stake must be a multiple of ${stepPct}% (received ${stakePct})`);
  }
  return units;
}

/** Inverse mapping: integer count of step-units → percentage of the horse. */
export function stepUnitsToStakePct(stepUnits: number, stepPct: number = SHARE_MATH.DEFAULT_STAKE_STEP_PCT): number {
  return Math.round(stepUnits * stepPct * 100) / 100;
}

export function requireUserId(user: { id?: string | null } | null | undefined): string {
  if (!user?.id) {
    throw new HttpError(401, 'UNAUTHENTICATED', 'Authentication required');
  }
  return user.id;
}

export function requireVerifiedKyc(kycStatus: string | null | undefined): void {
  if (kycStatus !== 'verified') {
    throw new HttpError(403, 'KYC_REQUIRED', 'KYC verification required before checkout');
  }
}

export type ReserveRpcResult = {
  success?: boolean;
  reservation_id?: string;
  expires_at?: string;
  error?: string;
  message?: string;
};

export function interpretReserveResult(
  data: unknown,
  error: { message: string } | null
): { reservationId: string; expiresAt: string } {
  if (error) {
    throw new HttpError(503, 'RESERVE_RPC_ERROR', error.message);
  }
  const result = data as ReserveRpcResult | null;
  if (!result || result.success !== true || !result.reservation_id || !result.expires_at) {
    throw new HttpError(
      409,
      result?.error || 'RESERVE_FAILED',
      result?.message || result?.error || 'Share reservation failed'
    );
  }
  return { reservationId: result.reservation_id, expiresAt: result.expires_at };
}

/** Review-branch preview flag (WORKFLOW_PREVIEW=true): strips workflow blocks so the
 * founder can walk the purchase chain on coming_soon horses. Never set in prod.
 * Remove with the review branch. */
export function isWorkflowPreview(env: NodeJS.Dict<string> = process.env): boolean {
  return env.WORKFLOW_PREVIEW === 'true' || env.NEXT_PUBLIC_WORKFLOW_PREVIEW === 'true';
}

export function purchasesAreEnabled(env: NodeJS.Dict<string> = process.env): boolean {
  if (isWorkflowPreview(env)) return true;
  return Boolean(env.STRIPE_SECRET_KEY) && env.PURCHASES_ENABLED === 'true';
}

/**
 * Chunk-5 (f10, locked spec purchase-content-spec.md:215-228): server error code →
 * investor-facing copy. The server returns { error, code } and the client renders
 * exactly this copy — raw server strings (or codes) never reach the investor.
 */
export const CHECKOUT_ERROR_COPY: Record<string, string> = {
  KYC_REQUIRED: 'Identity verification is required before checkout. This is a one-time check under New Zealand law.',
  INVALID_STAKE: 'Stake must be a multiple of {step}%',
  CAMPAIGN_NOT_FOUND: 'This campaign is no longer available.',
  CHECKOUT_CLOSED: 'This offering is closed.',
  RESERVE_FAILED: 'That stake was just acquired by another co-owner. Available stake is now {max}%.',
  PURCHASES_DISABLED: 'Checkout is temporarily unavailable — please try again shortly.',
  SUPABASE_NOT_CONFIGURED: 'Checkout is temporarily unavailable — please try again shortly.',
  RESERVE_RPC_ERROR: 'Checkout is temporarily unavailable — please try again shortly.',
  STRIPE_DECLINE: 'Your payment could not be processed by your card provider. Please try a different card, or contact your bank.',
};
// Any code the map does not know must still read as safe investor copy, never a
// raw server string (audit chunk-5 WARN-b, defense-in-depth).
export const CHECKOUT_ERROR_UNKNOWN = 'Checkout is temporarily unavailable — please try again shortly.';

export function investorCheckoutError(
  code: string | undefined | null,
  _fallback: string,
  params: { step?: number; max?: number } = {}
): string {
  if (!code) return CHECKOUT_ERROR_UNKNOWN;
  const copy = CHECKOUT_ERROR_COPY[code];
  if (!copy) return CHECKOUT_ERROR_UNKNOWN;
  return copy
    .replace('{step}%', `${params.step ?? 0.5}%`)
    .replace('{max}%', `${params.max ?? ''}%`);
}

export function r2ConfigFromEnv(env: NodeJS.Dict<string> = process.env): {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
} | null {
  const accountId = env.R2_ACCOUNT_ID;
  const accessKeyId = env.R2_ACCESS_KEY_ID;
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY;
  const bucketName = env.R2_BUCKET_NAME;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) return null;
  return { accountId, accessKeyId, secretAccessKey, bucketName };
}

export const NELLIE_SLUG = 'nellie';

export function isSha256Hex(value: string): boolean {
  return /^[a-f0-9]{64}$/.test(value);
}

export function assertNellieOnly(slug: string): void {
  if (slug !== NELLIE_SLUG) {
    throw new HttpError(409, 'NOT_NELLIE', 'Only Nellie is open for checkout');
  }
}

export async function resolveLegalHashes(
  slug: string,
  stakePct = 1.0,
  execution?: { investorName?: string; executionDate?: string }
): Promise<{ pdsHash: string; saHash: string }> {
  const campaign = await getCampaignBySlug(slug);
  if (!campaign) {
    throw new HttpError(404, 'CAMPAIGN_NOT_FOUND', 'Thoroughbred campaign not found');
  }
  // Investor-SA checkout: the SA hash must match the investor's stake (the doc they
  // ticked). The PDS stays the locked 1.0% compile — identical for every investor.
  // Task 4: the execution block (name + tick date) is part of the signed bytes, so
  // the compile must carry the same execution context the investor ticked.
  const pack = getCompiledLegalPackForCampaign(campaign, stakePct, execution);
  if (!isSha256Hex(pack.pdsHash) || !isSha256Hex(pack.saHash)) {
    throw new HttpError(500, 'INVALID_LEGAL_HASH', 'Legal pack hashes must be 64-hex SHA-256');
  }
  if (pack.pdsHash.includes('placeholder') || pack.saHash.includes('placeholder')) {
    throw new HttpError(500, 'PLACEHOLDER_HASH', 'Legal pack hashes must not be placeholders');
  }
  return { pdsHash: pack.pdsHash, saHash: pack.saHash };
}

export async function resolveCampaignInventory(slug: string) {
  const campaign = await getCampaignBySlug(slug);
  if (!campaign) {
    throw new HttpError(404, 'CAMPAIGN_NOT_FOUND', 'Thoroughbred campaign not found');
  }
  const inventoryId = getInventoryId(slug);
  if (!inventoryId) {
    throw new HttpError(500, 'UNKNOWN_INVENTORY', 'Unknown inventory UUID for campaign');
  }
  return { campaign, inventoryId };
}

export async function assertCheckoutCampaign(slug: string) {
  // Review-branch preview: any slug, any status — lets the workflow walk on
  // coming_soon horses. Never set WORKFLOW_PREVIEW in prod.
  if (!isWorkflowPreview()) {
    assertNellieOnly(slug);
  }
  const resolved = await resolveCampaignInventory(slug);
  if (!isCheckoutOpen(resolved.campaign) && !isWorkflowPreview()) {
    throw new HttpError(409, 'CHECKOUT_CLOSED', 'This campaign is not open for stakes');
  }
  return resolved;
}

export function buildHoldingInsert(input: {
  userId: string;
  inventoryId: string;
  units: number;
  amountPaidNzd: number;
  monthlyKeepNzd: number;
  pdsHash: string;
  saHash: string;
  subscriptionId: string | null;
}) {
  if (!isSha256Hex(input.pdsHash) || !isSha256Hex(input.saHash)) {
    throw new HttpError(500, 'INVALID_LEGAL_HASH', 'Holding hashes must be 64-hex SHA-256');
  }
  return {
    user_id: input.userId,
    horse_id: input.inventoryId,
    stake_percentage: input.units,
    float_months_held: 5,
    float_balance_nzd: input.amountPaidNzd,
    monthly_keep_rate_nzd: input.monthlyKeepNzd,
    stripe_subscription_id: input.subscriptionId,
    status: 'active' as const,
    signed_pds_hash: input.pdsHash,
    signed_sa_hash: input.saHash,
  };
}

export type ConsumeRpcResult = {
  success?: boolean;
  consumed_count?: number;
  units?: number;
  already_consumed?: boolean;
  reservation_id?: string;
  error?: string;
  message?: string;
  status?: string;
};

export function interpretConsumeResult(
  data: unknown,
  error: { message: string } | null,
  holdingsDuplicate: boolean
): { consumedCount: number; units: number; alreadyConsumed: boolean } {
  if (error) {
    throw new HttpError(500, 'RESERVATION_CONSUME_FAILED', error.message);
  }
  const result = data as ConsumeRpcResult | null;
  if (!result) {
    throw new HttpError(500, 'RESERVATION_CONSUME_FAILED', 'consume_campaign_reservation returned empty');
  }
  if (result.already_consumed === true || result.success === true) {
    const consumedCount = Number(result.consumed_count ?? 0);
    if (consumedCount === 0 && !result.already_consumed && !holdingsDuplicate) {
      throw new HttpError(500, 'RESERVATION_MISSING', 'No active reservation to consume');
    }
    return {
      consumedCount,
      units: Number(result.units ?? 0),
      alreadyConsumed: Boolean(result.already_consumed),
    };
  }
  if (holdingsDuplicate && result.error === 'RESERVATION_NOT_FOUND') {
    return { consumedCount: 0, units: 0, alreadyConsumed: true };
  }
  throw new HttpError(
    500,
    result.error || 'RESERVATION_CONSUME_FAILED',
    result.message || result.error || 'consume_campaign_reservation returned success: false'
  );
}

export function requirePaidCheckoutSession(session: Record<string, unknown>): void {
  if (session.payment_status !== 'paid') {
    throw new HttpError(
      400,
      'PAYMENT_NOT_PAID',
      `checkout.session.completed payment_status is ${String(session.payment_status)}`
    );
  }
}

export function resolvePaidAmountNzd(amountTotalCents: unknown): number {
  if (typeof amountTotalCents === 'number' && Number.isFinite(amountTotalCents) && amountTotalCents >= 0) {
    return amountTotalCents / 100;
  }
  throw new HttpError(400, 'INVALID_AMOUNT_TOTAL', 'checkout.session.completed missing or invalid amount_total');
}

export function pricingForUnits(wholesaleMonthlyNzd: number, units: number) {
  return computeDslPricing(wholesaleMonthlyNzd, units);
}

export function isUniqueViolation(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === '23505' || Boolean(error.message?.toLowerCase().includes('duplicate'));
}
