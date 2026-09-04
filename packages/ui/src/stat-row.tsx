import * as React from 'react';
import { cn } from './cn';

/**
 * StatRow — label + value hierarchy (style guide P5).
 * Canonical label: text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground block mb-1
 * Evidence: apps/web/src/components/horse/right-rail.tsx:184,194,202
 */
export function StatRow({
  label,
  value,
  unit,
  sub,
  className,
}: {
  label: string;
  value: React.ReactNode;
  unit?: React.ReactNode;
  sub?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground block mb-1">
        {label}
      </p>
      <div className="flex items-baseline gap-2">
        <span className="text-[30px] font-light tracking-tight text-heading leading-tight">{value}</span>
        {unit !== undefined && <span className="text-base font-light text-muted">{unit}</span>}
      </div>
      {sub !== undefined && <p className="text-muted-foreground font-light text-sm">{sub}</p>}
    </div>
  );
}
