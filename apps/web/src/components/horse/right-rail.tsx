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
import { ChevronDown, ChevronUp } from 'lucide-react';
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

interface Pillar {
  id: string;
  title: string;
  summary: string;
  content: string;
}

const E3_PILLARS: Pillar[] = [
  {
    id: 'deal',
    title: 'The Deal',
    summary: 'Fixed price · fixed duration · fixed return.',
    content: 'Can the owner ask for more money? Nope. One price, fixed. What the upfront covers: the last 5 months of the term.',
  },
  {
    id: 'included',
    title: "What's Included",
    summary: 'Everything covered, nothing changes.',
    content: 'Float, keep, insurance, veterinary coverage — all-inclusive management. No surprise capital calls.',
  },
  {
    id: 'what_if',
    title: 'What If',
    summary: 'Injured → you stop paying.',
    content: 'Welfare-first stewardship. If injured and unable to race, your monthly keep contributions stop immediately.',
  },
  {
    id: 'return',
    title: 'Your Return',
    summary: '75% gross prize money, pro-rata, quarterly.',
    content: 'Stakes published on official NZTR record. Distributions paid quarterly directly to your bank account.',
  },
  {
    id: 'exit',
    title: 'Exit & Transfer',
    summary: 'Fixed term end · transfer via Evolution on request.',
    content: 'Secondary market to follow. Initially, ownership transfers are facilitated through Evolution Stables upon request.',
  },
];

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

/** E3 Accordion Pillar Item */
function PillarAccordionItem({
  pillar,
  isOpen,
  onToggle,
}: {
  pillar: Pillar;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-border/70 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between py-3 text-left transition-colors hover:text-foreground group"
        aria-expanded={isOpen}
      >
        <div className="space-y-0.5 pr-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium tracking-wide text-foreground group-hover:text-accent transition-colors">
              {pillar.title}
            </span>
          </div>
          <p className="text-[11px] font-light leading-snug text-muted-foreground">
            {pillar.summary}
          </p>
        </div>
        <div className="mt-0.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
          {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </div>
      </button>
      {isOpen && (
        <div className="pb-3.5 pt-1">
          <div className="rounded-xl border border-border/60 bg-surface-base/50 p-3 text-[12px] font-light leading-relaxed text-foreground/80">
            {pillar.content}
          </div>
        </div>
      )}
    </div>
  );
}

/** Listed Investment Card with Stake Slider, Monthly NZD Pricing & 5 Pillars */
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
  // f6b (audit 2026-09-03): restore stake from ?units= on mount (login redirect /
  // cancel return preserve it). Read in useEffect — a useState initializer runs
  // during SSR (window undefined) and never re-runs on hydration, which would
  // drop the stake on exactly the full-browser navigations this exists for.
  const [stakePct, setStakePct] = React.useState<number>(minInvestmentPct);
  React.useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get('units');
    const parsed = raw ? parseFloat(raw) : NaN;
    const step = Math.max(stakeStepPct ?? 0.5, 0.01);
    const snapped = Math.round(parsed / step) * step;
    if (Number.isFinite(snapped) && snapped >= minInvestmentPct && snapped <= maxInvestmentPct) {
      setStakePct(Math.round(snapped * 100) / 100);
    }
  }, [minInvestmentPct, maxInvestmentPct, stakeStepPct]);
  const [openPillarId, setOpenPillarId] = React.useState<string | null>(null);
  const [flowOpen, setFlowOpen] = React.useState(false);

  const wholesale = wholesaleMonthlyNzd ?? 3800;
  const pricing = React.useMemo(
    () => pricingForUnits(wholesale, stakePct),
    [wholesale, stakePct]
  );

  const togglePillar = (id: string) => {
    setOpenPillarId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="rounded-2xl border border-border bg-canvas p-6 space-y-6">
      {/* Top Header info */}
      <div className="space-y-1">
        <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
          {horseName}
        </p>
        <h3 className="text-lg font-light tracking-tight text-heading">
          Become an Owner
        </h3>
        <p className="text-[12px] font-light leading-relaxed text-muted-foreground">
          Take a stake from 1.0%, in clean 0.5% steps, with fixed monthly syndicate keep.
        </p>
      </div>

      {/* Stake Selector / Slider (Locked share-math: min 1%, step 0.5%) */}
      <div className="space-y-3 rounded-xl border border-border/80 bg-surface-base/40 p-4">
        <div className="flex items-baseline justify-between">
          <label htmlFor="stake-slider" className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            Selected Stake
          </label>
          <div className="font-mono text-base font-medium text-heading">
            {stakePct.toFixed(1)}%
          </div>
        </div>

        <input
          id="stake-slider"
          type="range"
          min={minInvestmentPct}
          max={maxInvestmentPct}
          step={stakeStepPct}
          value={stakePct}
          onChange={(e) => setStakePct(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none"
        />

        <div className="flex justify-between text-[9px] font-mono text-muted-foreground/80 pt-0.5">
          <span>Minimum investment {minInvestmentPct.toFixed(1)}%</span>
          <span>Stake available {maxInvestmentPct.toFixed(1)}%</span>
          <span>Contact us for more info</span>
        </div>

        {/* Live Monthly Pricing Display */}
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/60 pt-3">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground block">
              Monthly Keep
            </span>
            <span className="font-mono text-[14px] font-medium text-heading">
              ${pricing.monthlyKeepUnitNzd.toLocaleString()} <span className="text-[10px] font-light text-muted-foreground">/mo</span>
            </span>
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground block">
              Join Float (5×M)
            </span>
            <span className="font-mono text-[14px] font-medium text-heading">
              ${pricing.joinFloatUnitNzd.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Primary CTA: opens Step 2 term sheet (learn-more, not buy) */}
      <button
        type="button"
        onClick={() => setFlowOpen(true)}
        className="w-full rounded-full bg-pure-white py-3.5 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-black transition-all duration-300 hover:opacity-90 active:scale-[0.98]"
      >
        Become an Owner
      </button>

      {/* The 5 Accordion Pillars */}
      <div className="space-y-1 border-t border-border/80 pt-4">
        <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-muted-foreground pb-1">
          Ownership Pillars
        </p>
        <div className="divide-y divide-border/60">
          {E3_PILLARS.map((pillar) => (
            <PillarAccordionItem
              key={pillar.id}
              pillar={pillar}
              isOpen={openPillarId === pillar.id}
              onToggle={() => togglePillar(pillar.id)}
            />
          ))}
        </div>
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
          initialStakePct={stakePct}
          onStakeChange={setStakePct}
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