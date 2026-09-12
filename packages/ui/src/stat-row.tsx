import * as React from 'react';

/**
 * StatRow — label + value hierarchy (style guide P5).
 * Canonical label: text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground block mb-1
 * Evidence: apps/web/src/components/horse/right-rail.tsx:184,194,202
 *
 * 2026-09-11 (founder audit): unit was 16px beside the 30px value — unreadable.
 * Unit now renders BELOW the value at body size; unit + sub sit in muted-foreground
 * (#737373, ~4:1) — the card's standard secondary tier, matching the label. NOTE:
 * text-muted resolves to #111111 (near-black) in the dark palette, so it is NEVER
 * legible as a text colour here — only muted-foreground / heading are.
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
      <span className="text-[30px] font-light tracking-tight text-heading leading-tight">{value}</span>
      {unit !== undefined && (
        <span className="text-sm font-light text-muted-foreground block mt-0.5">{unit}</span>
      )}
      {sub !== undefined && <p className="text-muted-foreground font-light text-sm">{sub}</p>}
    </div>
  );
}