/**
 * Canonical DSL Pricing Engine.
 * Authority: evo_00/doc/DSL_MANUAL.md + commercial-rules registry (founder-locked 2026-09-10).
 *
 * Formula (from the registry — never re-derive):
 * List Price = CEIL(Wholesale Cost × (1 + 5% margin) × (1 + 3% platform fee))
 * Unit Keep (M) = ⌈List Price × (stakePercentage / 100)⌉
 * Join Float = FLOAT_TOTAL_MONTHS × M (3 mo reserve + 2 mo advance keep)
 */

import type { DslPricing } from './types';
import {
  EVOLUTION_MARGIN_PCT,
  PLATFORM_FEE_PCT,
  FLOAT_TOTAL_MONTHS,
  retailFromWholesale,
} from './commercial-rules';

export function computeDslPricing(
  wholesaleMonthlyNzd: number,
  stakePercentage: number = 1.0
): DslPricing {
  if (stakePercentage <= 0 || stakePercentage > 100) {
    throw new Error(`stakePercentage must be between 0 and 100 (received ${stakePercentage})`);
  }
  const wholesale = Math.max(1, wholesaleMonthlyNzd);
  const listPriceNzd = retailFromWholesale(wholesale);
  const monthlyKeepUnitNzd = Math.ceil(listPriceNzd * (stakePercentage / 100));
  const joinFloatUnitNzd = FLOAT_TOTAL_MONTHS * monthlyKeepUnitNzd;

  return {
    costMonthlyNzd: wholesale,
    listPriceNzd,
    monthlyKeepUnitNzd,
    joinFloatUnitNzd,
    stakePercentage,
    evolutionMarginPercent: EVOLUTION_MARGIN_PCT,
    platformFeePercent: PLATFORM_FEE_PCT,
    gstInclusive: true,
  };
}
