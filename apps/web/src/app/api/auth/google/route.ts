import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  GOOGLE_AUTH_URL,
  GOOGLE_CSRF_COOKIE,
  GOOGLE_NONCE_COOKIE,
  buildOAuthState,
  getGoogleOAuthConfig,
  newNoncePair,
  resolveRedirectUri,
} from '@/lib/google-oauth';

/**
 * Step 1 of app-mediated Google sign-in: build the Google authorize URL with a
 * hashed nonce and CSRF state, plant the raw values in httpOnly cookies, and
 * redirect. Consent screen shows OUR client/origin, never *.supabase.co.
 * GoTrue is not involved until the callback's signInWithIdToken.
 */
export async function GET(request: Request) {
  const config = getGoogleOAuthConfig();
  const origin = new URL(request.url).origin;
  if (!config) {
    return NextResponse.redirect(`${origin}/login?error=google_not_configured`);
  }

  const { searchParams } = new URL(request.url);
  const next = safeNext(searchParams.get('next'));

  const { raw: csrf, hashed: csrfHash } = newNoncePair();
  const { raw: nonce, hashed: nonceHash } = newNoncePair();

  const redirectUri = resolveRedirectUri(config, origin);
  const state = buildOAuthState(csrfHash, next);
  const authUrl = new URL(GOOGLE_AUTH_URL);
  authUrl.searchParams.set('client_id', config.clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('nonce', nonceHash);
  authUrl.searchParams.set('access_type', 'online');
  authUrl.searchParams.set('prompt', 'select_account');

  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 600,
  };
  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set(GOOGLE_CSRF_COOKIE, csrf, cookieOptions);
  response.cookies.set(GOOGLE_NONCE_COOKIE, nonce, cookieOptions);
  return response;
}

/** Relative in-app path only; mirrors safeNextPath without the /mystable default. */
function safeNext(raw: string | null): string {
  if (!raw) return '/mystable';
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/mystable';
  if (raw.includes('\\') || raw.includes('://')) return '/mystable';
  return raw;
}
