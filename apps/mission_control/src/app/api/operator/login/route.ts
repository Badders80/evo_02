import { NextResponse } from 'next/server';
import { isValidOperatorToken, operatorCookieFor } from '@/lib/operator-auth';

/**
 * Operator sign-in: POST {token}. On success sets an httpOnly operator cookie
 * (sha256 of the API token — the raw token never lives in the cookie jar).
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const token = (body as { token?: unknown } | null)?.token;
  if (!isValidOperatorToken(token)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const cookie = operatorCookieFor(token as string);
  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set(cookie.name, cookie.value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8, // 8h operator session
  });
  return res;
}
