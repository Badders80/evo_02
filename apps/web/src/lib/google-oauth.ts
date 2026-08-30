/**
 * App-mediated Google OAuth ("consent says evolutionstables.nz, not *.supabase.co").
 *
 * Flow: /api/auth/google (authorize) -> Google consent on our domain's client
 * -> registered redirect URI -> /api/auth/google/callback (token exchange +
 * supabase.auth.signInWithIdToken). Supabase GoTrue remains the identity
 * store (ADR-002); Google never talks to GoTrue directly, so the consent
 * screen shows OUR origin instead of coqtijrftaklcwgbnqef.supabase.co.
 *
 * Env (apps/web/.env.local, gitignored):
 *   GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET  — OAuth client creds
 *   GOOGLE_OAUTH_REDIRECT_URI (optional) — absolute override. Local dev MUST
 *   set it to the URI registered on the inherited client
 *   (http://localhost:3000/api/auth/callback/google, reachable via
 *   scripts/google-callback-shim.mjs). When unset, the callback URI is
 *   derived from the request origin (prod behaviour).
 */

import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';

export const GOOGLE_CSRF_COOKIE = 'evo_g_csrf';
export const GOOGLE_NONCE_COOKIE = 'evo_g_nonce';

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  /** Absolute redirect-URI override; empty string = derive from request origin. */
  redirectUriOverride: string;
}

export function getGoogleOAuthConfig(): GoogleOAuthConfig | null {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return {
    clientId,
    clientSecret,
    redirectUriOverride: process.env.GOOGLE_OAUTH_REDIRECT_URI ?? '',
  };
}

export function resolveRedirectUri(config: GoogleOAuthConfig, origin: string): string {
  return config.redirectUriOverride || `${origin}/api/auth/google/callback`;
}

export function newNoncePair(): { raw: string; hashed: string } {
  const raw = randomUUID();
  return { raw, hashed: createHash('sha256').update(raw).digest('hex') };
}

/** Constant-time string compare; false on length/type mismatch. */
export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

/**
 * OAuth `state` = "<csrfHash>.<next>". Google echoes state byte-exact; the
 * hash prefix is the CSRF proof (vs the httpOnly cookie), the suffix is the
 * post-login destination (re-sanitized via safeNextPath on read).
 */
export function buildOAuthState(csrfHash: string, nextPath: string): string {
  return `${csrfHash}.${nextPath}`;
}

export function parseOAuthState(state: string): { csrfHash: string; next: string | null } {
  const dot = state.indexOf('.');
  if (dot === -1) return { csrfHash: state, next: null };
  return { csrfHash: state.slice(0, dot), next: state.slice(dot + 1) };
}
