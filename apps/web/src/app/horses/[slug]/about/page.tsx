import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  getCampaignBySlug,
  getAllCampaigns,
  getCampaignMedia,
} from '../../../../lib/horses-data';
import {
  ArrowLeft,
  ExternalLink,
  Building2,
  Dna,
  BookOpen,
  ArrowRight,
  ShieldCheck,
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
  if (!campaign || !campaign.softLegal?.aboutHorse) {
    return { title: 'Thoroughbred Story Not Found | Evolution Stables' };
  }

  return {
    title: `About ${campaign.legalName} (${campaign.barnName}) | Story & Outlook | Evolution Stables`,
    description: campaign.marketing.marketplaceHook,
    openGraph: {
      title: `About ${campaign.legalName} | Thoroughbred Story & Outlook`,
      description: campaign.marketing.marketplaceHook,
      url: `https://evolutionstables.nz/horses/${campaign.slug}/about`,
      type: 'article',
    },
  };
}

export default async function HorseAboutPage({ params }: PageProps) {
  const { slug } = await params;
  const campaign = getCampaignBySlug(slug);

  if (!campaign || !campaign.softLegal?.aboutHorse?.trim()) {
    notFound();
  }

  const media = getCampaignMedia(campaign.slug, campaign.trainer.slug);
  const soft = campaign.softLegal;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Breadcrumb & Navigation Topbar */}
      <div className="border-b border-border bg-card/40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href={`/horses/${campaign.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-[#d4a964] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Campaign Overview</span>
          </Link>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-background/80 border border-border rounded-lg p-1">
            <Link
              href={`/horses/${campaign.slug}`}
              className="px-3 py-1 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground transition-colors"
            >
              Commercials & Terms
            </Link>
            <span className="px-3 py-1 text-xs font-medium rounded-md bg-card text-[#d4a964] border border-border shadow-sm">
              About & Pedigree
            </span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="border-b border-border pb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#d4a964]">
              Soft Content & Story
            </span>
            <span className="rounded bg-background border border-border px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
              PDS Section 2 Parity
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-light tracking-tight text-foreground sm:text-5xl">
            About {campaign.legalName}
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

        {/* ========================================================================= */}
        {/* SECTION 1: ABOUT THE HORSE & RACE FORM NARRATIVE                          */}
        {/* ========================================================================= */}
        <section className="mt-10 grid gap-8 lg:grid-cols-12">
          {/* Main Story Text */}
          <div className="rounded-xl border border-border bg-card p-6 lg:col-span-8 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#d4a964]">
              <BookOpen className="h-4 w-4" />
              <span>Section 2.1 · Form & Preparation</span>
            </div>
            <h2 className="mt-2 text-2xl font-medium text-foreground">About the Horse</h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>{soft.aboutHorse}</p>
            </div>

            <div className="mt-8 rounded-lg border border-border bg-background p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-[#d4a964]" />
                <span>NZTR Authorized Syndication Disclosure</span>
              </div>
              <a
                href={campaign.pedigree.studBookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-mono text-[#d4a964] hover:underline"
              >
                <span>Official NZTR Record</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Hero Conformation Photo */}
          <div className="relative overflow-hidden rounded-xl border border-border bg-card lg:col-span-4 aspect-[4/3] lg:aspect-auto">
            <div
              className="h-full w-full bg-cover bg-center min-h-[260px]"
              style={{ backgroundImage: `url(${media.horse.heroConformation})` }}
            />
            <div className="absolute bottom-3 left-3 rounded-md border border-border/80 bg-background/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-mono text-foreground">
              Official Conformation Still
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: TRAINER & YARD BIO                                             */}
        {/* ========================================================================= */}
        <section className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#d4a964]">
            <Building2 className="h-4 w-4" />
            <span>The Trainer & Stable</span>
          </div>
          <div className="mt-2 flex flex-col md:flex-row md:items-baseline justify-between">
            <h2 className="text-2xl font-medium text-foreground">{campaign.trainer.name}</h2>
            <span className="text-xs font-mono text-muted-foreground">
              {campaign.trainer.stable} · {campaign.trainer.location}
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground max-w-4xl">
            {soft.trainerBio}
          </p>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: RACING OUTLOOK & PEDIGREE BREAKDOWN                            */}
        {/* ========================================================================= */}
        <section className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Outlook Narrative */}
          <div className="rounded-xl border border-border bg-card p-6 lg:col-span-7 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#d4a964]">
                <Dna className="h-4 w-4" />
                <span>Section 2.3 · Outlook & Lineage</span>
              </div>
              <h2 className="mt-2 text-2xl font-medium text-foreground">Racing Outlook & Pedigree</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {soft.racingOutlookAndPedigree}
              </p>
            </div>

            {/* Talking Points Pills */}
            <div className="mt-8 border-t border-border pt-4">
              <span className="text-[11px] font-mono text-muted-foreground block mb-2">
                Key Performance Highlights:
              </span>
              <div className="flex flex-wrap gap-2">
                {campaign.marketing.highlightTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs text-foreground font-medium"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#d4a964]" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Pedigree Structure Table */}
          <div className="rounded-xl border border-border bg-card p-6 lg:col-span-5 shadow-sm">
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Pedigree Spec Sheet
            </h3>
            <div className="mt-4 space-y-3 font-mono text-xs">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground font-sans">Sire</span>
                <span className="text-foreground font-semibold">{campaign.pedigree.sire}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground font-sans">Dam</span>
                <span className="text-foreground font-semibold">{campaign.pedigree.dam}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground font-sans">Damsire</span>
                <span className="text-foreground font-semibold">{campaign.pedigree.damSire}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground font-sans">Foaling Date</span>
                <span className="text-foreground font-medium">{campaign.pedigree.foalingDate}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground font-sans">Breeder</span>
                <span className="text-foreground font-medium">{campaign.pedigree.breeder}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground font-sans">Microchip</span>
                <span className="text-foreground font-medium">{campaign.pedigree.microchip}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA to Commercials */}
        <section className="mt-12 rounded-xl border border-[#d4a964]/30 bg-gradient-to-r from-card to-background p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#d4a964]">
              Ready to participate?
            </span>
            <h3 className="text-2xl font-light tracking-tight text-foreground mt-1">
              Join the {campaign.legalName} Syndicate
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              View live share availability, fixed monthly keep rates, and verified legal contracts.
            </p>
          </div>

          <Link
            href={`/horses/${campaign.slug}`}
            className="inline-flex items-center gap-2 rounded-lg bg-[#d4a964] px-6 py-3 text-sm font-semibold text-black hover:bg-[#c49a55] transition-colors whitespace-nowrap shadow-md"
          >
            <span>View Commercial Terms</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>
    </div>
  );
}
