/* PurchaseFlowModal — Steps 2–6 host (chunk-2: Step 2 term sheet; chunk-3: Step 3 gate).
 *
 * Locked rules (C5 port of the flow-mockups lock, 2026-09-11 — mockups are the visual spec):
 * - Modal shell: max-w-lg × h-[900px] locked frame, never scrolls; overlay above nav (z-10000).
 * - Step 2 = terms summary only (no tick; CTA always live); term-sheet doc lives in Step 3.
 * - Step 3 = PDS→SA accordion: scroll-gated in-doc tick, auto-collapse COMPLETE, NZTR 4 ticks,
 *   sign-from-login, ticks lock; Next (KYC) gates on both docs.
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
import { useAuth } from '@/lib/use-auth';
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
export function monthsBetween(startIso?: string, endIso?: string): number | null {
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

/** Shared modal shell — max-w-lg × h-[900px] locked frame for all Steps 2–6 (C5 port of mockup lock).
 *  Viewport guard: clamps to max-h-[calc(100vh-2rem)] on shorter viewports.
 *  The shell NEVER scrolls (overflow-hidden flex-col): progress/top pinned, each step owns a
 *  flex-1 middle zone, footers pinned. Overlay sits above the nav (z-[10000] > NavBar z-[9999]). */
function ModalShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Scroll lock: while any flow popup is open the wheel belongs to the popup,
  // never the page behind it.
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/85 p-4 sm:p-6 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg h-[900px] max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] overflow-hidden flex flex-col rounded-3xl border border-border bg-surface p-8 space-y-6 shadow-[0_0_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]"
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
  termSheetHash,
  onProceed,
  onBack,
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
  /** In-modal back (Step 2 → horse page: closes the modal). */
  onBack: () => void;
}) {
  const [note, setNote] = React.useState<string | null>(null);
  const [stakeError, setStakeError] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState<string>(stakePct.toFixed(1));
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
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden space-y-6">
      <div className="flex-1 min-h-0 overflow-y-auto space-y-6">
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

      </div>

      {/* Modal Action Footer — pinned. Step 2 = terms summary only (mockup lock);
          PDS/SA live in Step 3's accordion; the hash rides here as the audit trail. */}
      <div className="pt-2 border-t border-border space-y-3 shrink-0">
      {termSheetHash && (
        <p className="font-mono text-[10px] text-muted-foreground/60">
          sha256: {termSheetHash.slice(0, 4)}…{termSheetHash.slice(-4)}
        </p>
      )}

      {/* CTA → Step 3 (acceptance lives only in Step 3 — always live). */}
      <WhitePillCTA onClick={onProceed}>
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
    </div>
  );
}

/** Step 3 — Subscription Agreement Acceptance (C5: two-doc accordion port of the mockup lock).
 *  PDS auto-opens; scroll-to-bottom enables the in-doc tick; ticking auto-collapses the panel
 *  to COMPLETE and opens SA (same pattern + 4 NZTR declaration ticks). Next (KYC) gates on
 *  both docs. Ticks lock after signing — re-opening is read-only. Identity from useAuth. */
const NZTR_DECLARATIONS = [
  'I am at least 18 years of age.',
  'I am not subject to any racing disqualification or exclusion order.',
  'I have provided verified proof of identity acceptable to the Syndicate Manager.',
  'I understand participation is strictly as a leaseholder and confers no direct ownership.',
];

