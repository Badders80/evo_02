'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mail, X, ArrowRight, Sparkles } from 'lucide-react';
import { getSupabaseBrowserClient } from '../lib/supabase-client';

const STORAGE_KEY = 'evo_landing_cta_dismissed';
const SESSION_DELAY_MS = 3500;

export function LandingCtaPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const alreadyDismissed =
      typeof window !== 'undefined' && window.sessionStorage.getItem(STORAGE_KEY) === 'true';
    if (alreadyDismissed) return;

    const timer = setTimeout(() => {
      setOpen(true);
    }, SESSION_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setOpen(false);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(STORAGE_KEY, 'true');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
          data: { source: 'landing_cta_popup' },
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSent(true);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        onClick={handleClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        aria-label="Close"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0a0a0a]/95 p-6 shadow-[0_0_120px_rgba(0,0,0,0.98)] sm:p-8">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-accent hover:text-accent"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3.5 py-1 text-xs font-mono tracking-[0.2em] uppercase text-accent">
          <Sparkles className="h-3 w-3" />
          <span>Register</span>
        </div>

        <h2 className="text-2xl font-light tracking-tight text-foreground sm:text-3xl">
          A share of New Zealand thoroughbred racing.
        </h2>

        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          First access to new campaigns, race updates, and the verified contracts behind every Evolution Stables syndicate.
        </p>

        {sent ? (
          <div className="mt-6 rounded-xl border border-accent/20 bg-accent/5 p-6 text-center">
            <p className="text-sm font-medium text-accent">Check your inbox</p>
            <p className="mt-2 text-xs text-muted-foreground">
              A secure login link was sent to <span className="text-foreground font-mono">{email}</span>. Click it once to create your account or sign in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="investor@domain.co.nz"
                className="w-full rounded-lg border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-destructive">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-accent py-3 text-sm font-semibold tracking-wide text-canvas transition-all hover:bg-accent-hover disabled:opacity-50"
            >
              {submitting ? (
                <span>Creating secure link...</span>
              ) : (
                <>
                  <span>Create Your Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-5 text-center">
          <Link
            href="/#marketplace"
            onClick={handleClose}
            className="text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-accent hover:underline"
          >
            Explore the marketplace first
          </Link>
        </div>

        <p className="mt-6 text-[10px] text-muted-foreground/60 text-center leading-relaxed">
          By joining, you agree to receive campaign updates. NZTR regulated. No spam — only thoroughbred participation opportunities.
        </p>
      </div>
    </div>
  );
}
