import Link from 'next/link';
import { TrendingUp, ArrowLeft, Trophy, DollarSign, Calculator } from 'lucide-react';

export const metadata = {
  title: 'Returns & Prize Distribution | Evolution Stables',
  description: 'Understanding the 75/25 gross stakes distribution model and prize accounting.',
};

export default function ReturnsGuidePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#d4a964] hover:underline mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Return to Home</span>
      </Link>

      <div className="inline-flex items-center gap-2 rounded-full border border-[#d4a964]/40 bg-[#d4a964]/10 px-3.5 py-1 text-xs font-mono tracking-[0.2em] uppercase text-[#d4a964] mb-4">
        <TrendingUp className="h-3.5 w-3.5" />
        <span>Investor Guide</span>
      </div>

      <h1 className="text-4xl font-light tracking-tight text-foreground sm:text-5xl">
        Returns & <span className="font-serif italic text-[#d4a964]">Prize Distributions</span>
      </h1>
      <p className="mt-2 text-xs font-mono text-muted-foreground">
        The canonical 75/25 gross stakes distribution model explained.
      </p>

      <div className="mt-12 space-y-8">
        {/* Core Model Explanation */}
        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
            <Trophy className="h-6 w-6 text-[#d4a964]" />
            <h2 className="text-xl font-medium text-foreground">The 75/25 Distribution Rule</h2>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Whenever an Evolution Stables thoroughbred earns prize money in an official NZTR or international race, distributions are calculated directly from the <strong className="text-foreground">officially published gross stakes</strong> (as listed on loveracing.nz).
          </p>

          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#d4a964]/40 bg-[#d4a964]/10 p-5">
              <span className="text-xs uppercase font-mono text-[#d4a964] block font-medium">75% Net Investor Pool</span>
              <span className="text-2xl font-mono font-semibold text-foreground mt-2 block">75.0%</span>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Distributed pro-rata directly to verified syndicate members based on their percentage stake.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background p-5">
              <span className="text-xs uppercase font-mono text-muted-foreground block font-medium">25% Lessor Operational Cut</span>
              <span className="text-2xl font-mono font-semibold text-foreground mt-2 block">25.0%</span>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Retained by the lessor to absorb all jockey riding fees, trainer percentages, nomination fees, and acceptance charges.
              </p>
            </div>
          </div>
        </section>

        {/* Example Calculation Box */}
        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
            <Calculator className="h-6 w-6 text-[#d4a964]" />
            <h2 className="text-xl font-medium text-foreground">Worked Example: Group 2 Victory ($150,000 Gross)</h2>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between py-2 border-b border-border text-muted-foreground">
              <span>Official Gross Prize:</span>
              <span className="text-foreground font-semibold">$150,000 NZD</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border text-muted-foreground">
              <span>Total Syndicate Pool (75%):</span>
              <span className="text-[#d4a964] font-semibold">$112,500 NZD</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border text-muted-foreground">
              <span>Payout per 1% Unit Stake:</span>
              <span className="text-emerald-400 font-semibold">$1,125.00 NZD</span>
            </div>
          </div>
        </section>

        {/* 2-Month Qualification Rule */}
        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3 border-b border-border pb-4 mb-4">
            <DollarSign className="h-6 w-6 text-[#d4a964]" />
            <h2 className="text-xl font-medium text-foreground">Anti-Speculation & Settlement Timing</h2>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            To protect genuine long-term syndicate holders, prize money is credited to investors who have maintained active, paid-up lease status for at least 2 consecutive months prior to the race start. Prize earnings are credited directly to your verified New Zealand bank account at the end of each calendar quarter.
          </p>
        </section>
      </div>
    </div>
  );
}
