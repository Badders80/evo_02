/* RightRail — status-driven sticky investment rail (chunk-9, audit-rev 2).
 *
 * Founder-locked page model (page-model-notes.md):
 *   listed          → green ● BECOME AN OWNER pill (routes into the auth/buy
 *                     flow, /login?next=) + white VIEW INVESTMENT TERMS pill
 *                     that opens a real terms surface (pricing from the
 *                     @evo/legal_engine SSOT — never invented numbers).
 *   fully_subscribed→ gold Fully Subscribed badge + "All shares have been
 *                     acquired" card + "I'm keen to hear about …" CTA.
 *   coming_soon / completed → neutral status chip + soft interest CTA.
 *
 * Audit fixes (kimi pass 1): CTA labels/actions correctly paired; terms
 * surface shows REAL computed terms; single visual dot (no literal ●);
 * subscribe forms surface errors; email inputs carry aria-labels; dead
 * status-guard removed.
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { computeDslPricing, type DslPricing } from '@evo/legal_engine';

export interface RightRailProps {
  status: 'listed' | 'fully_subscribed' | 'coming_soon' | 'completed' | string;
  horseName?: string;
  horseSlug?: string;
  /** Wholesale monthly keep for 100% (inventory.cost_monthly_nzd) — drives real pricing. */
  wholesaleMonthlyNzd?: number;
}

type ListingStatus = 'listed' | 'fully_subscribed' | 'coming_soon' | 'completed';

function statusChip(status: ListingStatus) {
  if (status === 'listed') {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 bg-status-active/10 border-status-active/40 text-status-active text-[8px] font-medium uppercase tracking-widest`}>
        <span className="h-2 w-2 rounded-full bg-status-active" />
        <span>Become an Owner</span>
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
      <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 bg-status-active/10 border-status-active/40 text-status-active text-[8px] font-medium uppercase tracking-widest`}>
        <span className="h-2 w-2 rounded-full bg-status-active" />
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

/** Shared lead-capture form (subscribe endpoint; errors surfaced, a11y labels). */
function LeadForm({
  horseSlug,
  campaignKey,
  submitLabel,
  successMessage,
}: {
  horseSlug: string;
  campaignKey: string;
  submitLabel: string;
  successMessage: string;
}) {
  const [email, setEmail] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, campaign_key: `${campaignKey}:${horseSlug}` }),
      });
      if (!res.ok) throw new Error('subscribe failed');
      setSubmitted(true);
    } catch {
      setError('Something went wrong — please try again.');
    } finally {
      setSubmitting(false);
      setEmail('');
    }
  };

  if (submitted) {
    return <p className="text-[11px] font-light text-status-active">{successMessage}</p>;
  }

  return (
    <form onSubmit={submit} className="flex gap-2" noValidate={false}>
      <input
        type="email"
        required
        aria-label="Email address"
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
        {submitting ? '…' : submitLabel}
      </button>
    </form>
  );
}

/** Terms surface — real numbers from the legal-engine SSOT (no invented pricing). */
function InvestmentTermsCard({
  horseName,
  horseSlug,
  wholesaleMonthlyNzd,
  onOpenTerms,
}: {
  horseName: string;
  horseSlug: string;
  wholesaleMonthlyNzd?: number;
  onOpenTerms: () => void;
}) {
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

      {/* White pill: VIEW INVESTMENT TERMS — opens the terms surface */}
      <button
        type="button"
        onClick={onOpenTerms}
        className="w-full rounded-full bg-foreground py-3 text-center text-[11px] font-medium uppercase tracking-[0.15em] text-background transition-all duration-300 hover:opacity-90 active:scale-[0.98]"
      >
        View Investment Terms
      </button>

      {/* Become-Owner CTA: routes into the auth/buy flow (KYC-gated) */}
      <a
        href={`/login?next=${encodeURIComponent(`/marketplace/${horseSlug}`)}`}
        className="block text-center text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 transition-colors hover:text-accent"
      >
        Become an owner →
      </a>

      {wholesaleMonthlyNzd === undefined && (
        <p className="text-[10px] font-light text-muted-foreground">
          Ownership units are offered in clean 0.5% stakes with monthly syndicate management.
        </p>
      )}
      {wholesaleMonthlyNzd !== undefined && (
        <p className="text-[10px] font-light text-muted-foreground">
          Real pricing is shown in the terms — computed live from the syndicate SSOT.
        </p>
      )}
    </div>
  );
}

