'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const CTA_COPY =
  'Unlock the thrill of ownership with early access and behind-the-scenes coverage - it is easier than you think.';

/** Organic visits only — campaign links open instantly. */
const CTA_OPEN_DELAY_MS = 4500;

const CAMPAIGN_STORAGE_KEY = 'es_cta_campaign';
const SOURCE_STORAGE_KEY = 'es_cta_source';

function sanitizeKey(v: string) {
  return v
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .slice(0, 64);
}

/**
 * Capture post/campaign keys from URL so LinkedIn (etc.) landings tag the sheet.
 * `fromLink` is true only when this page load has query params (click-through).
 */
function captureAttributionFromUrl() {
  if (typeof window === 'undefined') {
    return { campaignKey: '', source: '', fromLink: false };
  }

  const params = new URLSearchParams(window.location.search);
  const urlCampaign = sanitizeKey(
    params.get('campaign') ||
      params.get('campaign_key') ||
      params.get('utm_campaign') ||
      params.get('source') ||
      params.get('utm_source') ||
      ''
  );

  const urlSource = sanitizeKey(
    params.get('source') || params.get('utm_source') || urlCampaign || ''
  );

  const fromLink = Boolean(urlCampaign || urlSource);

  if (urlCampaign) sessionStorage.setItem(CAMPAIGN_STORAGE_KEY, urlCampaign);
  if (urlSource) sessionStorage.setItem(SOURCE_STORAGE_KEY, urlSource);

  return {
    campaignKey: urlCampaign || sessionStorage.getItem(CAMPAIGN_STORAGE_KEY) || '',
    source: urlSource || sessionStorage.getItem(SOURCE_STORAGE_KEY) || '',
    fromLink,
  };
}

type CtaLeadModalProps = {
  /** Server-detected campaign query (?source=linkedin) — open CTA on first paint. */
  forceInstant?: boolean;
};

/**
 * Standalone viewport-centered lead capture modal.
 * Campaign links: CTA present immediately (click → CTA is there).
 * Organic: delayed so the page can land first.
 *
 * How to create tracked links (LinkedIn etc.): see docs/CTA_CAMPAIGN_LINKS.md
 * Example: https://www.evolutionstables.nz/?source=linkedin
 */
