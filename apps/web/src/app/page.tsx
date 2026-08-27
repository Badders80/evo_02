import { FixedBg } from '@/components/ui/FixedBg';
import { GrassBg } from '@/components/ui/GrassBg';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/footer';
import { CtaLeadModal } from '@/components/CtaLeadModal';
import { HeroSection } from '@/components/sections/HeroSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { HowItWorksSection } from '@/components/sections/HowItWorksSection';
import { DigitalSyndicationSection } from '@/components/sections/DigitalSyndicationSection';
import { MarketplaceSection } from '@/components/sections/MarketplaceSection';
import { PressShowcaseSection } from '@/components/sections/PressShowcaseSection';
import { FAQSection } from '@/components/sections/FAQSection';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(
  sp: Record<string, string | string[] | undefined>,
  key: string,
): string {
  const v = sp[key];
  if (Array.isArray(v)) return v[0] || '';
  return v || '';
}

/** LinkedIn / campaign links: CTA in first paint. Organic: delayed modal. */
function isCampaignLanding(sp: Record<string, string | string[] | undefined>) {
  return Boolean(
    firstParam(sp, 'source') ||
      firstParam(sp, 'utm_source') ||
      firstParam(sp, 'campaign') ||
      firstParam(sp, 'campaign_key') ||
      firstParam(sp, 'utm_campaign'),
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const forceInstant = isCampaignLanding(sp);

  return (
    <>
      <NavBar />
      <CtaLeadModal forceInstant={forceInstant} />
      <main className="text-foreground">
        <h1 className="sr-only">Evolution Stables — Digital Racehorse Ownership</h1>

        <div className="w-full bg-canvas px-0 shadow-[0_0_80px_RGBA(0,0,0,0.35)] m-0 p-0 border-none max-w-none">
          <HeroSection />
        </div>

        <AboutSection />

        <section className="px-0 md:px-0 m-0 p-0 border-none">
          <FixedBg
            src="/images/content/background/hooves-black-white.jpg"
            height="h-[50vh]"
            alt="Horse hooves background"
          />
        </section>

        <HowItWorksSection />

        <section className="px-0 md:px-0 m-0 p-0 border-none">
          <FixedBg
            src="/images/content/background/landscape-digital-overlay.jpg"
            height="h-[50vh]"
            alt="Digital landscape background"
          />
        </section>

        <DigitalSyndicationSection />

        <section className="px-0 md:px-0 m-0 p-0 border-none">
          <FixedBg
            src="/images/content/background/horse-and-foal.jpg"
            height="h-[50vh]"
            alt="Horse and foal background"
          />
        </section>

        <MarketplaceSection />

        <section id="get-started" className="bg-canvas">
          <GrassBg
            src="/images/content/background/hooves-on-grass.png"
            alt="Hooves on grass background"
          />
        </section>

        <PressShowcaseSection />

        <FAQSection />

        <Footer />
      </main>
    </>
  );
}