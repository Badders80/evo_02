/**
 * Canonical DSL Pricing Engine.
 * Authority: evo_00/doc/DSL_MANUAL.md
 *
 * Formula:
 * List Price = Wholesale Cost × 1.05 × 1.03
 * Unit Keep (M) = ⌈List Price × (stakePercentage / 100)⌉
 * Join Float = 5 × M (3 mo reserve + 2 mo advance keep)
 */

import type { DslPricing } from './types';

export function computeDslPricing(
  wholesaleMonthlyNzd: number,
  stakePercentage: number = 1.0
): DslPricing {
  if (stakePercentage <= 0 || stakePercentage > 100) {
    throw new Error(`stakePercentage must be between 0 and 100 (received ${stakePercentage})`);
  }
  const wholesale = Math.max(1, wholesaleMonthlyNzd);
  const listPriceNzd = Math.ceil(wholesale * 1.05 * 1.03);
  const monthlyKeepUnitNzd = Math.ceil(listPriceNzd * (stakePercentage / 100));
  const joinFloatUnitNzd = 5 * monthlyKeepUnitNzd;

  return {
    costMonthlyNzd: wholesale,
    listPriceNzd,
    monthlyKeepUnitNzd,
    joinFloatUnitNzd,
    stakePercentage,
    evolutionMarginPercent: 5.0,
    processingBufferPercent: 3.0,
    gstInclusive: true,
  };
}
