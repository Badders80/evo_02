import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase-server';
import { safeNextPath } from '@/lib/safe-next-path';
import {
  GOOGLE_CSRF_COOKIE,
  GOOGLE_NONCE_COOKIE,
  GOOGLE_TOKEN_URL,
  getGoogleOAuthConfig,
  parseOAuthState,
  resolveRedirectUri,
  safeEqual,
} from '@/lib/google-oauth';

interface GoogleTokenResponse {
  id_token?: string;
  error?: string;
  error_description?: string;
}

/**
 * Step 2 of app-mediated Google sign-in: Google redirects here with ?code.
 * We validate CSRF state against the httpOnly cookie, exchange the code at
 * the token endpoint (presenting the SAME redirect_uri used at authorize),
 * then hand the id_token to Supabase via signInWithIdToken — GoTrue mints the
 * app session without Google ever visiting *.supabase.co. Nonce check uses
 * the sha256(raw-cookie) we planted at /api/auth/google.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const debug = url.searchParams.get('debug') === '1';
  let next = safeNextPath(url.searchParams.get('next'));

  const fail = (code: string) =>
    NextResponse.redirect(`${origin}/login?error=${code}${debug ? '&debug=1' : ''}`);

  const config = getGoogleOAuthConfig();
  if (!config) return fail('google_not_configured');

  const providerError = url.searchParams.get('error');
  if (providerError) return fail('google_denied');

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieStore = await cookies();
  const csrfCookie = cookieStore.get(GOOGLE_CSRF_COOKIE)?.value;
  const nonceCookie = cookieStore.get(GOOGLE_NONCE_COOKIE)?.value;

  if (!code || !state || !csrfCookie || !nonceCookie) return fail('google_callback_invalid');

  // Validate the CSRF hash prefix against the httpOnly cookie, then recover
  // the destination from the state suffix.
  const { csrfHash: stateHash, next: stateNext } = parseOAuthState(state);
  const expectedState = createHash('sha256').update(csrfCookie).digest('hex');
  if (!safeEqual(stateHash, expectedState)) return fail('google_csrf');
  if (stateNext !== null) next = safeNextPath(stateNext);

  // Token exchange. redirect_uri MUST byte-match the authorize request.
  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: resolveRedirectUri(config, origin),
      grant_type: 'authorization_code',
    }),
  });

  const tokens = (await tokenRes.json()) as GoogleTokenResponse;
  if (!tokenRes.ok || !tokens.id_token) {
    if (debug) {
      return NextResponse.json({
        stage: 'token_exchange',
        status: tokenRes.status,
        error: tokens.error ?? 'no id_token',
        description: tokens.error_description ?? null,
      });
    }
    return fail('google_token_exchange');
  }

  // Session mint: cookie-scoped server client, so session cookies land on
  // THIS origin for middleware/server components to read.
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: tokens.id_token,
    nonce: nonceCookie,
  });

  if (error || !data?.session) {
    if (debug) {
      return NextResponse.json({ stage: 'sign_in_with_id_token', error: error?.message ?? 'no session' });
    }
    return fail('google_signin_failed');
  }

  const response = NextResponse.redirect(`${origin}${next}`);
  response.cookies.delete(GOOGLE_CSRF_COOKIE);
  response.cookies.delete(GOOGLE_NONCE_COOKIE);
  return response;
}
