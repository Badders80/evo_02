'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';
import {
  type HorseCampaign,
  getCampaignMedia,
  getCampaignPricing,
  getCompiledLegalPackForCampaign,
} from '@/lib/horses-data';
import type { KycStatus } from '@evo/db_models/types';
import {
  Sparkles,
  ShieldCheck,
  FileText,
  Download,
  CreditCard,
  Layers,
  ArrowRight,
  TrendingUp,
  LogOut,
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
    return { text: 'Verified', className: 'text-emerald-400' };
  }
  if (status === 'pending') {
    return { text: 'Pending', className: 'text-amber-400' };
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

  const rows = holdings
    .map((holding) => {
      const campaign = campaigns?.[holding.horse_id];
      return campaign ? { holding, campaign } : null;
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  const totalFloat = rows.reduce((sum, row) => sum + Number(row.holding.float_balance_nzd), 0);
  const totalKeep = rows.reduce((sum, row) => sum + Number(row.holding.monthly_keep_rate_nzd), 0);

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-6 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-mono tracking-[0.2em] uppercase text-accent">
            <Sparkles className="h-3 w-3" />
            <span>Evolution Investor Portal</span>
          </div>
          <h1 className="mt-3 text-3xl sm:text-4xl font-light tracking-tight text-foreground">
            My<span className="font-serif italic text-accent">Stables</span> Dashboard
          </h1>
          <p className="mt-1 text-xs font-mono text-muted-foreground">
            Authenticated Account: <span className="text-foreground">{userEmail}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs">
            <ShieldCheck className={`h-4 w-4 ${kyc.className}`} />
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-mono">KYC Status</span>
              <span className={`font-medium ${kyc.className}`}>{kyc.text}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:border-destructive/40 hover:bg-destructive/10 transition-all"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {lookupError && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-xs text-destructive-foreground">
          Holdings could not be loaded: {lookupError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs uppercase font-mono tracking-wider">Active Syndicates</span>
            <Layers className="h-4 w-4 text-accent" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold font-mono text-foreground">{rows.length}</span>
            <span className="text-xs text-muted-foreground">Thoroughbred{rows.length === 1 ? '' : 's'}</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs uppercase font-mono tracking-wider">Float Deposit Held</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-semibold font-mono text-foreground">${totalFloat.toLocaleString()}</span>
            <span className="text-xs font-mono text-muted-foreground">NZD</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs uppercase font-mono tracking-wider">Monthly Keep</span>
            <CreditCard className="h-4 w-4 text-accent" />
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-semibold font-mono text-accent">${totalKeep.toLocaleString()}</span>
            <span className="text-xs font-mono text-muted-foreground">/mo</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs uppercase font-mono tracking-wider">Prize Payouts (75%)</span>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-semibold font-mono text-foreground">$0.00</span>
            <span className="text-xs font-mono text-muted-foreground">NZD</span>
          </div>
        </div>
      </div>

      <div className="flex border-b border-border">
        {(['holdings', 'feed', 'vault', 'billing'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-4 text-xs uppercase font-mono tracking-wider transition-all border-b-2 ${
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
            <div className="rounded-2xl border border-border bg-card p-10 text-center space-y-4">
              <h3 className="text-lg font-medium text-foreground">No syndicate holdings yet</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                After a verified checkout, your share of Lady Ketchikan (Nellie) will appear here. Other campaigns stay
                visible, not buyable.
              </p>
              <Link
                href="/horses/nellie"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-canvas hover:bg-accent-hover transition-all"
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
                        <span className="rounded-md border border-emerald-900/60 bg-emerald-950/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-mono text-emerald-400">
                          {holding.status}
                        </span>
                      </div>
                    </div>
                    <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono uppercase tracking-[0.2em] text-accent">
                            {campaign.pedigree.gender} · {campaign.pedigree.sire} × {campaign.pedigree.dam}
                          </span>
                          <span className="text-xs font-mono text-muted-foreground">
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
                          <span className="text-[10px] uppercase font-mono text-muted-foreground block">Your Stake</span>
                          <span className="text-lg font-mono font-semibold text-accent">
                            {Number(holding.stake_percentage).toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-mono text-muted-foreground block">Monthly Keep</span>
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
            ? 'Yard memos appear after you hold a syndicate unit.'
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
                    <p className="text-[11px] font-mono text-amber-400">
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
