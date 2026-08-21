'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';
import {
  getAllCampaigns,
  getCampaignMedia,
  getCampaignPricing,
  getCompiledLegalPackForCampaign,
} from '@/lib/horses-data';
import {
  Sparkles,
  ShieldCheck,
  FileText,
  Download,
  ExternalLink,
  CreditCard,
  Play,
  Volume2,
  Layers,
  ArrowRight,
  TrendingUp,
  LogOut,
} from 'lucide-react';

export default function MyStablesPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'holdings' | 'feed' | 'vault' | 'billing'>('holdings');
  const campaigns = getAllCampaigns();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? 'investor@evolutionstables.nz');
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  // Canonical fixtures for Nellie holding
  const nellie = campaigns[0];
  const nellieMedia = getCampaignMedia(nellie.slug, nellie.trainer.slug);
  const nelliePricing = getCampaignPricing(nellie, 1.0);
  const nelliePack = getCompiledLegalPackForCampaign(nellie);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10 pb-24">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-6 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d4a964]/40 bg-[#d4a964]/10 px-3 py-1 text-xs font-mono tracking-[0.2em] uppercase text-[#d4a964]">
            <Sparkles className="h-3 w-3" />
            <span>Evolution Investor Portal</span>
          </div>
          <h1 className="mt-3 text-3xl sm:text-4xl font-light tracking-tight text-foreground">
            My<span className="font-serif italic text-[#d4a964]">Stables</span> Dashboard
          </h1>
          <p className="mt-1 text-xs font-mono text-muted-foreground">
            Authenticated Account: <span className="text-foreground">{userEmail}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-mono">KYC Status</span>
              <span className="font-medium text-emerald-400">Verified · Tier 1</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:border-red-900/60 hover:bg-red-950/30 transition-all"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Quick Stat Strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs uppercase font-mono tracking-wider">Active Syndicates</span>
            <Layers className="h-4 w-4 text-[#d4a964]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold font-mono text-foreground">1</span>
            <span className="text-xs text-muted-foreground">Thoroughbred</span>
          </div>
          <span className="mt-1 block text-[11px] text-muted-foreground font-mono">Lady Ketchikan (1.0%)</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs uppercase font-mono tracking-wider">Float Deposit Held</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-semibold font-mono text-foreground">${nelliePricing.joinFloatUnitNzd.toLocaleString()}</span>
            <span className="text-xs font-mono text-muted-foreground">NZD</span>
          </div>
          <span className="mt-1 block text-[11px] text-emerald-400 font-mono">5×M Reserve Protected</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs uppercase font-mono tracking-wider">Monthly Keep</span>
            <CreditCard className="h-4 w-4 text-[#d4a964]" />
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-semibold font-mono text-[#d4a964]">${nelliePricing.monthlyKeepUnitNzd.toLocaleString()}</span>
            <span className="text-xs font-mono text-muted-foreground">/mo</span>
          </div>
          <span className="mt-1 block text-[11px] text-muted-foreground font-mono">Next: 1st of month</span>
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
          <span className="mt-1 block text-[11px] text-muted-foreground font-mono">Pre-Training Phase</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab('holdings')}
          className={`pb-3 px-4 text-xs uppercase font-mono tracking-wider transition-all border-b-2 ${
            activeTab === 'holdings'
              ? 'border-[#d4a964] text-[#d4a964] font-medium'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Active Holdings
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('feed')}
          className={`pb-3 px-4 text-xs uppercase font-mono tracking-wider transition-all border-b-2 ${
            activeTab === 'feed'
              ? 'border-[#d4a964] text-[#d4a964] font-medium'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Yard Feed & Memos
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('vault')}
          className={`pb-3 px-4 text-xs uppercase font-mono tracking-wider transition-all border-b-2 ${
            activeTab === 'vault'
              ? 'border-[#d4a964] text-[#d4a964] font-medium'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Legal Execution Vault
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('billing')}
          className={`pb-3 px-4 text-xs uppercase font-mono tracking-wider transition-all border-b-2 ${
            activeTab === 'billing'
              ? 'border-[#d4a964] text-[#d4a964] font-medium'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Stripe Billing & Tax
        </button>
      </div>

      {/* TAB 1: Active Holdings */}
      {activeTab === 'holdings' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="grid lg:grid-cols-12">
              {/* Media Aspect Frame */}
              <div className="lg:col-span-4 relative aspect-[16/10] lg:aspect-auto min-h-[220px] bg-muted">
                <div
                  className="h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${nellieMedia.horse.heroConformation})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent lg:hidden" />
                <div className="absolute top-4 left-4">
                  <span className="rounded-md border border-emerald-900/60 bg-emerald-950/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-mono text-emerald-400">
                    Active Leasehold
                  </span>
                </div>
              </div>

              {/* Content Panel */}
              <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#d4a964]">
                      {nellie.pedigree.gender} · {nellie.pedigree.sire} × {nellie.pedigree.dam}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      Life #{nellie.pedigree.lifeNumber}
                    </span>
                  </div>

                  <h3 className="mt-1 text-2xl sm:text-3xl font-medium text-foreground">
                    {nellie.legalName} <span className="text-muted-foreground text-lg">("{nellie.barnName}")</span>
                  </h3>

                  <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Trained by <strong className="text-foreground">{nellie.trainer.name}</strong> at Cambridge Yard.
                    Currently in Phase 1 prep following yearling development at Bax Bloodstock.
                  </p>
                </div>

                {/* Financial Monospace Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-border bg-background p-4">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-muted-foreground block">Your Stake</span>
                    <span className="text-lg font-mono font-semibold text-[#d4a964]">1.0%</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-muted-foreground block">Monthly Keep</span>
                    <span className="text-lg font-mono font-semibold text-foreground">${nelliePricing.monthlyKeepUnitNzd}/mo</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-muted-foreground block">Deposit Float</span>
                    <span className="text-lg font-mono font-semibold text-foreground">${nelliePricing.joinFloatUnitNzd}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-muted-foreground block">Prize Cut</span>
                    <span className="text-lg font-mono font-semibold text-purple-400">75% Net</span>
                  </div>
                </div>

                {/* Action Links */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href={`/horses/${nellie.slug}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#d4a964] px-4 py-2 text-xs font-semibold text-[#0a0a0a] hover:bg-[#c39853] transition-all"
                  >
                    <span>View Thoroughbred Profile</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setActiveTab('feed')}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs font-medium text-foreground hover:border-[#d4a964] transition-all"
                  >
                    <Volume2 className="h-3.5 w-3.5 text-[#d4a964]" />
                    <span>Listen to Latest Yard Audio</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Yard Feed & Updates */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d4a964]/40 bg-[#d4a964]/10 text-[#d4a964]">
                  <Volume2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">Trainer Voice Memo: Early Trackwork Impressions</h4>
                  <span className="text-[11px] font-mono text-muted-foreground">Barbara Kennedy · Byerley Park · 2 days ago</span>
                </div>
              </div>
              <span className="text-xs font-mono text-[#d4a964] border border-[#d4a964]/40 bg-[#d4a964]/10 px-2.5 py-1 rounded-md">
                Audio Update
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              "Nellie settled in nicely over the weekend. Her action in the sand track this morning was very fluid, deep girth expanding well. We're keeping things light before stepping up to pace work next month."
            </p>

            <div className="rounded-lg border border-border bg-background p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d4a964] text-[#0a0a0a] hover:bg-[#c39853] transition-all"
                >
                  <Play className="h-4 w-4 ml-0.5" />
                </button>
                <div className="space-y-1">
                  <span className="text-xs font-mono text-foreground block">trackwork_memo_2026_08_15.mp3</span>
                  <span className="text-[10px] font-mono text-muted-foreground">01:42 · Recorded on site</span>
                </div>
              </div>
              <span className="text-xs font-mono text-muted-foreground">Cloudflare CDN ($0 Egress)</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Legal Execution Vault */}
      {activeTab === 'vault' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
              <div>
                <h3 className="text-lg font-medium text-foreground">Executed Syndicate Documents</h3>
                <p className="text-xs text-muted-foreground">
                  Statutory documents cryptographically frozen under NZTR COP 22.1.
                </p>
              </div>
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>

            <div className="space-y-4">
              {/* PDS Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-border bg-background p-4 gap-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-[#d4a964] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium text-foreground block">
                      Product Disclosure Statement (PDS) — Lady Ketchikan
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      SHA-256: {nelliePack.pdsHash.substring(0, 24)}...
                    </span>
                  </div>
                </div>

                <a
                  href={`/api/legal/download?slug=${nellie.slug}&doc=pds`}
                  download
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3.5 py-1.5 text-xs text-foreground hover:border-[#d4a964] hover:text-[#d4a964] transition-all"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download MD/PDF</span>
                </a>
              </div>

              {/* SA Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-border bg-background p-4 gap-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-[#d4a964] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium text-foreground block">
                      Syndicate Agreement (SA) — Form 017 Schedule
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      SHA-256: {nelliePack.saHash.substring(0, 24)}...
                    </span>
                  </div>
                </div>

                <a
                  href={`/api/legal/download?slug=${nellie.slug}&doc=sa`}
                  download
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3.5 py-1.5 text-xs text-foreground hover:border-[#d4a964] hover:text-[#d4a964] transition-all"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download MD/PDF</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Stripe Billing & Tax */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
              <div>
                <h3 className="text-lg font-medium text-foreground">Stripe Customer Billing Portal</h3>
                <p className="text-xs text-muted-foreground">
                  Update payment cards, view monthly subscription status, and download IRD-compliant GST receipts.
                </p>
              </div>
              <CreditCard className="h-5 w-5 text-[#d4a964]" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-lg border border-border bg-background p-4 space-y-3">
                <span className="text-xs uppercase font-mono text-muted-foreground block">Current Payment Method</span>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-12 rounded bg-muted flex items-center justify-center font-mono text-xs text-foreground font-bold">
                    VISA
                  </div>
                  <div>
                    <span className="text-sm font-mono text-foreground">•••• •••• •••• 4242</span>
                    <span className="text-[11px] text-muted-foreground block font-mono">Expires 08/28</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background p-4 space-y-3">
                <span className="text-xs uppercase font-mono text-muted-foreground block">Billing Cycle & GST</span>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Rate:</span>
                    <span className="font-mono text-foreground">${nelliePricing.monthlyKeepUnitNzd}/mo (100% GST Inclusive)</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>GST Component:</span>
                    <span className="font-mono text-foreground">${Math.round((nelliePricing.monthlyKeepUnitNzd * 3) / 23)} NZD</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-mono">Self-service card replacement</span>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-[#d4a964] px-4 py-2 text-xs font-semibold text-[#0a0a0a] hover:bg-[#c39853] transition-all"
              >
                <span>Launch Stripe Billing Portal</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
