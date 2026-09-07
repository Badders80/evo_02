'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * HorseCtaModal — placeholder "Find out more about {horse}" popup (founder-locked
 * 2026-09-07). Coming-soon marketplace cards open this instead of navigating.
 * When the purchase workflows land, this component is the wiring point: the modal
 * host stays, the lead-capture body swaps for the real flow.
 *
 * Copy law: Lane 1 statements only (VOICE.md §3) — describe, never push.
 * Lead capture posts to /api/subscribe (accepts horse_slug / horse_name).
 */

export type HorseCtaModalProps = {
  horseName: string;
  horseSlug: string;
  onClose: () => void;
};

export function HorseCtaModal({ horseName, horseSlug, onClose }: HorseCtaModalProps) {
  const titleId = useId();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, horse_slug: horseSlug, horse_name: horseName, source: 'horse_cta_modal' }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Registration failed' }));
        throw new Error(errData.error || 'Registration failed');
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="horse-cta-modal pointer-events-none fixed inset-0 z-[9990]" role="presentation">
      <div className="absolute inset-0 z-0 bg-canvas/80 backdrop-blur-[4px] animate-fade-in" aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-0 z-10 flex items-center justify-center p-4"
      >
        <div className="pointer-events-auto relative w-full max-w-[640px] text-center animate-fade-in">
          <div className="relative rounded-xl border border-border bg-canvas px-8 py-10 shadow-[0_0_120px_rgba(0,0,0,0.98)] md:px-12 md:py-12">
            <button
              type="button"
              onClick={onClose}
              aria-label="Dismiss"
              className="absolute top-4 right-4 z-10 flex h-8 w-8 cursor-pointer items-center justify-center text-2xl leading-none text-muted-foreground transition-colors hover:text-foreground"
            >
              ×
            </button>

            {sent ? (
              <>
                <h4 id={titleId} className="text-[19px] font-light leading-tight text-white md:text-[21px]">
                  You hold the share. You stand in the photo.
                </h4>
                <p className="mt-4 text-sm font-light text-muted-foreground">
                  Registered for {horseName}. First access to new campaigns and
                  behind-the-scenes coverage from the yard.
                </p>
              </>
            ) : (
              <>
                <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-accent">
                  Coming Soon
                </p>
                <h4
                  id={titleId}
                  className="mt-3 text-[22px] font-light leading-tight text-white md:text-[24px]"
                >
                  Find out more about {horseName}.
                </h4>
                <p className="mx-auto mt-4 max-w-lg text-sm font-light leading-relaxed text-muted-foreground">
                  Early access to new campaigns and behind-the-scenes coverage from the yard.
                </p>
                {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
                <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-md">
                  <div className="relative flex w-full flex-col items-stretch gap-2 transition-all duration-500 focus-within:border-white/40 focus-within:shadow-[0_0_20px_rgba(255,255,255,0.1)] md:flex-row md:items-center md:gap-0 md:overflow-hidden md:rounded-full md:border md:border-border md:bg-surface-base/80 md:p-1.5">
                    <input
                      ref={inputRef}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className="relative z-10 w-full rounded-full border border-border bg-surface-base/80 py-3 pl-6 pr-6 text-sm font-light text-white placeholder:text-muted-foreground focus:outline-none md:flex-1 md:border-0 md:bg-transparent md:pr-6"
                      aria-label="Email address"
                      disabled={isSubmitting}
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="relative static w-full cursor-pointer overflow-hidden rounded-full border border-border bg-surface-base px-6 py-2.5 text-[11px] font-light uppercase tracking-wider text-white backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:border-white/40 disabled:cursor-not-allowed md:absolute md:right-1.5 md:top-1/2 md:z-20 md:w-auto md:-translate-y-1/2"
                    >
                      {isSubmitting ? 'Registering...' : 'Register'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
