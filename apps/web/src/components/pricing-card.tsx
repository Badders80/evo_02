'use client';

import { useState } from 'react';
import { computeDslPricing } from '@evo/legal_engine';
import { Info, Lock, Calculator, Loader2 } from 'lucide-react';

interface PricingCardProps {
  wholesaleMonthlyNzd: number;
  horseName?: string;
  campaignSlug?: string;
  sharesAvailable: number;
  checkoutOpen?: boolean;
  listingStatusLabel?: string;
}

export function PricingCard({
  wholesaleMonthlyNzd,
  horseName: _horseName,
  campaignSlug,
  sharesAvailable,
  checkoutOpen = true,
  listingStatusLabel,
}: PricingCardProps) {
  // Available unit options: integer 1% stakes up to available shares (minimum 1)
  const maxUnits = Math.max(1, Math.min(sharesAvailable, 5));
  const STAKE_OPTIONS = Array.from({ length: maxUnits }, (_, i) => i + 1);

  const [selectedStake, setSelectedStake] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Compute live canonical pricing dynamically via @evo/legal_engine SSOT
  const pricing = computeDslPricing(wholesaleMonthlyNzd, selectedStake);

  // Canonical NZ GST 3/23 breakdown formula
  const gstInclusiveJoinFloat = pricing.joinFloatUnitNzd;
  const gstComponentNzd = Math.round((gstInclusiveJoinFloat * 3) / 23);
  const netJoinFloatNzd = gstInclusiveJoinFloat - gstComponentNzd;

  const handleCheckout = async () => {
    if (!campaignSlug) return;
    setLoading(true);
    setCheckoutError(null);

    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          horseSlug: campaignSlug,
          units: selectedStake,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initiate checkout reservation');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      setCheckoutError(err instanceof Error ? err.message : 'Checkout error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#d4a964]/40 bg-card p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 h-28 w-28 bg-[#d4a964]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4a964]">
            Commercial Pricing Engine
          </span>
          <h3 className="text-xl font-medium tracking-tight text-foreground mt-0.5">
            Syndicate Subscription
          </h3>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-[#d4a964]/30 bg-[#d4a964]/10 px-2.5 py-1 text-[11px] font-mono text-[#d4a964]">
          <Calculator className="h-3.5 w-3.5" />
          <span>DSL Standard</span>
        </div>
      </div>

      {/* Integer Stake Unit Selector (Capped at sharesAvailable) */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Select Units (1% = 1 Unit)
          </label>
          <span className="text-[11px] font-mono text-muted-foreground">
            {sharesAvailable} Unit{sharesAvailable > 1 ? 's' : ''} Available
          </span>
        </div>
        <div className={`grid gap-2 ${STAKE_OPTIONS.length <= 2 ? 'grid-cols-2' : 'grid-cols-4'}`}>
          {STAKE_OPTIONS.map((units) => {
            const isSelected = selectedStake === units;
            return (
              <button
                key={units}
                type="button"
                onClick={() => setSelectedStake(units)}
                className={`py-2 px-3 text-center rounded-lg border font-mono text-sm transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#d4a964] bg-[#d4a964]/20 text-[#d4a964] font-semibold ring-1 ring-[#d4a964]/50'
                    : 'border-border bg-card/60 text-muted-foreground hover:border-muted-foreground/60 hover:text-foreground'
                }`}
              >
                {units}% ({units} {units === 1 ? 'Unit' : 'Units'})
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Financial Numbers (Monospace High-Precision) */}
      <div className="mt-6 rounded-lg border border-border bg-background p-4">
        <div className="grid grid-cols-2 gap-4 divide-x divide-border">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground block font-medium">
              Initial Join Float (5×M)
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-mono font-semibold text-foreground tracking-tight">
                ${pricing.joinFloatUnitNzd.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-muted-foreground">NZD</span>
            </div>
            <p className="mt-1 text-[10px] text-[#d4a964] font-mono">
              3 mo deposit + 2 mo advance keep
            </p>
          </div>

          <div className="pl-4">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground block font-medium">
              Monthly Keep (M)
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-mono font-semibold text-[#d4a964] tracking-tight">
                ${pricing.monthlyKeepUnitNzd.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-muted-foreground">/mo</span>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground font-mono">
              Commences Month 2
            </p>
          </div>
        </div>
      </div>

      {/* Breakdown Details & 3/23 NZ GST Breakdown */}
      <div className="mt-5 space-y-2.5 text-xs">
        <div className="flex justify-between items-center py-1 border-b border-border/60 text-muted-foreground">
          <span>Wholesale Base Keep</span>
          <span className="font-mono text-foreground">
            ${pricing.costMonthlyNzd.toLocaleString()} NZD / mo
          </span>
        </div>
        <div className="flex justify-between items-center py-1 border-b border-border/60 text-muted-foreground">
          <span>Evolution Operating Margin</span>
          <span className="font-mono text-foreground">{pricing.evolutionMarginPercent.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between items-center py-1 border-b border-border/60 text-muted-foreground">
          <span>Payment Processing Buffer</span>
          <span className="font-mono text-foreground">{pricing.processingBufferPercent.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between items-center py-1 border-b border-border/60 text-muted-foreground">
          <span>NZ GST Breakdown (3/23 identity)</span>
          <span className="font-mono text-muted-foreground">
            Net ${netJoinFloatNzd.toLocaleString()} + GST ${gstComponentNzd.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center py-1 text-muted-foreground">
          <span>GST Treatment</span>
          <span className="font-mono text-emerald-400 font-medium">100% GST-Inclusive (15% IRD)</span>
        </div>
      </div>

      {/* Invariant Note & Guarantees */}
      <div className="mt-5 rounded-lg border border-border bg-background/50 p-3 flex gap-2.5">
        <Info className="h-4 w-4 text-[#d4a964] shrink-0 mt-0.5" />
        <div className="text-[11px] text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Unused Funds Pro-Rata Refund:</strong> Upon formal termination or maturity
          of the syndicate lease, all unused prepaid keep and security deposit reserve funds are refunded pro-rata to your
          verified account within 14 days.
        </div>
      </div>

      {/* Error Message */}
      {checkoutError && (
        <div className="mt-4 rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-xs text-red-300">
          {checkoutError}
        </div>
      )}

      {/* Join Syndicate Action Button */}
      <div className="mt-6">
        {!checkoutOpen ? (
          <div className="w-full rounded-lg border border-border bg-muted/40 py-3.5 px-4 text-center text-sm font-medium text-muted-foreground">
            {listingStatusLabel ?? 'Subscription closed'}
          </div>
        ) : (
        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading}
          className="w-full rounded-lg bg-[#d4a964] py-3.5 px-4 text-center text-sm font-semibold tracking-wide text-[#0a0a0a] transition-all hover:bg-[#c39853] flex items-center justify-center gap-2 shadow-lg shadow-[#d4a964]/10 cursor-pointer disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Reserving 15-Min Lock...</span>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              <span>Join Syndicate — {selectedStake}% (${pricing.joinFloatUnitNzd.toLocaleString()} NZD)</span>
            </>
          )}
        </button>
        )}
        <p className="mt-2 text-center text-[10px] font-mono text-muted-foreground">
          {checkoutOpen
            ? '15-Minute Concurrency Share Lock · Pure Stripe Engine'
            : 'Visible campaign · checkout locked'}
        </p>
      </div>
    </div>
  );
}
