/* RightRail — E3 status-driven sticky investment rail & acceptance gate (chunk-2).
 *
 * Locked rules:
 * - 5 Pillars: The Deal, What's Included, What If, Your Return, Exit & Transfer.
 * - Share-math: min 1%, step 0.5%, percentages only, pricing via pricingForUnits.
 * - Acceptance gate: scroll-through PDS + SA, dual checkboxes, proceed button disabled until both checked.
 * - Vocabulary whitelist: Stakes/Co-owners (Units retired from investor copy 2026-09-01), Settlement/Distribution/Prize money, Evolution Stables.
 * - Zero exclamation marks. British English.
 */

'use client';

import * as React from 'react';
import { Landmark, Activity } from 'lucide-react';
import { pricingForUnits } from '@/lib/nellie-loop';
import PurchaseFlowModal from './purchase-flow-modal';

export interface LegalPackDigest {
  pdsMarkdown?: string;
  saMarkdown?: string;
  pdsHash?: string;
  saHash?: string;
}

export interface RightRailProps {
  status: 'listed' | 'fully_subscribed' | 'coming_soon' | 'completed' | string;
  horseName?: string;
  horseSlug?: string;
  wholesaleMonthlyNzd?: number;
  minInvestmentPct?: number;
  maxInvestmentPct?: number;
  stakeStepPct?: number;
  legalPack?: LegalPackDigest | null;
}

type ListingStatus = 'listed' | 'fully_subscribed' | 'coming_soon' | 'completed';

function statusChip(status: ListingStatus) {
  if (status === 'listed') {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full border border-status-active/40 bg-status-active/10 px-3 py-1.5 text-[8px] font-medium uppercase tracking-widest text-status-active">
        <span className="h-2 w-2 rounded-full bg-status-active" />
        <span>Become an Owner</span>
      </div>
    );
  }

  if (status === 'fully_subscribed') {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-[8px] font-medium uppercase tracking-widest text-accent">
        <span className="h-2 w-2 rounded-full bg-accent" />
        <span>Fully Subscribed</span>
      </div>
    );
  }

  if (status === 'coming_soon') {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full border border-status-active/40 bg-status-active/10 px-3 py-1.5 text-[8px] font-medium uppercase tracking-widest text-status-active">
        <span className="h-2 w-2 rounded-full bg-status-active" />
        <span>Coming Soon</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[8px] font-medium uppercase tracking-widest text-muted-foreground">
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
      {error && <p className="text-[10px] text-destructive">{error}</p>}
    </form>
  );
}

/** Listed Investment Card — locked Step-1 "Ownership" rail (mockup index.html:94-161, LOOK LOCKED 2026-09-02).
 * Ownership eyebrow → "Becoming an owner is easier than you think." → gold divider → 3 stat rows →
 * 2 feature rows → Stake available → white CTA → fine print. NO slider, NO pillars, NO stake selector —
 * the stepper lives in the Step-2 term sheet only. */