function Step3SAAcceptance({
  horseName,
  horseSlug,
  stakePct,
  legalPack,
  onBack,
  onProceed,
}: {
  horseName: string;
  horseSlug: string;
  stakePct: number;
  legalPack?: LegalPackDigest | null;
  /** F10: in-modal back to Step 2 (term sheet) without closing the modal. */
  onBack: () => void;
  /** Proceed to KYC (Step 4) — fallback when the accept endpoint returns no kycUrl. */
  onProceed: () => void;
}) {
  const { user } = useAuth();
  const profileName = user?.displayName ?? 'Investor';
  const [saLoading, setSALoading] = React.useState(false);
  const [openPanel, setOpenPanel] = React.useState<'pds' | 'sa'>('pds');
  const [pdsTickOn, setPdsTickOn] = React.useState(false);
  const [saTickOn, setSaTickOn] = React.useState(false);
  const [pdsComplete, setPdsComplete] = React.useState(false);
  const [saComplete, setSaComplete] = React.useState(false);
  const [decls, setDecls] = React.useState<boolean[]>([false, false, false, false]);

  const pdsHtml = React.useMemo(
    () => marked.parse(legalPack?.pdsMarkdown ?? ''),
    [legalPack],
  );
  const saHtml = React.useMemo(
    () => marked.parse(legalPack?.saMarkdown ?? ''),
    [legalPack],
  );

  const handleDocScroll =
    (doc: 'pds' | 'sa') => (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
        if (doc === 'pds') setPdsTickOn(true);
        else setSaTickOn(true);
      }
    };

  const toggleDecl = (i: number) =>
    setDecls((prev) => prev.map((v, j) => (j === i ? !v : v)));

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

  const renderPanel = (
    which: 'pds' | 'sa',
    title: string,
    status: string,
    statusDone: boolean,
    docHtml: string | Promise<string>,
    onScroll: (e: React.UIEvent<HTMLDivElement>) => void,
    tickBlock: React.ReactNode,
  ) => {
    const open = openPanel === which;
    const locked = which === 'sa' && !pdsComplete;
    return (
      <div
        className={`rounded-xl border border-border bg-surface overflow-hidden flex flex-col ${
          open ? 'flex-1 min-h-0' : 'shrink-0'
        }`}
      >
        <button
          type="button"
          onClick={() => {
            if (!locked) setOpenPanel(which);
          }}
          aria-expanded={open}
          disabled={locked}
          className="w-full px-4 py-3.5 flex items-center justify-between gap-4 text-left shrink-0 disabled:cursor-not-allowed"
        >
          <span className="font-medium text-heading">{title}</span>
          <span
            className={`text-[11px] font-medium ${
              statusDone ? 'text-status-active' : 'text-muted-foreground'
            }`}
          >
            {status}
          </span>
        </button>
        <div
          className={`grid transition-all duration-300 ${
            open ? 'grid-rows-[1fr] opacity-100 flex-1 min-h-0' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden min-h-0 flex flex-col px-4 pb-4">
            <div className="rounded-xl border border-border overflow-hidden flex-1 min-h-0 flex flex-col bg-white">
              <div
                onScroll={onScroll}
                className="prose prose-sm max-w-none p-4 overflow-y-auto flex-1 min-h-0 doc-light"
              >
                <div dangerouslySetInnerHTML={{ __html: docHtml as string }} />
                {tickBlock}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const tickBoxClass =
    'mt-0.5 h-4 w-4 rounded border-border bg-white text-accent focus:ring-accent focus:ring-offset-0 disabled:opacity-60 disabled:cursor-not-allowed';

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden space-y-6">
      <style>{`
        .doc-light { background: #fff; color: #111; }
        .doc-light h1, .doc-light h2, .doc-light h3 { color: #111; }
        .doc-light strong { color: #111; }
        .doc-light th { background: #f5f5f5; }
        .doc-light th, .doc-light td { border-color: #ddd; }
        .doc-light input[type="checkbox"] { accent-color: #b98a2f; }
        .doc-light .prose { font-size: 10px; line-height: 1.7; text-align: justify; }
        .doc-light .prose p, .doc-light .prose ul, .doc-light .prose table { margin-bottom: 1em; }
        .doc-light .prose h1, .doc-light .prose h2 { font-size: 12px; font-weight: 700; margin-top: 1em; margin-bottom: 0.5em; text-align: left; }
        .doc-light .prose h3 { font-size: 10px; font-weight: 800; margin-top: 1em; margin-bottom: 0.5em; text-align: left; letter-spacing: 0.02em; text-transform: uppercase; }
      `}</style>
      <div className="shrink-0">
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
          {horseName} — your documents
        </h3>
        <p className="text-[11px] font-light text-muted-foreground/60 leading-relaxed mt-2">
          Read each document in full. Scroll to bottom to reveal the agreement tick. Both must
          be COMPLETE to proceed.
        </p>
      </div>

      {/* Two-doc accordion — flex-fills the middle; footer always pinned. */}
      <div className="flex-1 min-h-0 overflow-hidden space-y-3 flex flex-col">
        {renderPanel(
          'pds',
          'Product Disclosure Statement',
          pdsComplete ? 'PDS ✓ COMPLETE' : pdsTickOn ? 'Agree to proceed' : 'Reading…',
          pdsComplete,
          pdsHtml,
          handleDocScroll('pds'),
          <div
            className={`mt-6 rounded-xl border p-4 transition-opacity ${
              pdsTickOn ? 'opacity-100' : 'opacity-40'
            }`}
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                disabled={!pdsTickOn || pdsComplete}
                checked={pdsComplete}
                onChange={() => {
                  setPdsComplete(true);
                  setOpenPanel('sa');
                }}
                className={tickBoxClass}
              />
              <span className="text-[12px] font-light text-[#333]">
                I, <strong className="text-black">{profileName}</strong>, agree to be bound by
                this document
              </span>
            </label>
          </div>,
        )}
        {renderPanel(
          'sa',
          'Syndicate Agreement',
          saComplete
            ? 'SA ✓ COMPLETE'
            : !pdsComplete
              ? 'Locked'
              : saTickOn
                ? 'Agree to proceed'
                : 'Reading…',
          saComplete,
          saHtml,
          handleDocScroll('sa'),
          <div
            className={`mt-6 rounded-xl border p-4 space-y-3 transition-opacity ${
              saTickOn ? 'opacity-100' : 'opacity-40'
            }`}
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#555]">
              Schedule 1 — NZTR Statutory Member Declarations
            </p>
            {NZTR_DECLARATIONS.map((text, i) => (
              <label key={i} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!saTickOn || saComplete}
                  checked={decls[i]}
                  onChange={() => toggleDecl(i)}
                  className={tickBoxClass}
                />
                <span className="text-[12px] font-light text-[#333]">{text}</span>
              </label>
            ))}
            <label className="flex items-start gap-3 cursor-pointer border-t border-[#ddd] pt-3">
              <input
                type="checkbox"
                disabled={!saTickOn || saComplete || !decls.every(Boolean)}
                checked={saComplete}
                onChange={() => setSaComplete(true)}
                className={tickBoxClass}
              />
              <span className="text-[12px] font-light text-[#333]">
                I, <strong className="text-black">{profileName}</strong>, agree to be bound by
                this document
              </span>
            </label>
          </div>,
        )}
      </div>

      {/* Modal Action Footer — pinned. Next gates on both docs COMPLETE. */}
      <div className="pt-2 border-t border-border space-y-3 shrink-0">
        <WhitePillCTA
          onClick={handleSAAccept}
          disabled={!(pdsComplete && saComplete) || saLoading}
        >
          {saLoading ? 'Processing…' : 'Next (KYC)'}
        </WhitePillCTA>
        <p className="text-[10px] font-light leading-relaxed text-muted-foreground/70 text-center">
          <span className="text-accent">Acceptance = recorded</span> — who + document hash +
          timestamp, logged at the instant of the tick.
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
          onBack={onClose}
        />
      ) : step === 'accept' ? (
        <Step3SAAcceptance
          horseName={horseName}
          horseSlug={horseSlug}
          stakePct={stakePct}
          legalPack={mergedLegalPack}
          onBack={() => setStep('terms')}
          onProceed={() => setStep('kyc')}
        />
      ) : step === 'checkout' ? (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-6 text-center">
          <button
            type="button"
            onClick={() => setStep('kyc')}
            aria-label="Back"
            className="inline-flex items-center gap-1.5 text-[12px] font-light text-muted-foreground hover:text-heading transition-colors mb-3"
          >
            <span aria-hidden>←</span>
            <span>Back</span>
          </button>
          <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-accent border-t-transparent" />
          <p className="text-[15px] font-light text-foreground">Redirecting to Stripe Checkout…</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-6 text-center">
          <button
            type="button"
            onClick={() => setStep('accept')}
            aria-label="Back"
            className="inline-flex items-center gap-1.5 text-[12px] font-light text-muted-foreground hover:text-heading transition-colors mb-3"
          >
            <span aria-hidden>←</span>
            <span>Back</span>
          </button>
          <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-accent border-t-transparent" />
          <p className="text-[15px] font-light text-foreground">
            Redirecting to Stripe Identity for KYC verification…
          </p>
          <p className="text-[12px] text-muted-foreground">
            This is a one-time check under New Zealand AML/CFT law.
          </p>
        </div>
      )}
    </ModalShell>
  );
}
