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
import { Eyebrow, StatRow } from '@evo/ui';
import { GlowPillButton } from '@/components/ui/GlowPillButton';
import { pricingForUnits } from '@/lib/nellie-loop';
import { monthsBetween } from './purchase-flow-modal';
import { INVESTOR_RETURN_PCT } from '@evo/legal_engine';

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
  minInvestmentPct: number;
  maxInvestmentPct?: number;
  stakeStepPct?: number;
  legalPack?: LegalPackDigest | null;
  /** F8: opens the page-level PurchaseFlowModal via URL push. Required. */
  onOpenModal: (units?: number) => void;
  /** Lease term dates (whole-month model) — feed the Duration row, never a hardcoded string. */
  termStartDate?: string;
  termEndDate?: string;
}

type ListingStatus = 'listed' | 'fully_subscribed' | 'coming_soon' | 'completed';

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
 * Ownership eyebrow → "You hold the share. You stand in the photo." → gold divider → 3 stat rows →
 * 2 feature rows → Stake available → white CTA → fine print. NO slider, NO pillars, NO stake selector —
 * the stepper lives in the Step-2 term sheet only. */
function ListedInvestmentCard({
  horseName,
  horseSlug,
  wholesaleMonthlyNzd,
  minInvestmentPct,
  maxInvestmentPct = 10.0,
  stakeStepPct = 0.5,
  legalPack,
  onOpenModal,
  termStartDate,
  termEndDate,
}: {
  horseName: string;
  horseSlug: string;
  wholesaleMonthlyNzd?: number;
  minInvestmentPct: number;
  maxInvestmentPct?: number;
  stakeStepPct?: number;
  legalPack?: LegalPackDigest | null;
  /** F8: opens the page-level PurchaseFlowModal via URL push (parent owns state). */
  onOpenModal: (units?: number) => void;
  termStartDate?: string;
  termEndDate?: string;
}) {
  const wholesale = wholesaleMonthlyNzd ?? 3800;
  // Locked Step-1 figures are DSL values, never mockup placeholders: monthly keep per 1%,
  // 75% of gross prize money, and the campaign's available stake. Duration row uses the
  // campaign's wholesale/term defaults — placeholder-free (locked: numbers from data only).
  const pricing = React.useMemo(() => pricingForUnits(wholesale, 1.0), [wholesale]);
  const termMonths = monthsBetween(termStartDate, termEndDate);

  return (
    <div className="rounded-3xl border border-border bg-surface backdrop-blur-2xl px-6 py-4 space-y-3.5 shadow-[0_0_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="space-y-2">
        <Eyebrow>Ownership</Eyebrow>
        <h3 className="text-[22px] font-light leading-tight tracking-tight text-heading">
          You hold the share. You stand in the photo.
        </h3>
      </div>
      <div className="w-10 h-px bg-gold" />

      {/* Stat rows — straight left edge per prod reference (no icon-column indent on stat rows) */}
      <div className="space-y-3.5">
        <StatRow
          label="Price"
          value={<>${pricing.monthlyKeepUnitNzd.toLocaleString()}</>}
          unit="per month"
          sub={`for a ${minInvestmentPct.toFixed(1)}% stake`}
        />
        <StatRow label="Return" value={<span className="text-status-active">{INVESTOR_RETURN_PCT}%</span>} unit="return" sub="of gross prize money" />
        <StatRow
          label="Duration"
          value={termMonths != null ? String(termMonths) : '—'}
          unit="months"
          sub="investment term"
        />
      </div>

      <div className="pt-3 mt-auto space-y-3.5">
        {/* Feature rows — icon left of text column (38px = icon 22 + gap 16) */}
        <ul className="space-y-3 pb-2.5">
          <li className="flex items-start gap-4">
            <Landmark className="text-gold h-[22px] w-[22px] mt-0.5 shrink-0" />
            <p className="text-muted-foreground text-sm font-light leading-relaxed">
              <strong className="text-heading font-medium block mb-1">Stable Access</strong>
              Quarterly visits to the training facility and trackside privileges.
            </p>
          </li>
          <li className="flex items-start gap-4">
            <Activity className="text-gold h-[22px] w-[22px] mt-0.5 shrink-0" />
            <p className="text-muted-foreground text-sm font-light leading-relaxed">
              <strong className="text-heading font-medium block mb-1">Real-time Updates</strong>
              Weekly audio and video reports from the trainer.
            </p>
          </li>
        </ul>
        {/* Stake available + CTA + fine print — all aligned to the feature-row text column (pl-[38px]) */}
        <div className="pl-[38px] space-y-3">
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-muted-foreground font-light text-base">Stake available</span>
            <span className="text-heading font-light text-xl tracking-tight">{maxInvestmentPct.toFixed(0)}%</span>
          </div>

          {/* CTA: opens Step 2 term sheet (learn-more, not buy).
              GlowPillButton — same CTA as NavBar 'Get Started' (2026-09-11 audit). */}
          <GlowPillButton onClick={() => onOpenModal()} className="w-full">
            Become an Owner <span className="text-lg">→</span>
          </GlowPillButton>
          <p className="text-center text-xs font-light text-muted-foreground">
            Subject to{' '}
            <a href={`/api/legal/download?slug=${encodeURIComponent(horseSlug)}&doc=pds`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground underline underline-offset-2 hover:text-heading transition-colors">
              Product Disclosure Statement
            </a>{' '}
            and{' '}
            <a href={`/api/legal/download?slug=${encodeURIComponent(horseSlug)}&doc=sa`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground underline underline-offset-2 hover:text-heading transition-colors">
              Syndicate Agreement
            </a>
            .
          </p>
        </div>
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
  minInvestmentPct,
  maxInvestmentPct = 10.0,
  stakeStepPct = 0.5,
  legalPack = null,
  onOpenModal,
  termStartDate,
  termEndDate,
}: RightRailProps) {
  const s = status as ListingStatus;
  const safeStatus: ListingStatus =
    s === 'listed' || s === 'fully_subscribed' || s === 'coming_soon' || s === 'completed'
      ? s
      : 'coming_soon';

  // Review-branch preview (NEXT_PUBLIC_WORKFLOW_PREVIEW=true): coming_soon horses
  // render the full investment card + CTA so the workflow walks. Never set in prod.
  const previewAll =
    typeof process !== 'undefined' && process.env.NEXT_PUBLIC_WORKFLOW_PREVIEW === 'true';

  // Pinned rail (founder 2026-09-12, v3: "meant to move, then lock").
  // The card travels with the page; when its top reaches the nav bottom
  // (top-28 = 112px) it locks there — and the self-stretch wrapper makes the
  // sticky range the full page height, so it NEVER releases (no drift at the
  // grid end). Below lg: normal flow, no pinning.
  return (
    <div className="lg:self-stretch">
      <aside className="space-y-6 z-20 h-fit lg:sticky lg:top-28">
      {(safeStatus === 'listed' || (previewAll && safeStatus === 'coming_soon')) && (
        <ListedInvestmentCard
          horseName={horseName}
          horseSlug={horseSlug}
          wholesaleMonthlyNzd={wholesaleMonthlyNzd}
          minInvestmentPct={minInvestmentPct}
          maxInvestmentPct={maxInvestmentPct}
          stakeStepPct={stakeStepPct}
          legalPack={legalPack}
          onOpenModal={onOpenModal}
          termStartDate={termStartDate}
          termEndDate={termEndDate}
        />
      )}

      {(safeStatus === 'fully_subscribed' || safeStatus === 'completed') && (
        <ClosedCampaignCard status={safeStatus} horseName={horseName} horseSlug={horseSlug} />
      )}

      {safeStatus === 'coming_soon' && !previewAll && (
        <ComingSoonCard horseName={horseName} horseSlug={horseSlug} />
      )}
      </aside>
    </div>
  );
}