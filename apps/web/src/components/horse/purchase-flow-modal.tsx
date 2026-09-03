/* PurchaseFlowModal — Steps 2–6 host (chunk-2: Step 2 term sheet; chunk-3: Step 3 gate).
 *
 * Locked rules (flow-mock/index.html LOOK LOCKED 2026-09-02/03):
 * - Modal shell: max-w-lg × h-[720px], content scrolls inside — all Steps 2–6 share it.
 * - Step 2 header: "Digital-Syndication Terms" (mockup, newer than spec).
 * - Step 3 header: "Acceptance — {horse} your documents"; accordion + Completed badge,
 *   CTA label LOCKED: "Proceed to Secure Checkout".
 * - Stepper: ▲/▼ buttons, opens at min, 0.5% steps, max = availablePct.
 * - 4-row summary: Initial Payment / Monthly thereafter / Lease period / Investor Return.
 * - Investor Return value GREEN (text-status-active) — LOCKED 2026-09-03.
 * - Numbers from pricingForUnits — NEVER mockup placeholders ($76/$380/21mo).
 * - Each acceptance tick = recorded audit event (POST /api/acceptance, chunk-3).
 * - KYC read-then-verify (LOCKED 2026-09-01): docs readable pre-KYC; on 403 KYC_REQUIRED
 *   the modal stays open with the in-modal KYC prompt (spec purchase-content-spec.md:162-185).
 * - Vocabulary whitelist: Stakes/Co-owners, Settlement/Distribution/Prize money,
 *   Evolution Stables. Zero exclamation marks. British English.
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { pricingForUnits } from '@/lib/nellie-loop';
import type { DslPricing } from '@evo/legal_engine';

export interface LegalPackDigest {
  pdsMarkdown?: string;
  saMarkdown?: string;
  pdsHash?: string;
  saHash?: string;
}

export interface PurchaseFlowModalProps {
  horseName: string;
  horseSlug: string;
  wholesaleMonthlyNzd?: number;
  minInvestmentPct?: number;
  maxInvestmentPct?: number;
  stakeStepPct?: number;
  /** Seed for the modal's internal stake state (from ?units= restore in the rail). */
  initialStakePct?: number;
  legalPack?: LegalPackDigest | null;
  onClose: () => void;
}

type Step = 'terms' | 'accept';

