import type { CompiledLegalPack } from '@evo/legal_engine';
import { FileText, Shield, Hash, Scale, CheckCircle2 } from 'lucide-react';

interface DataRoomCardProps {
  pack: CompiledLegalPack;
  closeStyle: 'fourteen_day' | 'three_x_remaining';
  horseName?: string;
}

export function DataRoomCard({ pack, closeStyle, horseName: _horseName }: DataRoomCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4a964]">
            Regulatory Compliance
          </span>
          <h3 className="text-xl font-medium tracking-tight text-foreground mt-0.5">
            Legal Data Room
          </h3>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-mono text-muted-foreground">
          <Scale className="h-3.5 w-3.5 text-[#d4a964]" />
          <span>FMA Equine Exemption</span>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {/* Product Disclosure Statement (PDS) Document */}
        <div className="rounded-lg border border-border bg-background p-4 transition-colors hover:border-[#d4a964]/40">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded border border-[#d4a964]/30 bg-[#d4a964]/10 text-[#d4a964]">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground">
                  Product Disclosure Statement (PDS)
                </h4>
                <p className="text-xs text-muted-foreground">
                  Statutory prospectus issued under the NZTR Authorised Syndication Code
                </p>
              </div>
            </div>
            <span className="rounded bg-muted/60 px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
              v{pack.metadata.pdsVersion}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded bg-muted/30 px-3 py-1.5 font-mono text-[11px] text-muted-foreground">
            <Hash className="h-3.5 w-3.5 text-[#d4a964] shrink-0" />
            <span className="truncate">SHA-256: {pack.pdsHash}</span>
          </div>
        </div>

        {/* Syndicate Agreement (SA) Document */}
        <div className="rounded-lg border border-border bg-background p-4 transition-colors hover:border-[#d4a964]/40">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded border border-[#d4a964]/30 bg-[#d4a964]/10 text-[#d4a964]">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground">
                  Digital Syndicate Agreement (SA)
                </h4>
                <p className="text-xs text-muted-foreground">
                  Governing leasehold contract, Clause 6 trainer primacy & exit schedule
                </p>
              </div>
            </div>
            <span className="rounded bg-muted/60 px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
              v{pack.metadata.saVersion}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded bg-muted/30 px-3 py-1.5 font-mono text-[11px] text-muted-foreground">
            <Hash className="h-3.5 w-3.5 text-[#d4a964] shrink-0" />
            <span className="truncate">SHA-256: {pack.saHash}</span>
          </div>
        </div>
      </div>

      {/* Governance Invariants Grid */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg border border-border/80 bg-background/50 p-3">
          <div className="flex items-center gap-1.5 text-foreground font-medium mb-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#d4a964]" />
            <span>Clause 6: Trainer Primacy</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            All training, racing placement, spellings, and equine veterinary decisions remain exclusively with the licensed trainer.
          </p>
        </div>

        <div className="rounded-lg border border-border/80 bg-background/50 p-3">
          <div className="flex items-center gap-1.5 text-foreground font-medium mb-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#d4a964]" />
            <span>Exit Governance</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {closeStyle === 'fourteen_day'
              ? 'Governed by Standard 14-Day Written Notice (Case B) with 100% pro-rata refund of unused floats.'
              : 'Governed by 3× Remaining Buyout Liquidating Exit (Case B1).'}
          </p>
        </div>
      </div>
    </div>
  );
}
