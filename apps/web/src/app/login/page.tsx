'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';
import { safeNextPath } from '@/lib/safe-next-path';
import { Mail, Lock, Sparkles, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh]" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get('next'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'magic-link' | 'password'>('magic-link');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = getSupabaseBrowserClient();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setMagicLinkSent(true);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

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

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      });
      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
      }
      // On success the browser navigates away to Google; no further handling.
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header Branding */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3.5 py-1 text-xs font-mono tracking-[0.2em] uppercase text-accent">
            <Sparkles className="h-3 w-3" />
            <span>Evolution Investor Portal</span>
          </div>

          <h1 className="mt-6 text-3xl font-light tracking-tight text-foreground sm:text-4xl">
            Sign In to <span className="font-serif italic text-accent">MyStable</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Access your syndicated holdings, race updates, and legal contracts.
          </p>
        </div>

        {/* Card Container */}
        <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-8 shadow-2xl">
          {/* Google SSO */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="mb-6 flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-background py-3 text-sm font-medium text-foreground transition-all hover:border-accent/50 hover:bg-card disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.57 5.57 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z" />
              <path fill="#FBBC05" d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a11.99 11.99 0 0 0 0 10.76l3.98-3.09z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-lg border border-border bg-background p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('magic-link');
                setErrorMsg(null);
                setMagicLinkSent(false);
              }}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${
                mode === 'magic-link'
                  ? 'bg-muted text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Magic Link (Fast)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('password');
                setErrorMsg(null);
                setMagicLinkSent(false);
              }}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${
                mode === 'password'
                  ? 'bg-muted text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Password
            </button>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-xs text-destructive-foreground">
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {magicLinkSent ? (
            /* Magic Link Sent View */
            <div className="text-center py-6 space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-foreground">Check your inbox</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We sent a secure login link to <span className="font-mono text-foreground">{email}</span>. Click the link in your email to instantly sign in.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setMagicLinkSent(false)}
                  className="text-xs text-accent hover:underline"
                >
                  Use a different email address
                </button>
              </div>
            </div>
          ) : mode === 'magic-link' ? (
            /* Magic Link Form */
            <form onSubmit={handleMagicLink} className="space-y-5">
              <div>
                <label htmlFor="email-magic" className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email-magic"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="investor@domain.co.nz"
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-accent py-3 text-sm font-semibold tracking-wide text-canvas transition-all hover:bg-accent-hover disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending Secure Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Magic Login Link</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Password Form */
            <form onSubmit={handlePasswordAuth} className="space-y-5">
              <div>
                <label htmlFor="email-pwd" className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email-pwd"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="investor@domain.co.nz"
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password-field" className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password-field"
                    type="password"
                    required
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
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-accent py-3 text-sm font-semibold tracking-wide text-canvas transition-all hover:bg-accent-hover disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer Note */}
        <div className="text-center text-xs text-muted-foreground">
          <span>Need help or new to Evolution? </span>
          <Link href="/#marketplace" className="text-accent hover:underline">
            Explore Available Horses
          </Link>
        </div>
      </div>
    </div>
  );
}
