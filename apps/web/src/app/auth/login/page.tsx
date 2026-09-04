'use client';

/**
 * /auth/login — prod-parity sign-in (pass-3 founder spec).
 *
 * Replicates evolutionstables.nz/auth/login: full-page near-black canvas,
 * centered dark card with the brand logo mark, letterspaced SIGN IN heading,
 * Google pill (existing app-mediated OAuth), 'or' divider, email/password
 * form (existing Supabase auth calls — no new backend), Forgot password and
 * Sign up links.
 *
 * The old /login route redirects here (login/page.tsx), so legacy links and
 * the middleware's /login redirect keep working.
 */

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';
import { safeNextPath } from '@/lib/safe-next-path';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

/** ?error= codes returned by /auth/callback and /api/auth/google[/callback]. */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  auth_callback_failed: 'Sign-in could not be completed. Please try again.',
  google_not_configured: 'Google sign-in is not available right now — use password below.',
  google_denied: 'Google sign-in was cancelled.',
  google_callback_invalid: 'Google sign-in could not be verified. Please try again.',
  google_csrf: 'Sign-in session expired. Please try again.',
  google_token_exchange: 'Google sign-in failed. Please try again.',
  google_signin_failed: 'Google sign-in could not create your session. Please try again.',
};

export default function AuthLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
      <AuthLoginForm />
    </Suspense>
  );
}

function AuthLoginForm() {
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get('next'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    () => AUTH_ERROR_MESSAGES[searchParams.get('error') ?? ''] ?? null,
  );

  const supabase = getSupabaseBrowserClient();

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        window.location.href = nextPath;
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    setLoading(true);
    setErrorMsg(null);
    // App-mediated OAuth: /api/auth/google plants CSRF/nonce cookies and
    // redirects to Google from OUR client, so the consent screen shows
    // evolutionstables.nz — never *.supabase.co. The callback route mints
    // the Supabase session via signInWithIdToken.
    window.location.href = `/api/auth/google?next=${encodeURIComponent(nextPath)}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-3xl border border-border bg-surface-base/80 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.6)] backdrop-blur-md sm:p-10">
          {/* Logo mark — top center (prod parity) */}
          <div className="flex justify-center">
            <img
              src="/brand/logos/lockups/lockup-horizontal-gold.svg"
              alt="Evolution Stables"
              className="h-11 w-auto object-contain"
            />
          </div>

          <h1 className="mb-8 mt-8 text-center text-[14px] font-light uppercase tracking-[0.2em] text-heading">
            Sign In
          </h1>

          {/* Google pill — prod style */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-border bg-background py-3.5 text-[12px] font-medium uppercase tracking-[0.15em] text-foreground transition-all hover:border-accent/50 hover:text-heading disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.57 5.57 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z" />
              <path fill="#FBBC05" d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a11.99 11.99 0 0 0 0 10.76l3.98-3.09z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* 'or' divider */}
          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Error alert */}
          {errorMsg && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-xs text-destructive-foreground">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Password form */}
          <form onSubmit={handlePasswordAuth} className="space-y-5">
            <div>
              <label htmlFor="auth-email" className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <label htmlFor="auth-password" className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Password
                </label>
                {/* Forgot password — muted, prod casing */}
                <a
                  href={`/api/auth/forgot-password?next=${encodeURIComponent(nextPath)}`}
                  className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  onClick={(e) => e.preventDefault()}
                  title="Password reset — contact support while money is closed"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="auth-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-foreground/30 bg-foreground/[0.02] py-3.5 text-[12px] font-semibold uppercase tracking-[0.15em] text-foreground transition-all hover:border-accent hover:bg-accent hover:text-canvas disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Please wait...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Sign up toggle — accent link (prod casing: "Need an account? Sign up") */}
          <div className="mt-7 text-center">
            <Link
              href="/marketplace"
              className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              Need an account? Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