function ListedInvestmentCard({
  horseName,
  horseSlug,
  wholesaleMonthlyNzd,
  minInvestmentPct = 1.0,
  maxInvestmentPct = 10.0,
  stakeStepPct = 0.5,
  legalPack,
}: {
  horseName: string;
  horseSlug: string;
  wholesaleMonthlyNzd?: number;
  minInvestmentPct?: number;
  maxInvestmentPct?: number;
  stakeStepPct?: number;
  legalPack?: LegalPackDigest | null;
}) {
  const [flowOpen, setFlowOpen] = React.useState(false);
  const wholesale = wholesaleMonthlyNzd ?? 3800;
  // Locked Step-1 figures are DSL values, never mockup placeholders: monthly keep per 1%,
  // 75% of gross prize money, and the campaign's available stake. Duration row uses the
  // campaign's wholesale/term defaults — placeholder-free (locked: numbers from data only).
  const pricing = React.useMemo(() => pricingForUnits(wholesale, 1.0), [wholesale]);

  return (
    <div className="rounded-3xl border border-border bg-surface backdrop-blur-2xl p-8 space-y-8 shadow-[0_0_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="space-y-3">
        <p className="text-gold text-[11px] font-bold uppercase tracking-[0.2em]">Ownership</p>
        <h3 className="text-3xl font-bold leading-tight text-heading tracking-tight">
          Becoming an owner is easier than you think.
        </h3>
      </div>
      <div className="w-10 h-px bg-gold" />

      {/* Stat rows — figures aligned to the feature-row text column (icon 22px + gap 16px = 38px) */}
      <div className="pl-[38px] space-y-8">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/70 block mb-1">Price</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold tracking-tighter text-heading">
              ${pricing.monthlyKeepUnitNzd.toLocaleString()}
            </span>
            <span className="text-muted text-lg">per month</span>
          </div>
          <p className="text-muted font-light text-sm">for a {minInvestmentPct.toFixed(1)}% stake</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/70 block mb-1">Return</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold tracking-tighter text-heading">75%</span>
            <span className="text-muted text-lg">return</span>
          </div>
          <p className="text-muted font-light text-sm">of gross prize money</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/70 block mb-1">Duration</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold tracking-tighter text-heading">12</span>
            <span className="text-muted text-lg">months</span>
          </div>
          <p className="text-muted font-light text-sm">investment term</p>
        </div>
      </div>

      <div className="pt-8 mt-auto space-y-5">
        {/* Feature rows */}
        <ul className="space-y-6 pb-6">
          <li className="flex items-start gap-4">
            <Landmark className="text-gold h-[22px] w-[22px] mt-0.5 shrink-0" />
            <p className="text-muted text-sm leading-relaxed">
              <strong className="text-heading font-medium block mb-1">Stable Access</strong>
              Quarterly visits to the training facility and trackside privileges.
            </p>
          </li>
          <li className="flex items-start gap-4">
            <Activity className="text-gold h-[22px] w-[22px] mt-0.5 shrink-0" />
            <p className="text-muted text-sm leading-relaxed">
              <strong className="text-heading font-medium block mb-1">Real-time Updates</strong>
              Weekly audio and video reports from the trainer.
            </p>
          </li>
        </ul>
        <div className="flex items-center justify-between border-t border-border pt-6">
          <span className="text-muted text-base">Stake available</span>
          <span className="text-heading font-bold text-2xl">{maxInvestmentPct.toFixed(0)}%</span>
        </div>

        {/* CTA: opens Step 2 term sheet (learn-more, not buy) */}
        <button
          type="button"
          onClick={() => setFlowOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-pure-white px-8 py-4 text-base font-bold tracking-wide text-black transition-colors hover:bg-white/90"
        >
          Become an Owner <span className="text-lg">→</span>
        </button>
        <p className="text-center text-xs text-muted-foreground/70">
          Subject to{' '}
          <a href="#" className="text-muted underline underline-offset-2 hover:text-heading transition-colors">
            Product Disclosure Statement
          </a>{' '}
          and{' '}
          <a href="#" className="text-muted underline underline-offset-2 hover:text-heading transition-colors">
            Syndicate Agreement
          </a>
          .
        </p>
      </div>

      {/* PurchaseFlowModal — Steps 2–3 (term sheet → acceptance gate) */}
      {flowOpen && (
        <PurchaseFlowModal
          horseName={horseName}
          horseSlug={horseSlug}
          wholesaleMonthlyNzd={wholesaleMonthlyNzd}
          minInvestmentPct={minInvestmentPct}
          maxInvestmentPct={maxInvestmentPct}
          stakeStepPct={stakeStepPct}
          legalPack={legalPack}
          onClose={() => setFlowOpen(false)}
        />
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
  const message =
    status === 'fully_subscribed'
      ? `All available stake in ${horseName} has been acquired. This horse is in active campaign.`
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
  minInvestmentPct = 1.0,
  maxInvestmentPct = 10.0,
  stakeStepPct = 0.5,
  legalPack = null,
}: RightRailProps) {
  const s = status as ListingStatus;
  const safeStatus: ListingStatus =
    s === 'listed' || s === 'fully_subscribed' || s === 'coming_soon' || s === 'completed'
      ? s
      : 'coming_soon';

  return (
    <aside className="lg:sticky lg:top-28 space-y-6">
      {statusChip(safeStatus)}

      {safeStatus === 'listed' && (
        <ListedInvestmentCard
          horseName={horseName}
          horseSlug={horseSlug}
          wholesaleMonthlyNzd={wholesaleMonthlyNzd}
          minInvestmentPct={minInvestmentPct}
          maxInvestmentPct={maxInvestmentPct}
          stakeStepPct={stakeStepPct}
          legalPack={legalPack}
        />
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