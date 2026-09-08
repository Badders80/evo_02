// apps/web/src/lib/float-decay.ts
export const FLOAT_FLOOR_MONTHS = 3;

export function decayFloat(floatMonthsHeld: number): number {
  return Math.max(FLOAT_FLOOR_MONTHS, floatMonthsHeld - 1);
}

export const FloatState = {
  fromMonths(m: number): 'healthy' | 'in_fault' | 'default' {
    if (m <= FLOAT_FLOOR_MONTHS) return 'default';
    if (m === 4) return 'in_fault';
    return 'healthy';
  },
} as const;
