/**
 * Stripe Identity service — thin REST wrapper over Verification Sessions.
 * Matches the hand-rolled fetch pattern used by checkout (no Stripe SDK).
 *
 * Session lifecycle:
 *  - createVerificationSession(): POST /v1/identity/verification_sessions
 *  - retrieveVerificationSession(): GET /v1/identity/verification_sessions/:id
 *    (includes the verification report needed for the digest + gates)
 */

const STRIPE_API = 'https://api.stripe.com/v1';

function stripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return key;
}

/** Form-encoded POST helper matching Stripe's API contract. */
async function stripePostForm(path: string, params: URLSearchParams): Promise<Record<string, unknown>> {
  const res = await fetch(`${STRIPE_API}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeSecretKey()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  const json = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    const err = json.error as { message?: string } | undefined;
    throw new Error(err?.message || `Stripe ${path} failed with ${res.status}`);
  }
  return json;
}

export interface IdentitySession {
  id: string;
  url: string | null;
  status: string;
}

/**
 * Creates a document-check Identity session bound to the investor.
 * `returnUrl` is where Stripe sends the investor after the hosted flow.
 */
export async function createVerificationSession(userId: string, returnUrl: string): Promise<IdentitySession> {
  const params = new URLSearchParams();
  params.append('type', 'document');
  params.append('metadata[user_id]', userId);
  params.append('return_url', returnUrl);

  const session = await stripePostForm('/identity/verification_sessions', params);
  return {
    id: String(session.id),
    url: (session.url as string | null) ?? null,
    status: String(session.status ?? 'created'),
  };
}

/**
 * Retrieves a session WITH its last verification report expanded — required for
 * the audit digest and the residency/age gates. (Stripe's expandable field is
 * `last_verification_report`; `verification_report` is not expandable.)
 */
export async function retrieveVerificationSession(sessionId: string): Promise<Record<string, unknown>> {
  const res = await fetch(
    `${STRIPE_API}/identity/verification_sessions/${encodeURIComponent(sessionId)}?expand[]=last_verification_report`,
    { headers: { Authorization: `Bearer ${stripeSecretKey()}` } }
  );
  const json = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    const err = json.error as { message?: string } | undefined;
    throw new Error(err?.message || `Stripe retrieve failed with ${res.status}`);
  }
  return json;
}

/**
 * Canonical report JSON for the audit digest: recursively sorted keys,
 * no whitespace — deterministic SHA-256 input (lowercase 64-hex required
 * by chk_kyc_audit_digest_sha256).
 */
export function canonicalReportJson(session: Record<string, unknown>): string {
  const report = session.verification_report;
  return canonicalize(report);
}

/** Recursively serializes objects with sorted keys; arrays keep order. */
function canonicalize(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalize(item)).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([k, v]) => `${JSON.stringify(k)}:${canonicalize(v)}`);
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}