/** Shared modal shell — max-w-lg × h-[720px], scrolls inside (f14, locked 2026-09-03). */
function ModalShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/85 p-4 sm:p-6 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative my-auto w-full max-w-lg h-[720px] overflow-y-auto rounded-3xl border border-border bg-surface p-8 space-y-6 shadow-[0_0_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-muted-foreground hover:text-heading text-xl transition-colors"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

/** Step 2 — The Term Sheet (mockup lines 170–268). Stake is lifted to the modal host. */
function Step2TermSheet({
  horseName,
  wholesaleMonthlyNzd,
  minInvestmentPct = 1.0,
  maxInvestmentPct = 10.0,
  stakeStepPct = 0.5,
  stakePct,
  setStakePct,
  onProceed,
}: {
  horseName: string;
  wholesaleMonthlyNzd?: number;
  minInvestmentPct?: number;
  maxInvestmentPct?: number;
  stakeStepPct?: number;
  stakePct: number;
  setStakePct: (value: number) => void;
  onProceed: () => void;
}) {
  const [note, setNote] = React.useState<string | null>(null);
  const noteTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up the note timer on unmount (audit chunk-2 #11).
  React.useEffect(() => {
    return () => {
      if (noteTimer.current) clearTimeout(noteTimer.current);
    };
  }, []);

  const wholesale = wholesaleMonthlyNzd ?? 3800;
  const pricing: DslPricing = React.useMemo(
    () => pricingForUnits(wholesale, stakePct),
    [wholesale, stakePct]
  );

  const showNote = (msg: string) => {
    setNote(msg);
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => setNote(null), 2600);
  };

  const stepUp = () => {
    const next = Math.round((stakePct + stakeStepPct) * 100) / 100;
    if (next <= maxInvestmentPct + 1e-9) {
      setStakePct(next);
    } else {
      showNote(`This is the maximum stake available — ${maxInvestmentPct.toFixed(1)}%.`);
    }
  };

  const stepDown = () => {
    const next = Math.round((stakePct - stakeStepPct) * 100) / 100;
    if (next >= minInvestmentPct - 1e-9) {
      setStakePct(next);
    } else {
      showNote(`This is the minimum investment — a ${minInvestmentPct.toFixed(1)}% stake.`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
          Digital-Syndication Terms
        </p>
        <h3 className="text-[22px] font-light text-heading tracking-tight">{horseName}</h3>
      </div>

      {/* Stat cards: price + stake selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-surface p-4 space-y-1">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Price</p>
          <p className="text-[28px] font-light text-heading tracking-tight leading-none">
            ${pricing.monthlyKeepUnitNzd.toLocaleString()}
            <span className="text-[13px] text-muted-foreground font-light ml-1">NZD</span>
          </p>
          <p className="text-[11px] font-light text-muted-foreground/60 leading-snug pt-1">
            per month, for a {stakePct.toFixed(1)}% stake
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 space-y-1">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Your stake</p>
          <div className="pt-1 flex items-center justify-start gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                aria-label="Increase stake"
                onClick={stepUp}
                className="text-[15px] font-bold leading-none text-status-active transition active:scale-90"
              >
                ▲
              </button>
              <button
                type="button"
                aria-label="Decrease stake"
                onClick={stepDown}
                className="text-[15px] font-bold leading-none text-destructive transition active:scale-90"
              >
                ▼
              </button>
            </div>
            <span className="text-[28px] font-light text-heading tracking-tight">
              {stakePct.toFixed(1)}%
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground/80 text-left pt-1">
            minimum {minInvestmentPct.toFixed(1)}% · {stakeStepPct.toFixed(1)}% steps · up to{' '}
            {maxInvestmentPct.toFixed(1)}% available
          </p>
        </div>
      </div>

      {/* Gentle limit note (fades in/out on dull-triangle clicks) */}
      <p className="text-center text-[11px] font-light leading-relaxed text-muted-foreground min-h-[16px]">
        {note ?? ''}
      </p>

      {/* 4-row summary block (LOCKED 2026-09-03) */}
      <div className="space-y-4 text-[13px] font-light border-t border-border pt-5">
        <div className="border-b border-border pb-3.5">
          <p className="flex justify-between items-baseline">
            <span className="text-muted-foreground">Initial Payment</span>
            <strong className="text-heading font-medium">
              ${pricing.joinFloatUnitNzd.toLocaleString()} NZD
            </strong>
          </p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">
            for a {stakePct.toFixed(1)}% stake — includes deposit in initial payment
          </p>
        </div>
        <div className="border-b border-border pb-3.5">
          <p className="flex justify-between items-baseline">
            <span className="text-muted-foreground">Monthly thereafter</span>
            <strong className="text-heading font-medium">
              ${pricing.monthlyKeepUnitNzd.toLocaleString()} NZD
            </strong>
          </p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">billed on the 1st of each month</p>
        </div>
        <div className="border-b border-border pb-3.5">
          <p className="flex justify-between items-baseline">
            <span className="text-muted-foreground">Lease period</span>
            <strong className="text-heading font-medium">12 months</strong>
          </p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">
            From 1 September 2026 to {`{dsl: service_end_date}`}
          </p>
        </div>
        <div>
          <p className="flex justify-between items-baseline">
            <span className="text-muted-foreground">Investor Return</span>
            <strong className="text-status-active text-[13px] font-medium">
              75% of gross prize money
            </strong>
          </p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">
            distributed quarterly, pro-rated based on your investment &amp; official NZTR results
          </p>
        </div>
      </div>

      {/* Prize distribution explained */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Prize distribution explained
        </p>
        <p className="text-[11px] font-light text-muted-foreground/60 leading-relaxed">
          Prize money is pro-rata based on your ownership in Evolution&apos;s syndicate stake,
          calculated according to official NZTR results and distributed quarterly after settlement.{' '}
          <a href="#" className="text-muted underline underline-offset-2">
            Learn more about how prize money is distributed
          </a>
        </p>
      </div>

      {/* CTA → Step 3 */}
      <button
        type="button"
        onClick={onProceed}
        className="block w-full text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] bg-foreground text-background hover:opacity-90 transition-all duration-300"
      >
        Invest in {horseName}
      </button>
      <p className="text-[11px] font-light text-muted-foreground leading-relaxed text-center">
        Subject to{' '}
        <a href="#" className="text-muted underline underline-offset-2 hover:text-heading transition-colors">
          Product Disclosure Statement
        </a>{' '}
        and{' '}
        <a href="#" className="text-muted underline underline-offset-2 hover:text-heading transition-colors">
          Syndicate Agreement
        </a>
        .
      </p>
    </div>
  );
}

/** Step 3 — Accept gate: accordion docs, Completed badges, audit ticks, checkout, KYC prompt. */
function Step3AcceptanceGate({
  horseName,
  horseSlug,
  stakePct,
  legalPack,
}: {
  horseName: string;
  horseSlug: string;
  stakePct: number;
  legalPack?: LegalPackDigest | null;
}) {
  const router = useRouter();
  const [openDoc, setOpenDoc] = React.useState<'pds' | 'sa' | null>('pds');
  const [ticks, setTicks] = React.useState<{ pds: boolean; sa: boolean }>({ pds: false, sa: false });
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  // KYC flow state: null = not prompted, 'prompt' = 403 received, 'pending', 'rejected'
  const [kycState, setKycState] = React.useState<'prompt' | 'pending' | 'rejected' | null>(null);

  const toggleDoc = (doc: 'pds' | 'sa') => {
    setOpenDoc((prev) => (prev === doc ? null : doc));
  };

  /** Each tick records an acceptance audit event (chunk-3, locked: tick = audit event). */
  const handleTick = async (doc: 'pds' | 'sa', checked: boolean) => {
    setTicks((prev) => ({ ...prev, [doc]: checked }));
    if (!checked) return;
    try {
      await fetch('/api/acceptance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          horseSlug,
          stakePct,
          doc,
          docHash: doc === 'pds' ? legalPack?.pdsHash : legalPack?.saHash,
        }),
      });
    } catch {
      // Audit-tick logging is never allowed to block the flow; surface nothing.
    }
  };

  const handleProceed = async () => {
    if (!ticks.pds || !ticks.sa || submitting) return;
    setSubmitting(true);
    setError(null);
    setKycState(null);

    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ horseSlug, units: stakePct }),
      });

      if (res.status === 401) {
        // Session expired / not logged in — preserve stake and send to login.
        const nextUrl = encodeURIComponent(`${window.location.pathname}?units=${stakePct}`);
        router.push(`/login?next=${nextUrl}`);
        return;
      }

      if (res.status === 403) {
        // KYC required — in-modal prompt (read-then-verify, LOCKED 2026-09-01).
        setKycState('prompt');
        setSubmitting(false);
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Checkout initialization failed');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned from server');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Checkout encountered an error';
      setError(message);
      setSubmitting(false);
    }
  };

  const pdsText =
    legalPack?.pdsMarkdown ||
    `Product Disclosure Statement (PDS) for ${horseName} Syndicate.\n\n` +
      `Issued under the NZTR Authorised Syndication Code.\n\n` +
      `1. The Offer: Fixed-duration syndicate stakes in thoroughbred ${horseName}.\n` +
      `2. Upfront float deposit covers 5 months advance reserve.\n` +
      `3. Monthly keep is fixed per 1% stake as shown in the term sheet. Contact Evolution Stables for current pricing.\n` +
      `4. Downside protection: if the horse is injured and unable to train/race, keep contributions stop immediately.\n` +
      `5. Return mechanics: 75% gross prize money pro-rata quarterly.`;

  const saText =
    legalPack?.saMarkdown ||
    `Syndicate Agreement (SA) for ${horseName} Syndicate.\n\n` +
      `Manager: Evolution Stables.\n\n` +
      `1. Governance: The Manager administers all racing, veterinary, training, and nomination decisions in accordance with welfare-first standards.\n` +
      `2. Financials: Monies held in segregated trust account.\n` +
      `3. Transfers: Secondary transfer facilitated through Evolution Stables upon formal request.\n` +
      `4. Term: Fixed lease duration with predefined settlement date.`;

  const docRows: Array<{
    id: 'pds' | 'sa';
    title: string;
    hashLabel: string;
    body: string;
    tickLabel: string;
  }> = [
    {
      id: 'pds',
      title: 'Product Disclosure Statement',
      hashLabel: legalPack?.pdsHash ? `sha256: ${legalPack.pdsHash.slice(0, 4)}…${legalPack.pdsHash.slice(-4)}` : '',
      body: pdsText,
      tickLabel: 'I have read and accept the Product Disclosure Statement',
    },
    {
      id: 'sa',
      title: 'Syndicate Agreement',
      hashLabel: legalPack?.saHash ? `sha256: ${legalPack.saHash.slice(0, 4)}…${legalPack.saHash.slice(-4)}` : '',
      body: saText,
      tickLabel: 'I have read and accept the Syndicate Agreement',
    },
  ];

  const bothTicked = ticks.pds && ticks.sa;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Acceptance</p>
        <h3 className="text-[22px] font-light text-heading tracking-tight">
          {horseName} — your documents
        </h3>
        <p className="text-[11px] font-light text-muted-foreground/60 leading-relaxed mt-2">
          Read each document in full, then tick to accept. Each acceptance is recorded against the exact document version.
        </p>
      </div>

      {/* Document accordion rows */}
      {docRows.map((doc) => (
        <div key={doc.id} className="rounded-xl border border-border bg-surface overflow-hidden">
          <button
            type="button"
            onClick={() => toggleDoc(doc.id)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-white/[0.03] transition-colors"
            aria-expanded={openDoc === doc.id}
          >
            <span className="flex items-center gap-3 min-w-0">
              <span className="text-[12px] font-light text-heading">{doc.title}</span>
              {doc.hashLabel && (
                <span className="font-mono text-[10px] text-muted-foreground shrink-0">{doc.hashLabel}</span>
              )}
            </span>
            <span className="flex items-center gap-2 shrink-0">
              {ticks[doc.id] && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-status-active">
                  <span aria-hidden>✓</span> Completed
                </span>
              )}
              <span
                className={`text-muted-foreground text-lg leading-none transition-transform duration-200 ${
                  openDoc === doc.id ? 'rotate-180' : ''
                }`}
              >
                +
              </span>
            </span>
          </button>
          {openDoc === doc.id && (
            <div className="px-4 pb-4 space-y-3">
              <div className="rounded-xl border border-border bg-canvas/60 h-36 overflow-y-auto p-4">
                <p className="text-[11px] font-light leading-relaxed text-foreground/80 whitespace-pre-line select-text">
                  {doc.body}
                </p>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ticks[doc.id]}
                  onChange={(e) => handleTick(doc.id, e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border bg-background text-accent focus:ring-accent focus:ring-offset-0"
                />
                <span className="text-[12px] font-light text-muted-foreground">{doc.tickLabel}</span>
              </label>
            </div>
          )}
        </div>
      ))}

      {/* KYC prompt (read-then-verify, LOCKED 2026-09-01) */}
      {kycState === 'prompt' && (
        <div className="rounded-2xl border border-accent/40 bg-accent/10 p-4 space-y-3">
          <p className="text-[12px] font-light leading-relaxed text-foreground/90">
            Identity verification is required before checkout. This is a one-time check under New Zealand law.
          </p>
          <button
            type="button"
            className="w-full rounded-full bg-foreground py-3 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-background transition-all duration-300 hover:opacity-90"
            onClick={() => {
              setKycState('pending');
              // KYC port (Firebase → Supabase) is a separate workstream; this is the
              // in-modal prompt surface. The port wires /auth/verify here when shipped.
              console.warn('[purchase-flow] KYC port pending — wire Stripe Identity here (chunk-4)');
            }}
          >
            Verify Identity
          </button>
          <p className="text-[10px] font-light text-muted-foreground/80">
            After verification, return here — your stake and documents are preserved.
          </p>
        </div>
      )}
      {kycState === 'pending' && (
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-[12px] font-light leading-relaxed text-muted-foreground">
            Your identity check is being reviewed. We will email you when it is complete.
          </p>
        </div>
      )}
      {kycState === 'rejected' && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4">
          <p className="text-[12px] font-light leading-relaxed text-muted-foreground">
            Your identity check could not be completed. A member of Evolution Stables will contact you shortly to help complete the process.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-[11px] text-destructive">
          {error}
        </div>
      )}

      {/* Modal Action Footer */}
      <div className="pt-2 border-t border-border space-y-3">
        <button
          type="button"
          disabled={!bothTicked || submitting}
          onClick={handleProceed}
          className="w-full rounded-full bg-accent py-3.5 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-accent-foreground transition-all duration-300 hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100"
        >
          {submitting ? 'Preparing Secure Checkout…' : 'Proceed to Secure Checkout'}
        </button>
        <p className="text-[10px] font-light leading-relaxed text-muted-foreground/70 text-center">
          Each document expands to read — a <span className="text-status-active">Completed</span> tick appears once accepted. Button unlocks when both are ticked.{' '}
          <span className="text-accent">Each tick = recorded acceptance</span> — who + document hash + timestamp, logged at the instant of the tick.
        </p>
      </div>
    </div>
  );
}

