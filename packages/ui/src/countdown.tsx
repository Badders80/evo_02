import * as React from 'react';
import { cn } from './cn';

/**
 * Countdown — reservation timer to a target date (style guide P13).
 * Canonical: mono digits (font-mono) split by a gold hairline divider (P9) into
 * day/hour/minute/second groups. Auto-format: dd:hh:mm:ss when remaining > 24h,
 * otherwise hh:mm:ss. setInterval 1s with cleanup on unmount; fires onExpire
 * once at zero and renders 00:00:00 thereafter (never negative).
 * Evidence: spec-only (purchase-content-spec.md reservation copy).
 */
export interface CountdownProps {
  targetDate: Date | string;
  /** Fires once when the countdown reaches zero. */
  onExpire?: () => void;
  className?: string;
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

function toMs(target: Date | string): number {
  if (target instanceof Date) return target.getTime();
  const ms = Date.parse(target);
  if (!Number.isFinite(ms)) return Number.NaN;
  return ms;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function split(ms: number): { days: number; hours: number; minutes: number; seconds: number } {
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const days = Math.floor(ms / DAY_MS);
  const hours = Math.floor((ms % DAY_MS) / HOUR_MS);
  const minutes = Math.floor((ms % HOUR_MS) / (60 * 1000));
  const seconds = Math.floor((ms % (60 * 1000)) / 1000);
  return { days, hours, minutes, seconds };
}

export function Countdown({ targetDate, onExpire, className }: CountdownProps) {
  const targetMs = React.useMemo(() => toMs(targetDate), [targetDate]);
  const [remaining, setRemaining] = React.useState(() =>
    Number.isFinite(targetMs) ? Math.max(0, targetMs - Date.now()) : 0
  );
  const expiredRef = React.useRef(false);

  React.useEffect(() => {
    if (!Number.isFinite(targetMs)) return;
    expiredRef.current = false;
    setRemaining(Math.max(0, targetMs - Date.now()));
    const id = window.setInterval(() => {
      const next = Math.max(0, targetMs - Date.now());
      setRemaining(next);
      if (next === 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [targetMs, onExpire]);

  const { days, hours, minutes, seconds } = split(remaining);
  const showDays = remaining > DAY_MS;

  return (
    <div
      role="timer"
      aria-live="polite"
      className={cn('inline-flex items-center gap-2 font-mono text-[15px] tabular-nums text-heading', className)}
    >
      {showDays ? (
        <>
          <span>{pad(days)}d</span>
          <span className="block h-px w-10 bg-gold" aria-hidden />
          <span>{pad(hours)}h</span>
          <span className="block h-px w-10 bg-gold" aria-hidden />
        </>
      ) : (
        <>
          <span>{pad(hours)}h</span>
          <span className="block h-px w-10 bg-gold" aria-hidden />
        </>
      )}
      <span>{pad(minutes)}m</span>
      <span className="block h-px w-10 bg-gold" aria-hidden />
      <span>{pad(seconds)}s</span>
    </div>
  );
}