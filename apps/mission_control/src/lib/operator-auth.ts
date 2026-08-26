import { cookies } from 'next/headers';
import { createHash, timingSafeEqual } from 'node:crypto';

export const OPERATOR_COOKIE = 'mc_op';

/**
 * Operator session token derived from OPERATOR_API_TOKEN (never stored or sent raw).
 * Fail-closed: no env token configured => never authorized.
 */
function expectedCookieValue(): string | null {
  const token = process.env.OPERATOR_API_TOKEN;
  if (!token || token.trim() === '') return null;
  return createHash('sha256').update(token).digest('hex');
}

/** Timing-safe comparison of two hex digests of equal length. */
function digestEquals(a: string, b: string): boolean {
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function isOperator(): Promise<boolean> {
  const expected = expectedCookieValue();
  if (!expected) return false;
  const store = await cookies();
  const value = store.get(OPERATOR_COOKIE)?.value;
  if (!value) return false;
  return digestEquals(value, expected);
}

export function operatorCookieFor(token: string): { name: string; value: string } {
  return { name: OPERATOR_COOKIE, value: createHash('sha256').update(token).digest('hex') };
}

export function isValidOperatorToken(token: unknown): boolean {
  const expected = process.env.OPERATOR_API_TOKEN;
  if (typeof token !== 'string' || !expected || expected.trim() === '') return false;
  return digestEquals(
    createHash('sha256').update(token).digest('hex'),
    createHash('sha256').update(expected).digest('hex')
  );
}