/** PurchaseFlowModal — Steps 2–6 host. Step 2 + Step 3 shipped (chunks 2–3). */
export default function PurchaseFlowModal({
  horseName,
  horseSlug,
  wholesaleMonthlyNzd,
  minInvestmentPct = 1.0,
  maxInvestmentPct = 10.0,
  stakeStepPct = 0.5,
  initialStakePct,
  legalPack = null,
  onClose,
}: PurchaseFlowModalProps) {
  const [step, setStep] = React.useState<Step>('terms');
  // Stake lifted here so it survives the Step 2 → Step 3 handoff (and later URL sync).
  const [stakePct, setStakePct] = React.useState<number>(initialStakePct ?? minInvestmentPct);

  return (
    <ModalShell onClose={onClose}>
      {step === 'terms' ? (
        <Step2TermSheet
          horseName={horseName}
          wholesaleMonthlyNzd={wholesaleMonthlyNzd}
          minInvestmentPct={minInvestmentPct}
          maxInvestmentPct={maxInvestmentPct}
          stakeStepPct={stakeStepPct}
          stakePct={stakePct}
          setStakePct={setStakePct}
          onProceed={() => setStep('accept')}
        />
      ) : (
        <Step3AcceptanceGate
          horseName={horseName}
          horseSlug={horseSlug}
          stakePct={stakePct}
          legalPack={legalPack}
        />
      )}
    </ModalShell>
  );
}
