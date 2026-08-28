import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { safeNextPath } from '@/lib/safe-next-path';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeNextPath(searchParams.get('next'));
  const debug = searchParams.get('debug') === '1';

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  // Supabase GoTrue lives on a different origin (127.0.0.1:54321), but the
  // exchange here runs through the app's own server client, so the session
  // cookies land scoped to THIS origin — exactly what middleware and server
  // components read. No cookies on the Supabase origin are needed.
  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data?.session) {
    if (debug) {
      return NextResponse.json({ stage: 'exchange', error: error?.message ?? 'no session' });
    }
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
