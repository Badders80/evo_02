/* PurchaseFlowModal — Steps 2–6 host (chunk-2: Step 2 term sheet).
 *
 * Locked rules (flow-mock/index.html LOOK LOCKED 2026-09-02/03):
 * - Modal shell: max-w-lg × h-[720px], content scrolls inside — all Steps 2–6 share it.
 * - Step 2 header: "Digital-Syndication Terms" (mockup, newer than spec).
 * - Stepper: ▲/▼ buttons, opens at min, 0.5% steps, max = availablePct.
 * - 4-row summary: Initial Payment / Monthly thereafter / Lease period / Investor Return.
 * - Investor Return value GREEN (text-status-active) — LOCKED 2026-09-03.
 * - Numbers from pricingForUnits — NEVER mockup placeholders ($76/$380/21mo).
 * - Vocabulary whitelist: Stakes/Co-owners, Settlement/Distribution/Prize money,
 *   Evolution Stables. Zero exclamation marks. British English.
 */

'use client';

import * as React from 'react';
import { pricingForUnits } from '@/lib/nellie-loop';
import type { DslPricing } from '@evo/legal_engine';

export interface PurchaseFlowModalProps {
  horseName: string;
  horseSlug: string;
  wholesaleMonthlyNzd?: number;
  minInvestmentPct?: number;
  maxInvestmentPct?: number;
  stakeStepPct?: number;
  /** Called when Step 2's "Invest in {Horse}" is pressed — hands off to the acceptance gate (Step 3). */
  onProceed: (stakePct: number) => void;
  onClose: () => void;
}