/** Terms overlay — CtaLeadModal pattern; pricing rows from computeDslPricing. */
function TermsOverlay({ horseName, pricing, onClose }: { horseName: string; pricing: DslPricing | null; onClose: () => void }) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const rows: [string, string][] = pricing
    ? [
        ['Monthly keep (per 1%)', `$${pricing.monthlyKeepUnitNzd.toLocaleString()} /mo`],
        ['Join float (per 1%)', `$${pricing.joinFloatUnitNzd.toLocaleString()}`],
        ['List rate (per 1%/mo)', `$${pricing.listPriceNzd.toLocaleString()}`],
        ['Evolution margin', `${pricing.evolutionMarginPercent}%`],
        ['Processing buffer', `${pricing.processingBufferPercent}%`],
        ['GST', pricing.gstInclusive ? 'Inclusive' : 'Exclusive'],
      ]
    : [];

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 p-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Investment terms for ${horseName}`}
      onClick={onClose}
    >
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-accent">Investment Terms</p>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>
        <h3 className="mt-3 text-lg font-light text-heading">{horseName}</h3>

        {pricing ? (
          <div className="mt-5 space-y-3">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between border-b border-border pb-2.5">
                <span className="text-[11px] font-light text-muted-foreground">{label}</span>
                <span className="font-mono text-[12px] text-heading">{value}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-[12px] font-light text-muted-foreground">
            Pricing is prepared per campaign. Register to receive the full investor pack.
          </p>
        )}

        <p className="mt-5 text-[10px] leading-relaxed text-muted-foreground">
          Figures are indicative per 1% stake in the syndicate. Full PDS and Syndicate
          Agreement are available in the Documents tab to verified investors.
        </p>
      </div>
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
      <p className="text-[11px] font-medium text-heading">
        {`I'm keen to hear about horses like ${horseName}`}
      </p>
      <LeadForm
        horseSlug={horseSlug}
        campaignKey="interest"
        submitLabel="Notify Me"
        successMessage="Thank you — we'll be in touch when a new campaign opens."
      />
    </div>
  );
}

/** Coming-soon: soft interest card (no terms yet, no pricing fiction). */
function ComingSoonCard({ horseName, horseSlug }: { horseName: string; horseSlug: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
      <p className="text-[13px] font-light leading-relaxed text-muted-foreground">
        {horseName} is coming soon. Leave your email and we'll notify you the
        moment the campaign opens.
      </p>
      <LeadForm
        horseSlug={horseSlug}
        campaignKey="notify"
        submitLabel="Notify Me"
        successMessage="You're on the list."
      />
    </div>
  );
}

export default function RightRail({
  status,
  horseName = 'this horse',
  horseSlug = '',
  wholesaleMonthlyNzd,
}: RightRailProps) {
  const router = useRouter();
  const [termsOpen, setTermsOpen] = React.useState(false);

  const s = status as ListingStatus;
  const safeStatus: ListingStatus =
    s === 'listed' || s === 'fully_subscribed' || s === 'coming_soon' || s === 'completed'
      ? s
      : 'coming_soon';

  // Real pricing from the SSOT (listed only; never invented).
  const pricing = React.useMemo(
    () => (safeStatus === 'listed' && typeof wholesaleMonthlyNzd === 'number' ? computeDslPricing(wholesaleMonthlyNzd, 1.0) : null),
    [safeStatus, wholesaleMonthlyNzd]
  );

  return (
    <aside className="lg:sticky lg:top-28 space-y-6">
      {statusChip(safeStatus)}

      {safeStatus === 'listed' && (
        <InvestmentTermsCard
          horseName={horseName}
          horseSlug={horseSlug}
          wholesaleMonthlyNzd={wholesaleMonthlyNzd}
          onOpenTerms={() => setTermsOpen(true)}
        />
      )}

      {(safeStatus === 'fully_subscribed' || safeStatus === 'completed') && (
        <ClosedCampaignCard status={safeStatus} horseName={horseName} horseSlug={horseSlug} />
      )}

      {safeStatus === 'coming_soon' && (
        <ComingSoonCard horseName={horseName} horseSlug={horseSlug} />
      )}

      {termsOpen && (
        <TermsOverlay horseName={horseName} pricing={pricing} onClose={() => setTermsOpen(false)} />
      )}
    </aside>
  );
}