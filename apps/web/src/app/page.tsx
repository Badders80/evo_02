import Link from 'next/link';
import { getAllCampaigns, getCampaignPricing, getCampaignMedia, isCheckoutOpen } from '../lib/horses-data';
import { Sparkles, ArrowRight, CheckCircle2, Trophy, Coins, Compass } from 'lucide-react';

export default function HomePage() {
  const campaigns = getAllCampaigns();

  return (
    <div className="flex flex-col gap-24 pb-20">
      {/* 1. Hero Showcase */}
      <section className="relative overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-24 border-b border-border bg-radial from-card/80 to-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d4a964]/40 bg-[#d4a964]/10 px-3.5 py-1.5 text-xs font-mono tracking-[0.2em] uppercase text-[#d4a964]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Digital-Syndication, by Evolution Stables</span>
          </div>

          <h1 className="mt-8 text-5xl font-light tracking-tight text-foreground sm:text-7xl">
            Ownership, <span className="font-serif italic text-[#d4a964]">evolved.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed font-light">
            Digitally-syndicated fractional ownership of elite New Zealand thoroughbreds. Direct,
            regulated, and grounded in the yard.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="#marketplace"
              className="inline-flex items-center gap-2 rounded-lg bg-[#d4a964] px-6 py-3 text-sm font-semibold tracking-wide text-[#0a0a0a] transition-all hover:bg-[#c39853] shadow-lg shadow-[#d4a964]/10"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#mechanics"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-muted-foreground hover:bg-muted/40"
            >
              <span>How It Works</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Marketplace Section */}
      <section id="marketplace" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#d4a964]">
              Active Racing Campaigns
            </span>
            <h2 className="mt-2 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              Thoroughbred Marketplace
            </h2>
          </div>
          <p className="mt-2 md:mt-0 text-xs font-mono text-muted-foreground">
            Authorised NZTR Syndication · 1% Integer Units
          </p>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {campaigns.map((campaign) => {
            const media = getCampaignMedia(campaign.slug, campaign.trainer.slug);
            const pricing = getCampaignPricing(campaign, 1.0);

            return (
              <Link
                key={campaign.slug}
                href={`/horses/${campaign.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-[#d4a964]/60 hover:shadow-2xl hover:shadow-[#d4a964]/5"
              >
                {/* Hero Media Aspect Frame */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                  <div
                    className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${media.horse.heroConformation})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />

                  {/* Badges on Card */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="rounded-md border border-border/80 bg-background/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-mono text-foreground">
                      {campaign.pedigree.gender} · {campaign.pedigree.sire}
                    </span>
                  </div>

                  <div className="absolute top-4 right-4">
                    <span
                      className={`rounded-md border backdrop-blur-sm px-2.5 py-1 text-[11px] font-mono ${
                        campaign.listingStatus === 'completed'
                          ? 'border-zinc-600 bg-zinc-950/90 text-zinc-300'
                          : campaign.listingStatus === 'fully_subscribed'
                            ? 'border-amber-900/60 bg-amber-950/90 text-amber-300'
                            : campaign.listingStatus === 'coming_soon'
                              ? 'border-sky-900/60 bg-sky-950/90 text-sky-300'
                              : 'border-emerald-900/60 bg-emerald-950/90 text-emerald-400'
                      }`}
                    >
                      {campaign.listingStatus === 'listed'
                        ? `${campaign.capTableFixture.availablePct}% Available`
                        : campaign.listingStatus === 'coming_soon'
                          ? 'Coming Soon'
                          : campaign.listingStatus === 'fully_subscribed'
                            ? 'Fully Subscribed'
                            : 'Completed'}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#d4a964]">
                      {campaign.legalName}
                    </span>
                    <h3 className="text-2xl font-medium text-foreground tracking-tight">
                      {campaign.barnName ?? campaign.legalName}
                    </h3>
                  </div>
                </div>

                {/* Card Content & Dynamic Pricing Bar */}
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {campaign.marketing.marketplaceHook}
                    </p>

                    {/* Highlight Pills on Card */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {campaign.marketing.highlightTags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-md border border-border/80 bg-background/80 px-2 py-0.5 text-[11px] font-medium text-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
                      <span>Trainer</span>
                      <span className="font-medium text-foreground">
                        {campaign.trainer.name} ({campaign.trainer.location})
                      </span>
                    </div>
                  </div>

                  {/* Financial Pricing Strip */}
                  <div className="mt-6 rounded-lg border border-border/80 bg-background p-3.5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground block">
                        Syndicate Participation
                      </span>
                      <span className="text-xl font-mono font-semibold text-[#d4a964]">
                        {isCheckoutOpen(campaign)
                          ? `From $${pricing.monthlyKeepUnitNzd.toLocaleString()}`
                          : campaign.listingStatus === 'completed'
                            ? 'Track Record'
                            : campaign.listingStatus === 'coming_soon'
                              ? 'Coming Soon'
                              : 'Fully Subscribed'}
                        {isCheckoutOpen(campaign) && (
                          <span className="text-xs text-muted-foreground font-sans">/month</span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#d4a964] group-hover:translate-x-1 transition-transform">
                      <span>View Analysis</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Syndicate Mechanics Section */}
      <section id="mechanics" className="border-y border-border bg-card/40 py-20 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#d4a964]">
              Zero-Debt Commercial Model
            </span>
            <h2 className="mt-3 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              Syndicate Mechanics
            </h2>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Every Evolution Stables campaign operates on a strict, mathematical standard engineered to protect
              investors from surprise cash calls while ensuring full legal and welfare compliance.
            </p>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {/* 5xM Float Model */}
            <div className="rounded-xl border border-border bg-background p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#d4a964]/40 bg-[#d4a964]/10 text-[#d4a964]">
                <Coins className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-foreground">
                5×M Float Model
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Join with a 5-month float (3 months security reserve + 2 months advance keep), followed by a simple monthly
                keep of M. Unused funds are refunded pro-rata upon lease conclusion.
              </p>
            </div>

            {/* 75/25 Distribution */}
            <div className="rounded-xl border border-border bg-background p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#d4a964]/40 bg-[#d4a964]/10 text-[#d4a964]">
                <Trophy className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-foreground">
                75/25 Prize Distribution
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                75% of gross official NZTR prizemoney is credited pro-rata directly to syndicate holders. The remaining
                25% is retained by the lessor to absorb all jockey, trainer, and race entry deductions.
              </p>
            </div>

            {/* Clause 6 Primacy */}
            <div className="rounded-xl border border-border bg-background p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#d4a964]/40 bg-[#d4a964]/10 text-[#d4a964]">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-foreground">
                Clause 6 Trainer Primacy
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Equine welfare and race program placements are governed exclusively by the licensed trainer under the
                NZTR Code of Practice. Professional management with zero operational compromise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Governance & Integrity */}
      <section id="governance" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="rounded-2xl border border-border bg-gradient-to-b from-card to-background p-8 sm:p-12">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#d4a964]">
                Institutional Trust
              </span>
              <h2 className="mt-3 text-3xl font-medium tracking-tight text-foreground">
                Regulated Thoroughbred Participation
              </h2>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Evolution Stables is an Authorised Syndicator under New Zealand Thoroughbred Racing (NZTR) and complies with
                the Financial Markets Conduct (Equine Syndicating Schemes) Exemption Notice.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-xs text-foreground font-medium">
                  <CheckCircle2 className="h-4 w-4 text-[#d4a964]" />
                  <span>Statutory Product Disclosure Statement (PDS) for every horse</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-foreground font-medium">
                  <CheckCircle2 className="h-4 w-4 text-[#d4a964]" />
                  <span>Immutable SHA-256 frozen Syndicate Agreements</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-foreground font-medium">
                  <CheckCircle2 className="h-4 w-4 text-[#d4a964]" />
                  <span>Direct NZ bank payout distribution and quarterly accounting</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background p-6">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#d4a964] block mb-2">
                The Private Banker Standard
              </span>
              <p className="text-xs italic text-muted-foreground leading-relaxed">
                "The sport’s legacy is centuries old. Its next chapter is written carefully — uniting bloodline
                craftsmanship with modern financial transparency."
              </p>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span>Evolution Stables Ltd</span>
                <span className="text-foreground">NZTR Authorised</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
