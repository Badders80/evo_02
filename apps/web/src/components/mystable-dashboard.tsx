'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  type HorseCampaign,
  getCampaignMedia,
  getCampaignPricing,
  getCompiledLegalPackForCampaign,
} from '@/lib/horses-data';
import type { KycStatus } from '@evo/db_models/types';
import {
  ShieldCheck,
  FileText,
  Download,
  CreditCard,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export type MyStableHolding = {
  id: string;
  horse_id: string;
  stake_percentage: number;
  float_balance_nzd: number;
  monthly_keep_rate_nzd: number;
  status: string;
  signed_pds_hash: string;
  signed_sa_hash: string;
};

export type MyStableDashboardCampaigns = Record<string, HorseCampaign>;

function kycLabel(status: KycStatus | string): { text: string; className: string } {
  if (status === 'verified') {
    return { text: 'Verified', className: 'text-status-active' };
  }
  if (status === 'pending') {
    return { text: 'Pending', className: 'text-status-pending' };
  }
  if (status === 'rejected') {
    return { text: 'Rejected', className: 'text-destructive' };
  }
  return { text: 'Unverified', className: 'text-muted-foreground' };
}

export function MyStableDashboard({
  userEmail,
  kycStatus,
  holdings,
  lookupError,
  campaigns,
}: {
  userEmail: string;
  kycStatus: KycStatus | string;
  holdings: MyStableHolding[];
  lookupError?: string | null;
  campaigns?: MyStableDashboardCampaigns;
}) {
  const [activeTab, setActiveTab] = useState<'holdings' | 'feed' | 'vault' | 'billing'>('holdings');
  const kyc = kycLabel(kycStatus);

  // f8 (audit 2026-09-03): checkout success state — success_url lands here with
  // ?checkout=success&slug=&units=. Read in useEffect (SSR-safe: a useState
  // initializer would see window undefined on the server and never re-run).
  const [checkoutSuccess, setCheckoutSuccess] = useState<{ slug: string; units: string } | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      setCheckoutSuccess({ slug: params.get('slug') ?? '', units: params.get('units') ?? '' });
    }
  }, []);
  const rows = holdings
    .map((holding) => {
      const campaign = campaigns?.[holding.horse_id];
      return campaign ? { holding, campaign } : null;
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  const totalFloat = rows.reduce((sum, row) => sum + Number(row.holding.float_balance_nzd), 0);
  const totalKeep = rows.reduce((sum, row) => sum + Number(row.holding.monthly_keep_rate_nzd), 0);

  return (
    <div className="mx-auto max-w-7xl px-12 pt-32 pb-24 md:px-16 lg:px-20 space-y-10">
      {/* C7+C8: typography + rhythm aligned with marketplace hero (pt-32,
          eyebrow + display H1 in tracking-tight, paragraph at 15/light).
          Local Sign Out removed (C1) — Header covers it. KYC pill kept
          as status chip on the right. */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-8 gap-6">
        <div>
          <p className="text-[11px] font-light uppercase tracking-[0.2em] text-muted-foreground">
            Private Dashboard
          </p>
          <h1 className="mt-4 text-[36px] font-light tracking-tight text-heading md:text-[48px] leading-[1.05]">
            MyStable
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] font-light leading-[1.7] text-muted-foreground">
            Authenticated as <span className="text-foreground">{userEmail}</span>. Active
            holdings, distributions, and legal pack for your stake.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs shrink-0">
          <ShieldCheck className={`h-4 w-4 ${kyc.className}`} />
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-medium tracking-[0.2em]">KYC Status</span>
            <span className={`font-medium ${kyc.className}`}>{kyc.text}</span>
          </div>
        </div>
      </div>

      {checkoutSuccess && (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-status-active/40 bg-status-active/10 p-6 shadow-[0_0_40px_rgba(16,185,129,0.08)]">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-status-active mt-0.5 shrink-0" />
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground leading-relaxed">
                Welcome to the syndicate — your {checkoutSuccess.units}% stake in {checkoutSuccess.slug} is being finalised.
              </p>
              <p className="text-xs font-light text-muted-foreground leading-relaxed">
                Your holding will appear here once settlement completes. A welcome email is on its way.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCheckoutSuccess(null)}
            aria-label="Dismiss"
            className="rounded-full p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {lookupError && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-xs text-destructive-foreground">
          Holdings could not be loaded: {lookupError}
        </div>
      )}

      {/* C4: stat cards chrome differentiates "has data" vs "no data".
          Empty state: greyer border, muted text, smaller figure, hint copy. */}
      {(() => {
        const hasHoldings = rows.length > 0;
        const cardBase = 'rounded-xl border bg-card p-5 transition-colors';
        const cardEmpty = `${cardBase} border-border/60 opacity-70`;
        const cardActive = `${cardBase} border-border`;
        return (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className={hasHoldings ? cardActive : cardEmpty}>
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs uppercase font-medium tracking-[0.2em]">Active Syndicates</span>
                <Layers className={`h-4 w-4 ${hasHoldings ? 'text-accent' : 'text-muted-foreground/60'}`} />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className={`text-2xl font-semibold font-mono ${hasHoldings ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {rows.length}
                </span>
                <span className="text-xs text-muted-foreground">Thoroughbred{rows.length === 1 ? '' : 's'}</span>
              </div>
              {!hasHoldings && (
                <p className="mt-2 text-[11px] font-light text-muted-foreground/80">No stakes held yet</p>
              )}
            </div>

            <div className={totalFloat > 0 ? cardActive : cardEmpty}>
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs uppercase font-medium tracking-[0.2em]">Float Deposit Held</span>
                <ShieldCheck className={`h-4 w-4 ${totalFloat > 0 ? 'text-status-active' : 'text-muted-foreground/60'}`} />
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className={`text-2xl font-semibold font-mono ${totalFloat > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                  ${totalFloat.toLocaleString()}
                </span>
                <span className="text-xs font-mono text-muted-foreground">NZD</span>
              </div>
              {totalFloat === 0 && (
                <p className="mt-2 text-[11px] font-light text-muted-foreground/80">Awaiting first checkout</p>
              )}
            </div>

            <div className={totalKeep > 0 ? cardActive : cardEmpty}>
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs uppercase font-medium tracking-[0.2em]">Monthly Keep</span>
                <CreditCard className={`h-4 w-4 ${totalKeep > 0 ? 'text-accent' : 'text-muted-foreground/60'}`} />
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className={`text-2xl font-semibold font-mono ${totalKeep > 0 ? 'text-accent' : 'text-muted-foreground'}`}>
                  ${totalKeep.toLocaleString()}
                </span>
                <span className="text-xs font-mono text-muted-foreground">/mo</span>
              </div>
              {totalKeep === 0 && (
                <p className="mt-2 text-[11px] font-light text-muted-foreground/80">No active keep</p>
              )}
            </div>

            <div className={cardEmpty}>
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs uppercase font-medium tracking-[0.2em]">Prize Distribution (75%)</span>
                <TrendingUp className="h-4 w-4 text-muted-foreground/60" />
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-semibold font-mono text-muted-foreground">$0.00</span>
                <span className="text-xs font-mono text-muted-foreground">NZD</span>
              </div>
              <p className="mt-2 text-[11px] font-light text-muted-foreground/80">First race pending</p>
            </div>
          </div>
        );
      })()}

      <div className="flex border-b border-border">
        {(['holdings', 'feed', 'vault', 'billing'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-4 text-xs uppercase font-medium tracking-[0.2em] transition-all border-b-2 ${
              activeTab === tab
                ? 'border-accent text-accent font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'holdings' && 'Active Holdings'}
            {tab === 'feed' && 'Yard Feed & Memos'}
            {tab === 'vault' && 'Legal Execution Vault'}
            {tab === 'billing' && 'Stripe Billing & Tax'}
          </button>
        ))}
      </div>

      {activeTab === 'holdings' && (
        <div className="space-y-6">
          {rows.length === 0 ? (
            /* C3: empty state shrunk to match the stat cards above (p-6, single-line copy, compact CTA) */
            <div className="rounded-xl border border-border bg-card p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-foreground">No syndicate holdings yet</h3>
                <p className="text-xs font-light text-muted-foreground max-w-xl">
                  After a verified checkout, your share of Lady Ketchikan (Nellie) appears here. Other campaigns stay
                  visible, not buyable.
                </p>
              </div>
              <Link
                href="/horses/nellie"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-canvas hover:bg-accent-hover transition-all shrink-0"
              >
                <span>View Nellie</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            rows.map(({ holding, campaign }) => {
              const media = getCampaignMedia(campaign.slug, campaign.trainer.slug);
              const pricing = getCampaignPricing(campaign, Number(holding.stake_percentage));
              return (
                <div key={holding.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="grid lg:grid-cols-12">
                    <div className="lg:col-span-4 relative aspect-[16/10] lg:aspect-auto min-h-[220px] bg-muted">
                      <div
                        className="h-full w-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${media.horse.heroConformation})` }}
                      />
                      <div className="absolute top-4 left-4">
                        <span className="rounded-md border border-status-active/40 bg-status-active/10 px-2.5 py-1 text-[11px] font-medium text-status-active">
                          {holding.status}
                        </span>
                      </div>
                    </div>
                    <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
                            {campaign.pedigree.gender} · {campaign.pedigree.sire} × {campaign.pedigree.dam}
                          </span>
                          <span className="text-xs font-medium text-muted-foreground">
                            Life #{campaign.pedigree.lifeNumber}
                          </span>
                        </div>
                        <h3 className="mt-1 text-2xl sm:text-3xl font-medium text-foreground">
                          {campaign.legalName}{' '}
                          <span className="text-muted-foreground text-lg">(&quot;{campaign.barnName}&quot;)</span>
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-border bg-background p-4">
                        <div>
                          <span className="text-[10px] uppercase font-medium tracking-[0.2em] text-muted-foreground block">Your Stake</span>
                          <span className="text-lg font-mono font-semibold text-accent">
                            {Number(holding.stake_percentage).toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-medium tracking-[0.2em] text-muted-foreground block">Monthly Keep</span>
                          <span className="text-lg font-mono font-semibold text-foreground">
                            ${Number(holding.monthly_keep_rate_nzd).toLocaleString()}/mo
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-mono text-muted-foreground block">Deposit Float</span>
                          <span className="text-lg font-mono font-semibold text-foreground">
                            ${Number(holding.float_balance_nzd).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-mono text-muted-foreground block">Join 5×M</span>
                          <span className="text-lg font-mono font-semibold text-purple-400">
                            ${pricing.joinFloatUnitNzd.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/horses/${campaign.slug}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-canvas hover:bg-accent-hover transition-all w-fit"
                      >
                        <span>View Thoroughbred Profile</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'feed' && (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          {rows.length === 0
            ? 'Yard memos appear after you hold a stake in a syndicate.'
            : 'No yard memos posted for your holdings yet.'}
        </div>
      )}

      {activeTab === 'vault' && (
        <div className="space-y-4">
          {rows.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              Executed PDS/SA hashes appear here after webhook settlement.
            </div>
          ) : (
            rows.map(({ holding, campaign }) => {
              const pack = getCompiledLegalPackForCampaign(campaign);
              return (
                <div key={holding.id} className="rounded-xl border border-border bg-card p-6 space-y-4">
                  <h3 className="text-lg font-medium text-foreground">{campaign.legalName}</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-border bg-background p-4 gap-4">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium text-foreground block">Product Disclosure Statement</span>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          SHA-256: {holding.signed_pds_hash}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`/api/legal/download?slug=${campaign.slug}&doc=pds`}
                      download
                      className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3.5 py-1.5 text-xs text-foreground hover:border-accent hover:text-accent transition-all"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-border bg-background p-4 gap-4">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium text-foreground block">Syndicate Agreement</span>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          SHA-256: {holding.signed_sa_hash}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`/api/legal/download?slug=${campaign.slug}&doc=sa`}
                      download
                      className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3.5 py-1.5 text-xs text-foreground hover:border-accent hover:text-accent transition-all"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                  {pack.pdsHash !== holding.signed_pds_hash && (
                    <p className="text-[11px] font-mono text-status-pending">
                      Holding hash differs from current compiler output. Vault stores the signed hash above.
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No Stripe billing portal on file. Card details appear after a paid checkout, not as demo data.
        </div>
      )}
    </div>
  );
}
