import { PieChart, Lock, Users, CheckCircle2 } from 'lucide-react';

interface CapTableCardProps {
  retainedPct: number;
  allocatedPct: number;
  reservedPct: number;
  availablePct: number;
  totalInvestors: number;
  horseName?: string;
}

export function CapTableCard({
  retainedPct,
  allocatedPct,
  reservedPct,
  availablePct,
  totalInvestors,
  horseName: _horseName,
}: CapTableCardProps) {
  const total = retainedPct + allocatedPct + reservedPct + availablePct;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-xl relative">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4a964]">
            Cap Table Governance
          </span>
          <h3 className="text-xl font-medium tracking-tight text-foreground mt-0.5">
            4-Way Thoroughbred Allocation
          </h3>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-mono text-muted-foreground">
          <PieChart className="h-3.5 w-3.5 text-[#d4a964]" />
          <span>100% Invariant</span>
        </div>
      </div>

      {/* Visual Multi-Segment Proportional Bar */}
      <div className="mt-5">
        <div className="flex justify-between text-xs font-mono text-muted-foreground mb-2">
          <span>Syndicate Integrity</span>
          <span className="text-foreground font-semibold">{total.toFixed(0)}% Accounted</span>
        </div>
        <div className="h-4 w-full rounded-full overflow-hidden flex bg-muted/40 border border-border">
          {/* Retained */}
          <div
            style={{ width: `${retainedPct}%` }}
            className="bg-slate-700 transition-all"
            title={`Owner/Breeder Retained: ${retainedPct}%`}
          />
          {/* Allocated */}
          <div
            style={{ width: `${allocatedPct}%` }}
            className="bg-[#d4a964] transition-all"
            title={`Allocated Syndicate: ${allocatedPct}%`}
          />
          {/* Reserved */}
          <div
            style={{ width: `${reservedPct}%` }}
            className="bg-amber-500/80 transition-all"
            title={`In-Flight 15-Min Lock: ${reservedPct}%`}
          />
          {/* Available */}
          <div
            style={{ width: `${availablePct}%` }}
            className="bg-emerald-500 transition-all"
            title={`Available for Subscription: ${availablePct}%`}
          />
        </div>
      </div>

      {/* Legend & Allocation Breakdown Table */}
      <div className="mt-6 space-y-3 font-mono text-xs">
        {/* Retained Stake */}
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 p-3">
          <div className="flex items-center gap-2.5">
            <div className="h-3 w-3 rounded-sm bg-slate-700" />
            <div>
              <span className="font-sans text-sm text-foreground font-medium block">
                Retained Stake (Lessor / Owner)
              </span>
              <span className="text-[11px] font-sans text-muted-foreground">
                Absorbs NZTR deductions, jockey & trainer fees
              </span>
            </div>
          </div>
          <span className="text-sm font-semibold text-foreground">{retainedPct.toFixed(1)}%</span>
        </div>

        {/* Allocated Shares */}
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 p-3">
          <div className="flex items-center gap-2.5">
            <div className="h-3 w-3 rounded-sm bg-[#d4a964]" />
            <div>
              <span className="font-sans text-sm text-foreground font-medium block">
                Allocated Syndicate Units
              </span>
              <span className="text-[11px] font-sans text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                {totalInvestors} Verified Co-Owner{totalInvestors > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <span className="text-sm font-semibold text-[#d4a964]">{allocatedPct.toFixed(1)}%</span>
        </div>

        {/* Reserved (In-Flight Concurrency) */}
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 p-3">
          <div className="flex items-center gap-2.5">
            <div className="h-3 w-3 rounded-sm bg-amber-500/80" />
            <div>
              <span className="font-sans text-sm text-foreground font-medium block">
                Reserved (Checkout In-Flight)
              </span>
              <span className="text-[11px] font-sans text-muted-foreground flex items-center gap-1">
                <Lock className="h-3 w-3 text-amber-400" />
                15-Min TTL Atomic Lock
              </span>
            </div>
          </div>
          <span className="text-sm font-semibold text-amber-400">{reservedPct.toFixed(1)}%</span>
        </div>

        {/* Available Shares */}
        <div className="flex items-center justify-between rounded-lg border border-emerald-900/40 bg-emerald-950/20 p-3">
          <div className="flex items-center gap-2.5">
            <div className="h-3 w-3 rounded-sm bg-emerald-500" />
            <div>
              <span className="font-sans text-sm text-foreground font-medium block">
                Available for Subscription
              </span>
              <span className="text-[11px] font-sans text-emerald-400/80 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                Open for Immediate Subscription
              </span>
            </div>
          </div>
          <span className="text-sm font-semibold text-emerald-400">{availablePct.toFixed(1)}%</span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-[10px] font-mono text-muted-foreground">
          Canonical Formula: 100% = Retained ({retainedPct}%) + Allocated ({allocatedPct}%) + Reserved ({reservedPct}%) + Available ({availablePct}%)
        </p>
      </div>
    </div>
  );
}
