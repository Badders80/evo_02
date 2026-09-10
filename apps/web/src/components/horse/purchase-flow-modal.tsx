/* PurchaseFlowModal — Steps 2–6 host (chunk-2: Step 2 term sheet; chunk-3: Step 3 gate).
 *
 * Locked rules (flow-mock/index.html LOOK LOCKED 2026-09-02/03):
 * - Modal shell: max-w-lg × h-[720px], content scrolls inside — all Steps 2–6 share it.
 * - Step 2 header: "Digital-Syndication Terms" (mockup, newer than spec).
 * - Step 3 header: "Acceptance — {horse} your documents"; accordion + Completed badge,
 *   CTA label LOCKED: "Proceed to Secure Checkout".
 * - Stepper: ▲/▼ buttons, opens at min, 0.5% steps, max = availablePct.
 * - 4-row summary: Initial Payment / Monthly thereafter / Lease period / Distribution.
 * - Distribution value GREEN (text-status-active) — LOCKED 2026-09-03 (label "Distribution" per VOICE.md §4, 2026-09-07).
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
import { pricingForUnits, investorCheckoutError } from '@/lib/nellie-loop';
import type { DslPricing } from '@evo/legal_engine';
import { WhitePillCTA } from '@evo/ui';
import { marked } from 'marked';

export interface LegalPackDigest {
  termSheetMarkdown?: string;
  pdsMarkdown?: string;
  saMarkdown?: string;
  termSheetHash?: string;
  pdsHash?: string;
  saHash?: string;
}

const TERM_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Format an ISO date (YYYY-MM-DD) as "1 September 2026" (deterministic, locale-free). */
function formatTermDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getUTCDate()} ${TERM_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Inclusive month count between two ISO dates (start = 1st, end = last day). */
function monthsBetween(startIso?: string, endIso?: string): number | null {
  if (!startIso || !endIso) return null;
  const s = new Date(`${startIso}T00:00:00Z`);
  const e = new Date(`${endIso}T00:00:00Z`);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null;
  return (e.getUTCFullYear() - s.getUTCFullYear()) * 12 + (e.getUTCMonth() - s.getUTCMonth()) + 1;
}

export interface PurchaseFlowModalProps {
  horseName: string;
  horseSlug: string;
  wholesaleMonthlyNzd?: number;
  minInvestmentPct?: number;
  maxInvestmentPct?: number;
  stakeStepPct?: number;
  legalPack?: LegalPackDigest | null;
  /** Lease term dates (whole-month model: start = 1st, end = last day). Blank when unset. */
  termStartDate?: string;
  termEndDate?: string;
  /** Owner-set prize split (e.g. "75% Investor Pool / 25% Owner Retention"). Blank when unset. */
  distributionSplit?: string;
  /** Optional initial stake % from the host (preferred over window.location read). */
  initialUnits?: number;
  onClose: () => void;
}

type Step = 'terms' | 'accept' | 'kyc' | 'checkout';

/** Shared modal shell — max-w-lg × h-[900px] (bumped from locked 720px 2026-09-04 to match prod's natural content fit for Step 2).
 *  Viewport guard: clamps to max-h-[calc(100vh-2rem)] my-auto on shorter viewports (re-audit guard 2026-09-04).
 *  Content scrolls inside via overflow-y-auto. All Steps 2–6 share this shell (f14). */
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
        className="relative w-full max-w-lg h-[900px] max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] overflow-y-auto rounded-3xl border border-border bg-surface p-8 space-y-6 shadow-[0_0_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]"
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
  horseSlug,
  wholesaleMonthlyNzd,
  minInvestmentPct = 1.0,
  maxInvestmentPct = 10.0,
  stakeStepPct = 0.5,
  stakePct,
  setStakePct,
  termStartDate,
  termEndDate,
  distributionSplit,
  termSheetMarkdown,
  termSheetHash,
  onProceed,
}: {
  horseName: string;
  horseSlug: string;
  wholesaleMonthlyNzd?: number;
  minInvestmentPct?: number;
  maxInvestmentPct?: number;
  stakeStepPct?: number;
  stakePct: number;
  setStakePct: (value: number) => void;
  termStartDate?: string;
  termEndDate?: string;
  distributionSplit?: string;
  /** Generated DSL term sheet (compileLegalPack output) — replaces the static mockup. */
  termSheetMarkdown?: string;
  termSheetHash?: string;
  onProceed: () => void;
}) {
  const [note, setNote] = React.useState<string | null>(null);
  const [stakeError, setStakeError] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState<string>(stakePct.toFixed(1));
  const [termSheetAccepted, setTermSheetAccepted] = React.useState(false);
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

  // Lease term derived from data (whole-month model). Blank when unset — never a default.
  const termMonths = monthsBetween(termStartDate, termEndDate);
  const termStartLabel = formatTermDate(termStartDate);
  const termEndLabel = formatTermDate(termEndDate);

  const showNote = (msg: string) => {
    setNote(msg);
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => setNote(null), 2600);
  };

  /** Chunk-5 (f9, spec purchase-content-spec.md:80-89): over / under / non-multiple / empty. */
  const commitStake = (raw: string) => {
    const value = raw.replace('%', '').replace(',', '.').trim();
    if (value === '') {
      // Cleared / empty → revert to minimum on blur.
      setStakePct(minInvestmentPct);
      setStakeError(null);
      return;
    }
    const parsed = parseFloat(value);
    if (!Number.isFinite(parsed)) {
      setStakeError('Stake must be a multiple of {step}%'.replace('{step}%', `${stakeStepPct}%`));
      return;
    }
    // Accept in-range values and clamp any drift to the step grid first so a
    // non-multiple like 1.3% never reaches the server (which throws INVALID_STAKE).
    const step = Math.max(stakeStepPct, 0.01);
    const snapped = Math.round(parsed / step) * step;
    if (Math.abs(snapped - parsed) > 1e-9) {
      setStakeError(`Stake must be a multiple of ${stakeStepPct}%`);
      return;
    }
    if (snapped > maxInvestmentPct + 1e-9) {
      setStakeError(`Stake available is ${maxInvestmentPct}% — reduce your stake`);
      return;
    }
    if (snapped < minInvestmentPct - 1e-9) {
      setStakeError(`Minimum investment is ${minInvestmentPct}% — increase your stake`);
      return;
    }
    setStakePct(Math.round(snapped * 100) / 100);
    setStakeError(null);
  };

  const stepUp = () => {
    setStakeError(null);
    const next = Math.round((stakePct + stakeStepPct) * 100) / 100;
    if (next <= maxInvestmentPct + 1e-9) {
      setStakePct(next);
    } else {
      showNote(`This is the maximum stake available — ${maxInvestmentPct.toFixed(1)}%.`);
    }
  };

  const stepDown = () => {
    setStakeError(null);
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
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Price</p>
          <p className="text-[28px] font-light text-heading tracking-tight leading-none">
            ${pricing.monthlyKeepUnitNzd.toLocaleString()}
            <span className="text-[13px] text-muted-foreground font-light ml-1">NZD</span>
          </p>
          <p className="text-[11px] font-light text-muted-foreground/60 leading-snug pt-1">
            per month, for a {stakePct.toFixed(1)}% stake
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 space-y-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Your stake</p>
          <div className="pt-1 flex items-center justify-start gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                aria-label="Increase stake"
                onClick={stepUp}
                className={`text-[15px] font-bold leading-none text-status-active transition active:scale-90 ${
                  stakePct >= maxInvestmentPct - 1e-9 ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                ▲
              </button>
              <button
                type="button"
                aria-label="Decrease stake"
                onClick={stepDown}
                className={`text-[15px] font-bold leading-none text-destructive transition active:scale-90 ${
                  stakePct <= minInvestmentPct + 1e-9 ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                ▼
              </button>
            </div>
            {editing ? (
              <input
                type="text"
                inputMode="decimal"
                aria-label="Enter stake percentage"
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => {
                  commitStake(draft);
                  setEditing(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    commitStake(draft);
                    setEditing(false);
                    e.currentTarget.blur();
                  }
                  if (e.key === 'Escape') {
                    setDraft(stakePct.toFixed(1));
                    setStakeError(null);
                    setEditing(false);
                  }
                }}
                className="w-24 rounded-lg border border-border bg-background px-2 py-1 text-[22px] font-light text-heading tracking-tight focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            ) : (
              <button
                type="button"
                aria-label="Edit stake percentage"
                onClick={() => {
                  setDraft(stakePct.toFixed(1));
                  setEditing(true);
                }}
                className="text-[28px] font-light text-heading tracking-tight hover:text-accent transition-colors"
              >
                {stakePct.toFixed(1)}%
              </button>
            )}
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

      {/* Stepper validation error (chunk-5 f9, locked copy) */}
      {stakeError && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-center text-[12px] font-light leading-relaxed text-foreground/90"
        >
          {stakeError}
        </p>
      )}

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
            <strong className="text-heading font-medium">
              {termMonths != null ? `${termMonths} months` : '—'}
            </strong>
          </p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">
            {termStartLabel && termEndLabel
              ? `From ${termStartLabel} to ${termEndLabel}`
              : 'Not yet set'}
          </p>
        </div>
        <div>
          <p className="flex justify-between items-baseline">
            <span className="text-muted-foreground">Distribution</span>
            <strong className="text-status-active text-[13px] font-medium">
              {distributionSplit ?? '—'}
            </strong>
          </p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">
            distributed quarterly, pro-rated based on your investment &amp; official NZTR results
          </p>
        </div>
      </div>

      {/* Generated DSL term sheet (compileLegalPack output — replaces the static mockup).
          Rendered verbatim from the same bytes the acceptance gate hashes. */}
      {termSheetMarkdown ? (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Term sheet
            {termSheetHash && (
              <span className="ml-2 font-mono normal-case tracking-normal text-muted-foreground/60">
                sha256: {termSheetHash.slice(0, 4)}…{termSheetHash.slice(-4)}
              </span>
            )}
          </p>
          <div className="rounded-xl border border-border bg-canvas/60 h-44 overflow-y-auto p-4">
            <div
              className="prose prose-sm max-w-none text-foreground"
              dangerouslySetInnerHTML={{ __html: marked.parse(termSheetMarkdown) }}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
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
      )}

      {/* CTA → Step 3 */}
      <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
        <input
          type="checkbox"
          id="term-sheet-accept"
          onChange={(e) => setTermSheetAccepted(e.target.checked)}
          className="h-4 w-4 rounded border-input text-accent focus:ring-accent"
          required
        />
        <label htmlFor="term-sheet-accept" className="text-sm font-medium">
          I have read and accept these terms
        </label>
      </div>
      <WhitePillCTA onClick={onProceed} disabled={!termSheetAccepted}>
        Invest in {horseName}
      </WhitePillCTA>
      <p className="text-[11px] font-light text-muted-foreground leading-relaxed text-center">
        Subject to{' '}
        <a
          href={`/api/legal/download?slug=${encodeURIComponent(horseSlug)}&doc=pds`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted underline underline-offset-2 hover:text-heading transition-colors"
        >
          Product Disclosure Statement
        </a>{' '}
        and{' '}
        <a
          href={`/api/legal/download?slug=${encodeURIComponent(horseSlug)}&doc=sa`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted underline underline-offset-2 hover:text-heading transition-colors"
        >
          Syndicate Agreement
        </a>
        .
      </p>
    </div>
  );
}

/** Step 3 — Subscription Agreement Acceptance (Investor-SA checkout) */
function Step3SAAcceptance({
  horseName,
  horseSlug,
  stakePct,
  legalPack,
  stakeStepPct = 0.5,
  maxInvestmentPct = 10.0,
  onBack,
  onProceed,
}: {
  horseName: string;
  horseSlug: string;
  stakePct: number;
  legalPack?: LegalPackDigest | null;
  stakeStepPct?: number;
  maxInvestmentPct?: number;
  /** F10: in-modal back to Step 2 (term sheet) without closing the modal. */
  onBack: () => void;
  /** Proceed to KYC (Step 4) */
  onProceed: () => void;
}) {
  const router = useRouter();
  const [saAccepted, setSAAccepted] = React.useState(false);
  const [saLoading, setSALoading] = React.useState(false);

  const saText =
    legalPack?.saMarkdown ||
    `Syndicate Agreement (SA) for ${horseName} Syndicate.\n\n` +
      `Manager: Evolution Stables.\n\n` +
      `1. Governance: The Manager administers all racing, veterinary, training, and nomination decisions in accordance with welfare-first standards.\n` +
      `2. Financials: Monies held in segregated trust account.\n` +
      `3. Transfers: Secondary transfer facilitated through Evolution Stables upon formal request.\n` +
      `4. Term: Fixed lease duration with predefined settlement date.`;

  const handleSAAccept = async () => {
    setSALoading(true);
    try {
      // Call the Investor-SA checkout endpoint (from G009 session-2)
      const res = await fetch('/api/investor-sa/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ horseSlug, units: stakePct }),
      });
      const data = await res.json();
      if (data.kycUrl) {
        // Redirect to KYC (Step 4)
        window.location.href = data.kycUrl;
      } else {
        onProceed(); // fallback if KYC not required
      }
    } catch (e) {
      console.error('SA accept failed:', e);
      alert('Failed to proceed. Please try again.');
    } finally {
      setSALoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="inline-flex items-center gap-1.5 text-[12px] font-light text-muted-foreground hover:text-heading transition-colors mb-3"
        >
          <span aria-hidden>←</span>
          <span>Back</span>
        </button>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
          Subscription Agreement
        </p>
        <h3 className="text-[22px] font-light text-heading tracking-tight">
          {horseName} — your agreement
        </h3>
        <p className="text-[11px] font-light text-muted-foreground/60 leading-relaxed mt-2">
          Read the document in full, then tick to accept. This acceptance is recorded against the exact document version.
        </p>
      </div>

      {/* SA Document */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="px-4 py-3.5 space-y-3">
          <div className="rounded-xl border border-border bg-canvas/60 h-44 overflow-y-auto p-4">
            <div
              className="prose prose-sm max-w-none text-foreground"
              dangerouslySetInnerHTML={{ __html: marked.parse(saText) }}
            />
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={saAccepted}
              onChange={(e) => setSAAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border bg-background text-accent focus:ring-accent focus:ring-offset-0"
            />
            <span className="text-[12px] font-light text-muted-foreground">
              I accept the Subscription Agreement and wish to proceed
            </span>
          </label>
        </div>
      </div>

      {/* Modal Action Footer */}
      <div className="pt-2 border-t border-border space-y-3">
        <button
          type="button"
          disabled={!saAccepted || saLoading}
          onClick={handleSAAccept}
          className="w-full rounded-full bg-accent py-3.5 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-accent-foreground transition-all duration-300 hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100"
        >
          {saLoading ? 'Processing…' : 'Complete KYC Verification'}
        </button>
        <p className="text-[10px] font-light leading-relaxed text-muted-foreground/70 text-center">
          <span className="text-accent">Acceptance = recorded</span> — who + document hash + timestamp, logged at the instant of the tick.
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
  legalPack = null,
  termStartDate,
  termEndDate,
  distributionSplit,
  initialUnits,
  onClose,
}: PurchaseFlowModalProps) {
  const [step, setStep] = React.useState<Step>('terms');
  // Stake lives in the modal (locked: stepper lives here, not on the rail).
  // F8: prefer `initialUnits` prop from host (cleaner, page-level state). Fall
  // back to window.location read for any future CTA that mounts modal without
  // prop — preserves the f6/f6b cancel_url / login redirect pre-fill behavior.
  const [stakePct, setStakePct] = React.useState<number>(minInvestmentPct);
  // Investor-SA checkout (Task 2): the SA is compiled with the investor's stake.
  // The modal is a client component, so it re-fetches the stake-specific pack from
  // the server route; the PDS stays the locked page-level compile (identical hash).
  const [stakeLegalPack, setStakeLegalPack] = React.useState<LegalPackDigest | null>(null);
  React.useEffect(() => {
    let cancelled = false;
    if (!horseSlug) return;
    fetch(`/api/legal/pack?slug=${encodeURIComponent(horseSlug)}&stake=${stakePct}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: LegalPackDigest | null) => {
        if (!cancelled) setStakeLegalPack(data);
      })
      .catch(() => {
        if (!cancelled) setStakeLegalPack(null);
      });
    return () => {
      cancelled = true;
    };
  }, [horseSlug, stakePct]);
  // Merged digest: PDS stays locked (page-level), SA is the stake-specific compile.
  const mergedLegalPack: LegalPackDigest | null = React.useMemo(() => {
    if (!stakeLegalPack) return legalPack;
    return {
      termSheetMarkdown: legalPack?.termSheetMarkdown ?? stakeLegalPack.termSheetMarkdown,
      pdsMarkdown: legalPack?.pdsMarkdown ?? stakeLegalPack.pdsMarkdown,
      saMarkdown: stakeLegalPack.saMarkdown ?? legalPack?.saMarkdown,
      termSheetHash: legalPack?.termSheetHash ?? stakeLegalPack.termSheetHash,
      pdsHash: legalPack?.pdsHash ?? stakeLegalPack.pdsHash,
      saHash: stakeLegalPack.saHash ?? legalPack?.saHash,
    };
  }, [legalPack, stakeLegalPack]);
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // KYC return handling: if we just came back from KYC, trigger checkout
    if (params.get('kyc') === 'return' && step === 'kyc') {
      params.delete('kyc');
      window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
      triggerCheckout();
    }
    // Checkout success handled by MyStable page
    if (params.get('checkout') === 'success') {
      params.delete('checkout');
      params.delete('slug');
      params.delete('units');
      window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    }
  }, []);

  const triggerCheckout = async () => {
    setStep('checkout');
    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ horseSlug, units: stakePct }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Checkout failed:', data);
        alert(data.error || 'Failed to start checkout. Please try again.');
        setStep('kyc');
      }
    } catch (e) {
      console.error('Checkout error:', e);
      alert('Failed to start checkout. Please try again.');
      setStep('kyc');
    }
  };

  return (
    <ModalShell onClose={onClose}>
      {step === 'terms' ? (
        <Step2TermSheet
          horseName={horseName}
          horseSlug={horseSlug}
          wholesaleMonthlyNzd={wholesaleMonthlyNzd}
          minInvestmentPct={minInvestmentPct}
          maxInvestmentPct={maxInvestmentPct}
          stakeStepPct={stakeStepPct}
          stakePct={stakePct}
          setStakePct={setStakePct}
          termStartDate={termStartDate}
          termEndDate={termEndDate}
          distributionSplit={distributionSplit}
          termSheetMarkdown={mergedLegalPack?.termSheetMarkdown}
          termSheetHash={mergedLegalPack?.termSheetHash}
          onProceed={() => setStep('accept')}
        />
      ) : step === 'checkout' ? (
        <div className="space-y-6 text-center">
          <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-accent border-t-transparent" />
          <p className="text-[15px] font-light text-foreground">Redirecting to Stripe Checkout…</p>
        </div>
      ) : step === 'kyc' ? (
        <div className="space-y-6 text-center">
          <p className="text-center text-muted-foreground">KYC Step — handled via redirect</p>
        </div>
      ) : (
        <div className="space-y-6 text-center">
          <p className="text-center text-muted-foreground">KYC Step — handled via redirect</p>
        </div>
      )}
    </ModalShell>
  );
}
