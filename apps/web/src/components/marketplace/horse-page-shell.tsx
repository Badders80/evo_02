'use client';

/**
 * HorsePageShell — thin client wrapper that owns the purchase-flow opener
 * and renders <RightRail> + <PurchaseFlowHost> side-by-side. Lets the
 * marketplace/[slug]/page.tsx stay an async Server Component while exposing
 * the modal as a page-level (global) popup reachable from any CTA via
 * ?open=1&units=X in the URL.
 *
 * F8: replaces the previous right-rail-scoped modal mount (right rail no
 * longer owns local modal state). See purchase-flow-host.tsx for the
 * URL-driven modal logic + the kimi-code-audit verdict.
 */

import * as React from 'react';
import RightRail from '@/components/horse/right-rail';
import { PurchaseFlowHost, usePurchaseFlowOpener } from './purchase-flow-host';
import type { LegalPackDigest } from '@/components/horse/purchase-flow-modal';

export interface HorsePageShellProps {
  horseName: string;
  horseSlug: string;
  wholesaleMonthlyNzd?: number;
  minInvestmentPct?: number;
  maxInvestmentPct?: number;
  stakeStepPct?: number;
  legalPack?: LegalPackDigest | null;
  /** Pass-through from page.tsx for status routing (listed / fully_subscribed / coming_soon / completed). */
  listingStatus: 'listed' | 'fully_subscribed' | 'coming_soon' | 'completed';
}

export function HorsePageShell(props: HorsePageShellProps) {
  const openModal = usePurchaseFlowOpener();

  return (
    <>
      <RightRail
        status={props.listingStatus}
        horseName={props.horseName}
        horseSlug={props.horseSlug}
        wholesaleMonthlyNzd={props.wholesaleMonthlyNzd}
        minInvestmentPct={props.minInvestmentPct}
        maxInvestmentPct={props.maxInvestmentPct}
        stakeStepPct={props.stakeStepPct}
        legalPack={props.legalPack}
        onOpenModal={openModal}
      />
      <PurchaseFlowHost
        horseName={props.horseName}
        horseSlug={props.horseSlug}
        wholesaleMonthlyNzd={props.wholesaleMonthlyNzd}
        minInvestmentPct={props.minInvestmentPct}
        maxInvestmentPct={props.maxInvestmentPct}
        stakeStepPct={props.stakeStepPct}
        legalPack={props.legalPack}
      />
    </>
  );
}