export function CtaLeadModal({ forceInstant = false }: CtaLeadModalProps) {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const attributionRef = useRef({ campaignKey: '', source: '' });

  // Campaign click-through: start open so SSR/first paint already has the CTA.
  const [open, setOpen] = useState(forceInstant);
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialMountedRef = useRef(false);
  useEffect(() => {
    if (initialMountedRef.current) return;
    initialMountedRef.current = true;
    setMounted(true);
    const attribution = captureAttributionFromUrl();
    attributionRef.current = {
      campaignKey: attribution.campaignKey,
      source: attribution.source,
    };

    const submitted = localStorage.getItem('es_cta_submitted') === 'true';
    const dismissed = sessionStorage.getItem('es_cta_dismissed') === 'true';
    if (submitted || dismissed) {
      setTimeout(() => setOpen(false), 0);
      return;
    }

    // Click-through (LinkedIn etc.) → open now. Organic → delay.
    if (forceInstant || attribution.fromLink) {
      setTimeout(() => setOpen(true), 0);
      return;
    }

    setTimeout(() => setOpen(false), 0);
    const t = window.setTimeout(() => setOpen(true), CTA_OPEN_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [forceInstant]);

  const close = useCallback(() => {
    setOpen(false);
    sessionStorage.setItem('es_cta_dismissed', 'true');
  }, []);

  useEffect(() => {
    if (!open) {
      document.documentElement.classList.remove('cta-overlay-open');
      document.body.classList.remove('cta-overlay-open');
      return;
    }

    document.documentElement.classList.add('cta-overlay-open');
    document.body.classList.add('cta-overlay-open');

    const t = window.setTimeout(() => inputRef.current?.focus(), 50);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKeyDown);
      document.documentElement.classList.remove('cta-overlay-open');
      document.body.classList.remove('cta-overlay-open');
    };
  }, [open, close]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { campaignKey, source } = attributionRef.current;
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          ...(campaignKey ? { campaign_key: campaignKey } : {}),
          ...(source ? { source } : {}),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Failed to subscribe' }));
        throw new Error(errData.error || 'Failed to subscribe');
      }
    } catch (err) {
      console.error('Subscribe error:', err);
    } finally {
      setEmail('');
      setIsSubmitting(false);
      setOpen(false);
      localStorage.setItem('es_cta_submitted', 'true');
      window.dispatchEvent(new CustomEvent('es_cta_submitted'));
    }
  };

  if (!open) return null;

  // Instant path: no fade (CTA is already "there"). Organic delayed path: soft fade.
  const enterClass = forceInstant ? '' : 'animate-fade-in';

  const modal = (
    <div className="cta-lead-modal pointer-events-none fixed inset-0 z-[9990]" role="presentation">
      <div
        className={`absolute inset-0 z-0 bg-canvas/80 backdrop-blur-[4px] ${enterClass}`}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-0 z-10 flex items-center justify-center p-4"
      >
        <div className={`pointer-events-auto relative w-full max-w-[760px] text-center ${enterClass}`}>
          <div className="relative rounded-xl border border-border bg-canvas px-8 py-10 shadow-[0_0_120px_rgba(0,0,0,0.98)] md:px-12 md:py-12">
            <button
              type="button"
              onClick={close}
              aria-label="Dismiss"
              className="absolute top-4 right-4 z-10 flex h-8 w-8 cursor-pointer items-center justify-center text-2xl leading-none text-muted-foreground transition-colors hover:text-white"
            >
              ×
            </button>

            <h4
              id={titleId}
              className="mb-6 text-[19px] font-light leading-tight text-white md:text-[21px]"
            >
              {CTA_COPY}
            </h4>

            <div className="mx-auto mt-0 w-full max-w-[620px]">
              <form onSubmit={handleSubmit} className="group relative">
                <div className="relative flex w-full flex-col items-stretch gap-2 transition-all duration-500 md:flex-row md:items-center md:gap-0 md:overflow-hidden md:rounded-full md:border md:border-border md:bg-surface-base/80 md:p-1.5 group-focus-within:border-white/40 group-focus-within:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  <div className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay transition-opacity duration-700 group-hover:opacity-40 group-focus-within:opacity-40">
                    <div className="h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent blur-xl animate-border-shimmer" />
                  </div>
                  <input
                    ref={inputRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="relative z-10 w-full rounded-full border border-border bg-surface-base/80 py-3 pl-6 pr-6 text-sm font-light text-white placeholder:text-muted-foreground focus:outline-none md:flex-1 md:border-0 md:bg-transparent md:pr-32"
                    aria-label="Email address"
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="relative static w-full cursor-pointer overflow-hidden rounded-full border border-border bg-surface-base px-6 py-2.5 text-[11px] font-light uppercase tracking-wider text-white backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:border-white/40 disabled:cursor-not-allowed md:absolute md:right-1.5 md:top-1/2 md:z-20 md:w-auto md:-translate-y-1/2"
                  >
                    <div className="pointer-events-none absolute inset-0">
                      <div className="absolute -inset-x-1/2 -inset-y-4 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-30 blur-xl animate-border-shimmer" />
                    </div>
                    <span className="relative z-10">
                      {isSubmitting ? 'Joining...' : 'Join the Evolution'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // SSR / pre-hydration: render in tree so campaign HTML already includes the CTA.
  // After mount: portal to body (same visual, cleaner stacking).
  if (!mounted || typeof document === 'undefined') {
    return modal;
  }
  return createPortal(modal, document.body);
}
