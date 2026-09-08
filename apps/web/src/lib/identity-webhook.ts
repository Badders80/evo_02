import { createHash } from 'node:crypto';
import { getSupabaseServiceClient } from '@/lib/supabase-server';
import { HttpError } from '@/lib/nellie-loop';
import { canonicalReportJson, retrieveVerificationSession } from '@/lib/stripe-identity';

/**
 * Identity webhook handling (007 T3 chunk 2).
 *
 * Event → profile mapping:
 *  - identity.verification_session.verified  → gates (NZ residency + 18+) pass →
 *      kyc_status='verified', kyc_verified_at=now, kyc_audit_digest=SHA-256 of
 *      canonical report JSON. Gate reject → kyc_status='rejected'.
 *  - identity.verification_session.canceled  → kyc_status='unverified' (retryable —
 *      the investor abandoned the flow; not a rejection).
 *  - identity.verification_session.requires_input → stays/becomes 'pending'
 *      (investor must finish the hosted session; manual assist is a P007 J3 flow).
 */

const IDENTITY_EVENTS = new Set([
  'identity.verification_session.verified',
  'identity.verification_session.canceled',
  'identity.verification_session.requires_input',
]);

export function isIdentityEvent(eventType: string): boolean {
  return IDENTITY_EVENTS.has(eventType);
}

/**
 * Gate the verified report: NZ residency + 18+ from the Identity report's
 * document check. Returns the reject reason, or null when passed.
 *
 * Stripe shapes (per API reference):
 *  - report.last_verification_report.document.dob = { day, month, year }
 *  - report.last_verification_report.document.issuing_country = ISO alpha-2
 *    (defensively accept alpha-3 "NZL" too)
 */
export function evaluateIdentityGates(report: Record<string, unknown> | null): string | null {
  if (!report) {
    return 'MISSING_REPORT';
  }

  const document = (report.document ?? {}) as Record<string, unknown>;
  const dobRaw = document.dob ?? null;

  // Accept both Stripe shapes: {day,month,year} object or pre-joined string.
  let dobIso: string | null = null;
  if (dobRaw && typeof dobRaw === 'object') {
    const { day, month, year } = dobRaw as { day?: number; month?: number; year?: number };
    if (day && month && year) {
      dobIso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  } else if (typeof dobRaw === 'string') {
    dobIso = dobRaw;
  }
  if (!dobIso) {
    return 'MISSING_DOB';
  }
  const birth = new Date(dobIso);
  if (Number.isNaN(birth.getTime())) {
    return 'INVALID_DOB';
  }
  // Calendar-accurate age: compare year/month/day directly (no 365.25 drift,
  // no timezone edge on an 18th birthday).
  const now = new Date();
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const m = now.getUTCMonth() - birth.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < birth.getUTCDate())) {
    age -= 1;
  }
  if (age < 18) {
    return 'UNDER_18';
  }

  const country = (document.issuing_country ?? null) as string | null;
  if (country !== 'NZ' && country !== 'NZL') {
    return 'NON_NZ_RESIDENCY';
  }

  return null;
}

/** SHA-256 over canonical report JSON — lowercase 64-hex per chk_kyc_audit_digest_sha256. */
export function computeAuditDigest(session: Record<string, unknown>): string {
  return createHash('sha256').update(canonicalReportJson(session)).digest('hex');
}

export async function handleIdentityEvent(
  eventType: string,
  session: Record<string, unknown>
): Promise<void> {
  const admin = getSupabaseServiceClient();
  const sessionId = String(session.id ?? '');
  const metadata = (session.metadata as Record<string, string> | undefined) ?? {};
  const userId = metadata.user_id;

  if (!sessionId || !userId) {
    throw new HttpError(400, 'INVALID_IDENTITY_EVENT', 'Identity event missing session id or user_id metadata');
  }

  if (eventType === 'identity.verification_session.verified') {
    // Fetch full session WITH the last verification report expanded.
    const full = await retrieveVerificationSession(sessionId);
    const lastReport = (full.last_verification_report ?? null) as Record<string, unknown> | null;
    const rejectReason = evaluateIdentityGates(lastReport);

    // Rejection clears any stale digest so a previously-verified row can't
    // keep a digest that no longer corresponds to a verified state.
    const patch: Record<string, unknown> = rejectReason
      ? { kyc_status: 'rejected', kyc_verified_at: null, kyc_audit_digest: null }
      : { kyc_status: 'verified', kyc_verified_at: new Date().toISOString() };

    if (!rejectReason && lastReport) {
      patch.kyc_audit_digest = computeAuditDigest({ verification_report: lastReport });
    }
    patch.stripe_verification_session_id = sessionId;

    const { error } = await admin.from('profiles').update(patch).eq('id', userId);
    if (error) {
      throw new HttpError(500, 'KYC_PROFILE_UPDATE_FAILED', error.message);
    }
    return;
  }

  if (eventType === 'identity.verification_session.canceled') {
    const { error } = await admin
      .from('profiles')
      .update({ kyc_status: 'unverified', kyc_verified_at: null })
      .eq('id', userId);
    if (error) {
      throw new HttpError(500, 'KYC_PROFILE_UPDATE_FAILED', error.message);
    }
    return;
  }

  // requires_input: investor hasn't finished — keep pending (idempotent, no write needed).
}
