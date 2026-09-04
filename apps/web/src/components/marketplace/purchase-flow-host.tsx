'use client';

/**
 * PurchaseFlowHost — page-level wrapper that renders <PurchaseFlowModal> when
 * the URL carries ?open=1. Modal state lives in the URL (deep-linkable,
 * refresh-safe) rather than in any individual component's local state, so
 * any CTA on the horse page — current or future — can open the modal by
 * pushing ?open=1&units=X. Replaces the previous right-rail-scoped mount.
 *
 * Open trigger:  router.push('?open=1&units=X')  ({ scroll: false })
 * Close trigger: router.replace() with `open` stripped; `units` preserved.
 *
 * F8 (format-pass): kimi-code-audit APPROVE-WITH-FIXES → 5 WARNs addressed
 * (R1 server-side searchParams, R2 ?open=1 hard gate, R3 single-mount verified,
 *  R4 preserve other query params + scroll:false, R5 fixed-positioning verified).
 */

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import PurchaseFlowModal from '@/components/horse/purchase-flow-modal';
import type { LegalPackDigest } from '@/components/horse/purchase-flow-modal';

export interface PurchaseFlowHostProps {
  horseName: string;
  horseSlug: string;
  wholesaleMonthlyNzd?: number;
  minInvestmentPct?: number;
  maxInvestmentPct?: number;
  stakeStepPct?: number;
  legalPack?: LegalPackDigest | null;
}

export function PurchaseFlowHost(props: PurchaseFlowHostProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Hard-gate per audit R2: only ?open=1 opens the modal. ?units= alone does not.
  const isOpen = searchParams.get('open') === '1';
  const unitsParam = searchParams.get('units');

  const handleClose = React.useCallback(() => {
    // Preserve unrelated query params; strip `open`. Keep `units` so the
    // stepper pre-fill persists if the user re-opens.
    const next = new URLSearchParams(searchParams.toString());
    next.delete('open');
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  if (!isOpen) return null;

  return (
    <PurchaseFlowModal
      {...props}
      initialUnits={unitsParam ? Number(unitsParam) : undefined}
      onClose={handleClose}
    />
  );
}

/**
 * Helper hook so any CTA on the page can open the modal via URL push.
 * Preserves all existing query params and uses { scroll: false } so the
 * page doesn't jump to top on open.
 */
export function usePurchaseFlowOpener() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return React.useCallback(
    (units?: number) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set('open', '1');
      if (typeof units === 'number' && Number.isFinite(units)) {
        next.set('units', String(units));
      }
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );
}
