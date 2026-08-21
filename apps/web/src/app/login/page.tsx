'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';
import { Mail, Lock, Sparkles, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
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
          emailRedirectTo: `${window.location.origin}/auth/callback`,
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
        window.location.href = '/mystable';
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header Branding */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d4a964]/40 bg-[#d4a964]/10 px-3.5 py-1 text-xs font-mono tracking-[0.2em] uppercase text-[#d4a964]">
            <Sparkles className="h-3 w-3" />
            <span>Evolution Investor Portal</span>
          </div>

          <h1 className="mt-6 text-3xl font-light tracking-tight text-foreground sm:text-4xl">
            Sign In to <span className="font-serif italic text-[#d4a964]">MyStables</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Access your syndicated holdings, race updates, and legal contracts.
          </p>
        </div>

        {/* Card Container */}
        <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-8 shadow-2xl">
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
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-900/60 bg-red-950/40 p-4 text-xs text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {magicLinkSent ? (
            /* Magic Link Sent View */
            <div className="text-center py-6 space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#d4a964]/40 bg-[#d4a964]/10 text-[#d4a964]">
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
                  className="text-xs text-[#d4a964] hover:underline"
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
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-[#d4a964] focus:outline-none focus:ring-1 focus:ring-[#d4a964]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#d4a964] py-3 text-sm font-semibold tracking-wide text-[#0a0a0a] transition-all hover:bg-[#c39853] disabled:opacity-50"
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
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-[#d4a964] focus:outline-none focus:ring-1 focus:ring-[#d4a964]"
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
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-[#d4a964] focus:outline-none focus:ring-1 focus:ring-[#d4a964]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#d4a964] py-3 text-sm font-semibold tracking-wide text-[#0a0a0a] transition-all hover:bg-[#c39853] disabled:opacity-50"
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
          <Link href="/#marketplace" className="text-[#d4a964] hover:underline">
            Explore Available Horses
          </Link>
        </div>
      </div>
    </div>
  );
}
