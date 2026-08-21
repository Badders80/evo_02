import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  getCampaignBySlug,
  getAllCampaigns,
  getCampaignMedia,
  getCompiledLegalPackForCampaign,
  isCheckoutOpen,
} from '../../../lib/horses-data';
import { PricingCard } from '../../../components/pricing-card';
import { CapTableCard } from '../../../components/cap-table-card';
import { DataRoomCard } from '../../../components/data-room-card';
import { DynamicHighlightPills } from '../../../components/thoroughbred-attributes';
import {
  ArrowLeft,
  ExternalLink,
  Dna,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const campaigns = getAllCampaigns();
  return campaigns.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const campaign = getCampaignBySlug(slug);
  if (!campaign) {
    return { title: 'Thoroughbred Not Found | Evolution Stables' };
  }

  return {
    title: `${campaign.legalName} (${campaign.barnName}) | Commercials & Terms | Evolution Stables`,
    description: campaign.marketing.marketplaceHook,
    openGraph: {
      title: `${campaign.legalName} | Digitally-Syndicated Thoroughbred`,
      description: campaign.marketing.marketplaceHook,
      url: `https://evolutionstables.nz/horses/${campaign.slug}`,
      type: 'article',
    },
  };
}

export default async function HorseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const campaign = getCampaignBySlug(slug);

  if (!campaign) {
    notFound();
  }

  const media = getCampaignMedia(campaign.slug, campaign.trainer.slug);
  const legalPack = getCompiledLegalPackForCampaign(campaign);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Breadcrumb & Navigation Topbar */}
      <div className="border-b border-border bg-card/40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/#marketplace"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-[#d4a964] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Marketplace</span>
          </Link>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-background/80 border border-border rounded-lg p-1">
            <span className="px-3 py-1 text-xs font-medium rounded-md bg-card text-[#d4a964] border border-border shadow-sm">
              Commercials & Terms
            </span>
            <Link
              href={`/horses/${campaign.slug}/about`}
              className="px-3 py-1 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground transition-colors"
            >
              About & Pedigree
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TOP TIER: HERO SHOWCASE, DYNAMIC PILLS & SPEC SHEET                       */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#d4a964]">
                {campaign.pedigree.gender} · Foaled {campaign.pedigree.foalingDate}
              </span>
              <span className="rounded bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                {campaign.listingStatus === 'completed'
                  ? 'Completed Campaign'
                  : campaign.listingStatus === 'coming_soon'
                    ? 'Coming Soon'
                    : campaign.listingStatus === 'fully_subscribed'
                      ? 'Fully Subscribed'
                      : 'In Active Training'}
              </span>
            </div>
            <h1 className="mt-2 text-3xl font-light tracking-tight text-foreground sm:text-5xl">
              {campaign.legalName}
              {campaign.barnName && (
                <span className="ml-3 font-serif italic text-muted-foreground text-2xl sm:text-4xl">
                  ({campaign.barnName})
                </span>
              )}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground font-light max-w-3xl">
              {campaign.marketing.marketplaceHook}
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center gap-3 font-mono text-xs">
            <a
              href={campaign.pedigree.studBookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-muted-foreground hover:border-[#d4a964] hover:text-[#d4a964] transition-colors"
            >
              <span>Official Stud Book</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Media Conformation Showcase & Quick Spec */}
        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          {/* Main Hero Conformation Image */}
          <div className="relative overflow-hidden rounded-xl border border-border bg-card lg:col-span-8 aspect-[16/10]">
            <div
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${media.horse.heroConformation})` }}
            />
            <div className="absolute bottom-4 left-4 rounded-md border border-border/80 bg-background/80 backdrop-blur-md px-3 py-1.5 text-xs font-mono text-foreground">
              Cover · 01
            </div>
          </div>

          {/* Pedigree & Quick Spec Card */}
          <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-6 lg:col-span-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#d4a964]">
                <Dna className="h-4 w-4" />
                <span>Pedigree & Trainer</span>
              </div>
              <h2 className="mt-2 text-xl font-medium text-foreground">
                {campaign.pedigree.sire} × {campaign.pedigree.dam}
              </h2>
              <p className="mt-2 text-xs text-muted-foreground font-mono">
                Prepared by {campaign.trainer.name} ({campaign.trainer.stable})
              </p>

              <div className="mt-6 space-y-2 font-mono text-xs border-t border-border pt-4">
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground font-sans">Sire</span>
                  <span className="text-foreground font-medium">{campaign.pedigree.sire}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground font-sans">Dam</span>
                  <span className="text-foreground font-medium">{campaign.pedigree.dam}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground font-sans">Damsire</span>
                  <span className="text-foreground font-medium">{campaign.pedigree.damSire}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground font-sans">Breeder</span>
                  <span className="text-foreground font-medium">{campaign.pedigree.breeder}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-border/80 bg-background p-3 text-[11px] font-mono text-muted-foreground">
              Microchip: {campaign.pedigree.microchip}
            </div>
          </div>
        </div>

        {media.horse.paradeGallery.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {media.horse.paradeGallery.map((src, i) => (
              <div
                key={src}
                className="aspect-[4/3] overflow-hidden rounded-lg border border-border bg-card bg-cover bg-center"
                style={{ backgroundImage: `url(${src})` }}
                aria-label={`Still ${String(i + 2).padStart(2, '0')}`}
              />
            ))}
          </div>
        )}

        {/* Dynamic Highlight Pills */}
        <div className="mt-8">
          <DynamicHighlightPills
            tags={campaign.marketing.highlightTags}
            highlights={campaign.marketing.highlights}
          />
        </div>

        {/* Soft Story Banner Link */}
        <div className="mt-8 rounded-xl border border-border bg-card/60 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[#d4a964]/10 p-2.5 text-[#d4a964] border border-[#d4a964]/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">
                Want to read the full athletic story and racing outlook?
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Explore trainer comments, track preparation, and complete bloodline analysis.
              </p>
            </div>
          </div>

          <Link
            href={`/horses/${campaign.slug}/about`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-xs font-medium text-foreground hover:border-[#d4a964] hover:text-[#d4a964] transition-colors whitespace-nowrap"
          >
            <span>Read Full Story & Pedigree</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* BOTTOM TIER: COMMERCIAL PRICING, 4-WAY CAP TABLE & LEGAL DATA ROOM        */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
        <div className="border-t border-border pt-12">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#d4a964]">
              Hard Commercial & Legal Facts
            </span>
            <h2 className="mt-2 text-3xl font-medium tracking-tight text-foreground">
              Syndicate Governance & Terms
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Strict mathematical invariants, 1% integer units, and immutable SHA-256 legal contracts.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Dynamic Commercial Pricing Card */}
            <PricingCard
              wholesaleMonthlyNzd={campaign.wholesaleMonthlyNzd}
              horseName={campaign.legalName}
              campaignSlug={campaign.slug}
              sharesAvailable={Math.round(campaign.capTableFixture.availablePct)}
              checkoutOpen={isCheckoutOpen(campaign)}
              listingStatusLabel={
                campaign.listingStatus === 'completed'
                  ? 'Completed campaign — subscription closed'
                  : campaign.listingStatus === 'coming_soon'
                    ? 'Coming soon — subscription not open'
                    : campaign.listingStatus === 'fully_subscribed'
                      ? 'Fully subscribed — subscription closed'
                      : undefined
              }
            />

            {/* Presentation 4-Way Cap Table Balancer */}
            <CapTableCard
              retainedPct={campaign.capTableFixture.retainedPct}
              allocatedPct={campaign.capTableFixture.allocatedPct}
              reservedPct={campaign.capTableFixture.reservedPct}
              availablePct={campaign.capTableFixture.availablePct}
              totalInvestors={campaign.capTableFixture.totalInvestors}
              horseName={campaign.barnName}
            />
          </div>

          {/* Statutory Legal Data Room */}
          <div className="mt-8">
            <DataRoomCard
              pack={legalPack}
              closeStyle={campaign.closeStyle}
              horseName={campaign.legalName}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
