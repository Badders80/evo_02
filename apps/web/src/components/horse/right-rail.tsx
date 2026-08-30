/* RightRail — status-driven sticky investment rail (chunk-9).
 *
 * Founder-locked page model (page-model-notes.md):
 *   listed          → green ● BECOME AN OWNER pill + white VIEW INVESTMENT
 *                     TERMS pill in a dark rounded card.
 *   fully_subscribed→ gold Fully Subscribed badge + "All shares have been
 *                     acquired" card + "I'm keen to hear about …" CTA.
 *   coming_soon / completed → neutral status chip + soft interest CTA.
 *
 * Rail content is campaign-status driven, never one static block.
 * The Become-Owner pill routes into the auth flow (KYC-gated buy); guests land
 * on /login with a safe in-app `next` param. The keen-to-hear CTA posts to
 * /api/subscribe (same endpoint as the CtaLeadModal lead capture).
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

export interface RightRailProps {
  status: 'listed' | 'fully_subscribed' | 'coming_soon' | 'completed' | string;
  horseName?: string;
  horseSlug?: string;
}

type ListingStatus = 'listed' | 'fully_subscribed' | 'coming_soon' | 'completed';

function statusChip(status: ListingStatus) {
  if (status === 'listed') {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 bg-status-active/10 border-status-active/40 text-status-active text-[8px] font-medium uppercase tracking-widest`}>
        <span className="h-2 w-2 rounded-full bg-status-active" />
        <span>● BECOME AN OWNER</span>
      </div>
    );
  }

  if (status === 'fully_subscribed') {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-accent text-[8px] font-medium uppercase tracking-widest`}>
        <span className="h-2 w-2 rounded-full bg-accent" />
        <span>Fully Subscribed</span>
      </div>
    );
  }

  if (status === 'coming_soon') {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 border-accent/40 bg-accent/10 text-accent text-[8px] font-medium uppercase tracking-widest`}>
        <span className="h-2 w-2 rounded-full bg-accent" />
        <span>Coming Soon</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 border-border bg-card text-muted-foreground text-[8px] font-medium uppercase tracking-widest">
      <span className="h-2 w-2 rounded-full bg-muted-foreground" />
      <span>Campaign Concluded</span>
    </div>
  );
}

/** Terms surface — dark rounded card (CtaLeadModal overlay pattern, inline in the rail). */
function InvestmentTermsCard({ horseName, horseSlug }: { horseName: string; horseSlug: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const requestTerms = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, campaign_key: `terms:${horseSlug}` }),
      });
      if (!res.ok) throw new Error('failed');
      setSubmitted(true);
    } catch {
      // Silent: never block the flow on lead-capture failure.
    } finally {
      setSubmitting(false);
      setEmail('');
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-canvas p-6 space-y-4">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
          {horseName}
        </p>
        <p className="mt-2 text-[13px] font-light leading-relaxed text-foreground">
          Investment terms, pricing structure, and syndicate governance for{' '}
          {horseName} are available to registered investors.
        </p>
      </div>

      {/* White pill: VIEW INVESTMENT TERMS */}
      <button
        type="button"
        onClick={() => router.push(`/login?next=${encodeURIComponent(`/marketplace/${horseSlug}`)}`)}
        className="w-full rounded-full bg-foreground py-3 text-center text-[11px] font-medium uppercase tracking-[0.15em] text-background transition-all duration-300 hover:opacity-90 active:scale-[0.98]"
      >
        View Investment Terms
      </button>

      {/* Become-an-owner route hint */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-center text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 transition-colors hover:text-accent"
      >
        How ownership works →
      </button>

      {open && (
        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
          {submitted ? (
            <p className="text-[11px] font-light text-status-active">
              Thank you — an investor pack for {horseName} is on its way to you.
            </p>
          ) : (
            <>
              <p className="text-[11px] font-light leading-relaxed text-muted-foreground">
                Ownership units are offered in clean 0.5% stakes with monthly
                syndicate management. Leave your email to receive the full
                investor pack.
              </p>
              <form onSubmit={requestTerms} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2 text-[11px] font-light text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-[10px] font-medium uppercase tracking-widest text-accent transition-colors hover:bg-accent/20 disabled:opacity-50"
                >
                  {submitting ? '…' : 'Send'}
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/** Fully-subscribed / concluded: gold-tinted closed card + keen-to-hear CTA. */
function ClosedCampaignCard({
  status,
  horseName,
  horseSlug,
}: {
  status: 'fully_subscribed' | 'completed';
  horseName: string;
  horseSlug: string;
}) {
  const [email, setEmail] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const registerInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, campaign_key: `interest:${horseSlug}` }),
      });
      if (!res.ok) throw new Error('failed');
      setSubmitted(true);
    } catch {
      // Silent: never block the flow on lead-capture failure.
    } finally {
      setSubmitting(false);
      setEmail('');
    }
  };

  const message =
    status === 'fully_subscribed'
      ? `All shares in ${horseName} have been acquired. This horse is in active campaign.`
      : `The lease period for ${horseName} has concluded. Register your interest for future campaigns.`;

  return (
    <div className="rounded-2xl border border-accent/25 bg-canvas p-6 space-y-4">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-accent">
          {status === 'fully_subscribed' ? 'Fully Subscribed' : 'Campaign Concluded'}
        </p>
        <p className="mt-2 text-[13px] font-light leading-relaxed text-muted-foreground">
          {message}
        </p>
      </div>

      {submitted ? (
        <p className="text-[11px] font-light text-status-active">
          Thank you — we'll be in touch when a new campaign opens.
        </p>
      ) : (
        <form onSubmit={registerInterest} className="space-y-2">
          <p className="text-[11px] font-medium text-heading">
            {`I'm keen to hear about horses like ${horseName}`}
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2 text-[11px] font-light text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-[10px] font-medium uppercase tracking-widest text-accent transition-colors hover:bg-accent/20 disabled:opacity-50"
            >
              {submitting ? '…' : 'Notify Me'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/** Coming-soon: soft interest card (no terms yet, no pricing fiction). */
function ComingSoonCard({ horseName, horseSlug }: { horseName: string; horseSlug: string }) {
  const [email, setEmail] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const notifyMe = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, campaign_key: `notify:${horseSlug}` }),
      });
      if (!res.ok) throw new Error('failed');
      setSubmitted(true);
    } catch {
      // Silent.
    } finally {
      setSubmitting(false);
      setEmail('');
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
      <p className="text-[13px] font-light leading-relaxed text-muted-foreground">
        {horseName} is coming soon. Leave your email and we'll notify you the
        moment the campaign opens.
      </p>
      {submitted ? (
        <p className="text-[11px] font-light text-status-active">You're on the list.</p>
      ) : (
        <form onSubmit={notifyMe} className="flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2 text-[11px] font-light text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-[10px] font-medium uppercase tracking-widest text-accent transition-colors hover:bg-accent/20 disabled:opacity-50"
          >
            {submitting ? '…' : 'Notify Me'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function RightRail({ status, horseName = 'this horse', horseSlug = '' }: RightRailProps) {
  if (typeof status !== 'string') return null;
  const s = status as ListingStatus;
  const safeStatus: ListingStatus =
    s === 'listed' || s === 'fully_subscribed' || s === 'coming_soon' || s === 'completed'
      ? s
      : 'coming_soon';

  return (
    <aside className="lg:sticky lg:top-28 space-y-6">
      {statusChip(safeStatus)}

      {safeStatus === 'listed' && (
        <InvestmentTermsCard horseName={horseName} horseSlug={horseSlug} />
      )}

      {(safeStatus === 'fully_subscribed' || safeStatus === 'completed') && (
        <ClosedCampaignCard status={safeStatus} horseName={horseName} horseSlug={horseSlug} />
      )}

      {safeStatus === 'coming_soon' && (
        <ComingSoonCard horseName={horseName} horseSlug={horseSlug} />
      )}
    </aside>
  );
}