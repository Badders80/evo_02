import { createHmac, timingSafeEqual } from 'node:crypto';

const DEFAULT_TOLERANCE_SEC = 300;

/**
 * Verifies a Stripe-style `t=...,v1=...` HMAC header against the raw request body.
 */
export function verifyStripeSignature(
  payload: string,
  header: string,
  secret: string,
  toleranceSec = DEFAULT_TOLERANCE_SEC
): boolean {
  const items = header.split(',').map((part) => part.trim());
  const timestamp = items.find((part) => part.startsWith('t='))?.slice(2);
  const signatures = items.filter((part) => part.startsWith('v1=')).map((part) => part.slice(3));
  if (!timestamp || signatures.length === 0) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  if (Math.abs(Date.now() / 1000 - ts) > toleranceSec) return false;

  const expectedHex = createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex');
  const expected = Buffer.from(expectedHex, 'hex');

  return signatures.some((sig) => {
    try {
      const actual = Buffer.from(sig, 'hex');
      return actual.length === expected.length && timingSafeEqual(actual, expected);
    } catch {
      return false;
    }
  });
}

export function signStripePayload(payload: string, secret: string, timestamp = Math.floor(Date.now() / 1000)): string {
  const v1 = createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex');
  return `t=${timestamp},v1=${v1}`;
}
