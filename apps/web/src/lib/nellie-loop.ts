import { computeDslPricing } from '@evo/legal_engine';
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

export function purchasesAreEnabled(env: NodeJS.Dict<string> = process.env): boolean {
  return Boolean(env.STRIPE_SECRET_KEY) && env.PURCHASES_ENABLED === 'true';
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

export function resolveLegalHashes(slug: string): { pdsHash: string; saHash: string } {
  const campaign = getCampaignBySlug(slug);
  if (!campaign) {
    throw new HttpError(404, 'CAMPAIGN_NOT_FOUND', 'Thoroughbred campaign not found');
  }
  const pack = getCompiledLegalPackForCampaign(campaign);
  if (!isSha256Hex(pack.pdsHash) || !isSha256Hex(pack.saHash)) {
    throw new HttpError(500, 'INVALID_LEGAL_HASH', 'Legal pack hashes must be 64-hex SHA-256');
  }
  if (pack.pdsHash.includes('placeholder') || pack.saHash.includes('placeholder')) {
    throw new HttpError(500, 'PLACEHOLDER_HASH', 'Legal pack hashes must not be placeholders');
  }
  return { pdsHash: pack.pdsHash, saHash: pack.saHash };
}

export function resolveCampaignInventory(slug: string) {
  const campaign = getCampaignBySlug(slug);
  if (!campaign) {
    throw new HttpError(404, 'CAMPAIGN_NOT_FOUND', 'Thoroughbred campaign not found');
  }
  const inventoryId = getInventoryId(slug);
  if (!inventoryId) {
    throw new HttpError(500, 'UNKNOWN_INVENTORY', 'Unknown inventory UUID for campaign');
  }
  return { campaign, inventoryId };
}

export function assertCheckoutCampaign(slug: string) {
  assertNellieOnly(slug);
  const resolved = resolveCampaignInventory(slug);
  if (!isCheckoutOpen(resolved.campaign)) {
    throw new HttpError(409, 'CHECKOUT_CLOSED', 'This campaign is visible but not open for subscription');
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