/** Shared modal shell — max-w-lg × h-[720px], scrolls inside (f14, locked 2026-09-03). */
export function ModalShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/85 p-4 sm:p-6 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative my-auto w-full max-w-lg h-[720px] overflow-y-auto rounded-3xl border border-border bg-surface p-8 space-y-6 shadow-[0_0_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-muted-foreground hover:text-heading text-xl transition-colors"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

/** Step 2 — The Term Sheet (mockup lines 170–268). */
function Step2TermSheet({
  horseName,
  horseSlug,
  wholesaleMonthlyNzd,
  minInvestmentPct = 1.0,
  maxInvestmentPct = 10.0,
  stakeStepPct = 0.5,
  onProceed,
}: {
  horseName: string;
  horseSlug: string;
  wholesaleMonthlyNzd?: number;
  minInvestmentPct?: number;
  maxInvestmentPct?: number;
  stakeStepPct?: number;
  onProceed: (stakePct: number) => void;
}) {
  const [stakePct, setStakePct] = React.useState<number>(minInvestmentPct);
  const [note, setNote] = React.useState<string | null>(null);
  const noteTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const wholesale = wholesaleMonthlyNzd ?? 3800;
  const pricing: DslPricing = React.useMemo(
    () => pricingForUnits(wholesale, stakePct),
    [wholesale, stakePct]
  );

  const showNote = (msg: string) => {
    setNote(msg);
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => setNote(null), 2600);
  };

  const stepUp = () => {
    const next = Math.round((stakePct + stakeStepPct) * 100) / 100;
    if (next <= maxInvestmentPct + 1e-9) {
      setStakePct(next);
    } else {
      showNote(`This is the maximum stake available — ${maxInvestmentPct.toFixed(1)}%.`);
    }
  };

  const stepDown = () => {
    const next = Math.round((stakePct - stakeStepPct) * 100) / 100;
    if (next >= minInvestmentPct - 1e-9) {
      setStakePct(next);
    } else {
      showNote(`This is the minimum investment — a ${minInvestmentPct.toFixed(1)}% stake.`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
          Digital-Syndication Terms
        </p>
        <h3 className="text-[22px] font-light text-heading tracking-tight">{horseName}</h3>
      </div>

      {/* Stat cards: price + stake selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-surface p-4 space-y-1">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Price</p>
          <p className="text-[28px] font-light text-heading tracking-tight leading-none">
            ${pricing.monthlyKeepUnitNzd.toLocaleString()}
            <span className="text-[13px] text-muted-foreground font-light ml-1">NZD</span>
          </p>
          <p className="text-[11px] font-light text-muted-foreground/60 leading-snug pt-1">
            per month, for a {stakePct.toFixed(1)}% stake
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 space-y-1">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Your stake</p>
          <div className="pt-1 flex items-center justify-start gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                aria-label="Increase stake"
                onClick={stepUp}
                className="text-[15px] font-bold leading-none text-status-active transition active:scale-90"
              >
                ▲
              </button>
              <button
                type="button"
                aria-label="Decrease stake"
                onClick={stepDown}
                className="text-[15px] font-bold leading-none text-destructive transition active:scale-90"
              >
                ▼
              </button>
            </div>
            <span className="text-[28px] font-light text-heading tracking-tight">
              {stakePct.toFixed(1)}%
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground/80 text-left pt-1">
            minimum {minInvestmentPct.toFixed(1)}% · {stakeStepPct.toFixed(1)}% steps · up to{' '}
            {maxInvestmentPct.toFixed(1)}% available
          </p>
        </div>
      </div>

      {/* Gentle limit note (fades in/out on dull-triangle clicks) */}
      <p className="text-center text-[11px] font-light leading-relaxed text-muted-foreground min-h-[16px]">
        {note ?? ''}
      </p>

      {/* 4-row summary block (LOCKED 2026-09-03) */}
      <div className="space-y-4 text-[13px] font-light border-t border-border pt-5">
        <div className="border-b border-border pb-3.5">
          <p className="flex justify-between items-baseline">
            <span className="text-muted-foreground">Initial Payment</span>
            <strong className="text-heading font-medium">
              ${pricing.joinFloatUnitNzd.toLocaleString()} NZD
            </strong>
          </p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">
            for a {stakePct.toFixed(1)}% stake — includes deposit in initial payment
          </p>
        </div>
        <div className="border-b border-border pb-3.5">
          <p className="flex justify-between items-baseline">
            <span className="text-muted-foreground">Monthly thereafter</span>
            <strong className="text-heading font-medium">
              ${pricing.monthlyKeepUnitNzd.toLocaleString()} NZD
            </strong>
          </p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">billed on the 1st of each month</p>
        </div>
        <div className="border-b border-border pb-3.5">
          <p className="flex justify-between items-baseline">
            <span className="text-muted-foreground">Lease period</span>
            <strong className="text-heading font-medium">12 months</strong>
          </p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">
            From 1 September 2026 to {`{dsl: service_end_date}`}
          </p>
        </div>
        <div>
          <p className="flex justify-between items-baseline">
            <span className="text-muted-foreground">Investor Return</span>
            <strong className="text-status-active text-[13px] font-medium">
              75% of gross prize money
            </strong>
          </p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">
            distributed quarterly, pro-rated based on your investment &amp; official NZTR results
          </p>
        </div>
      </div>

      {/* Prize distribution explained */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Prize distribution explained
        </p>
        <p className="text-[11px] font-light text-muted-foreground/60 leading-relaxed">
          Prize money is pro-rata based on your ownership in Evolution&apos;s syndicate stake,
          calculated according to official NZTR results and distributed quarterly after settlement.{' '}
          <a href="#" className="text-muted underline underline-offset-2">
            Learn more about how prize money is distributed
          </a>
        </p>
      </div>

      {/* CTA → Step 3 */}
      <button
        type="button"
        onClick={() => onProceed(stakePct)}
        className="block w-full text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] bg-foreground text-background hover:opacity-90 transition-all duration-300"
      >
        Invest in {horseName}
      </button>
      <p className="text-[11px] font-light text-muted-foreground leading-relaxed text-center">
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
  );
}

/** PurchaseFlowModal — Steps 2–6 host. Chunk-2 ships Step 2; Steps 3–6 land in chunks 3–5. */
export default function PurchaseFlowModal({
  horseName,
  horseSlug,
  wholesaleMonthlyNzd,
  minInvestmentPct,
  maxInvestmentPct,
  stakeStepPct,
  onProceed,
  onClose,
}: PurchaseFlowModalProps) {
  return (
    <ModalShell onClose={onClose}>
      <Step2TermSheet
        horseName={horseName}
        horseSlug={horseSlug}
        wholesaleMonthlyNzd={wholesaleMonthlyNzd}
        minInvestmentPct={minInvestmentPct}
        maxInvestmentPct={maxInvestmentPct}
        stakeStepPct={stakeStepPct}
        onProceed={onProceed}
      />
    </ModalShell>
  );
}
