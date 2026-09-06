import * as React from 'react';
import { cn } from './cn';

/**
 * Stepper — vertical ▲/▼ numeric stepper with click-to-edit input (style guide P11).
 * Canonical: flex-col buttons (text-status-active up, text-destructive down, opacity-40
 * at bounds, active:scale-90 transition) + value-as-button + input-on-edit. Parent owns
 * pricing math, validation copy, and wholesale — primitive is dumb (props in, callbacks out).
 * Evidence: apps/web/src/components/horse/purchase-flow-modal.tsx:207-268
 * (clamp/snap logic in parent Step2TermSheet lines 131-182).
 */
export interface StepperProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (next: number) => void;
  /** Fires when ▲/▼ hits a bound so the parent can render the locked clamp copy. */
  onClamp?: (kind: 'min' | 'max') => void;
  /** Suffix appended to the displayed value (default '%'). */
  unit?: string;
  /** Decimals shown in the displayed value (default 1, matches inline behaviour). */
  precision?: number;
  className?: string;
  /** Optional aria-label for the input when in edit mode. */
  ariaLabelEdit?: string;
  /** Optional aria-labels for the up/down buttons. */
  ariaLabelUp?: string;
  ariaLabelDown?: string;
}

const EPS = 1e-9;

export function Stepper({
  value,
  min,
  max,
  step,
  onChange,
  onClamp,
  unit = '%',
  precision = 1,
  className,
  ariaLabelEdit = 'Enter value',
  ariaLabelUp = 'Increase',
  ariaLabelDown = 'Decrease',
}: StepperProps) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value.toFixed(precision));
  const valueStr = value.toFixed(precision);

  React.useEffect(() => {
    if (!editing) setDraft(valueStr);
  }, [valueStr, editing]);

  const atMax = value >= max - EPS;
  const atMin = value <= min + EPS;

  const stepUp = () => {
    if (atMax) {
      onClamp?.('max');
      return;
    }
    const next = Math.round((value + step) * 100) / 100;
    onChange(next);
  };

  const stepDown = () => {
    if (atMin) {
      onClamp?.('min');
      return;
    }
    const next = Math.round((value - step) * 100) / 100;
    onChange(next);
  };

  const commit = (raw: string) => {
    const cleaned = raw.replace('%', '').replace(',', '.').trim();
    if (cleaned === '') {
      onChange(min);
      return;
    }
    const parsed = parseFloat(cleaned);
    if (!Number.isFinite(parsed)) {
      // Locked copy lives in parent; we surface the parse failure via a no-op.
      return;
    }
    const safeStep = Math.max(step, 0.01);
    const snapped = Math.round(parsed / safeStep) * safeStep;
    if (Math.abs(snapped - parsed) > EPS) return;
    if (snapped > max + EPS || snapped < min - EPS) return;
    onChange(Math.round(snapped * 100) / 100);
  };

  return (
    <div className={cn('flex items-center justify-start gap-3', className)}>
      <div className="flex flex-col items-center gap-1.5">
        <button
          type="button"
          aria-label={ariaLabelUp}
          onClick={stepUp}
          className={cn(
            'text-[15px] font-bold leading-none text-status-active transition active:scale-90',
            atMax && 'cursor-not-allowed opacity-40'
          )}
        >
          ▲
        </button>
        <button
          type="button"
          aria-label={ariaLabelDown}
          onClick={stepDown}
          className={cn(
            'text-[15px] font-bold leading-none text-destructive transition active:scale-90',
            atMin && 'cursor-not-allowed opacity-40'
          )}
        >
          ▼
        </button>
      </div>
      {editing ? (
        <input
          type="text"
          inputMode="decimal"
          aria-label={ariaLabelEdit}
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            commit(draft);
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              commit(draft);
              setEditing(false);
              e.currentTarget.blur();
            }
            if (e.key === 'Escape') {
              setDraft(valueStr);
              setEditing(false);
            }
          }}
          className="w-24 rounded-lg border border-border bg-background px-2 py-1 text-[22px] font-light text-heading tracking-tight focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      ) : (
        <button
          type="button"
          aria-label={ariaLabelEdit}
          onClick={() => {
            setDraft(valueStr);
            setEditing(true);
          }}
          className="text-[28px] font-light text-heading tracking-tight transition-colors hover:text-accent"
        >
          {valueStr}
          {unit}
        </button>
      )}
    </div>
  );
}