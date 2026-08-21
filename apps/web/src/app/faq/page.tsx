import Link from 'next/link';
import { HelpCircle, ArrowLeft, ChevronRight } from 'lucide-react';

export const metadata = {
  title: 'Frequently Asked Questions | Evolution Stables',
  description: 'Everything you need to know about Digital Syndication, 5xM float billing, and prize money distribution.',
};

export default function FaqPage() {
  const faqs = [
    {
      q: 'What is a Digitally Syndicated Lease (DSL)?',
      a: 'A DSL is a regulated fractional leasehold of an elite racehorse. Instead of purchasing full thoroughbred bloodstock equity with unlimited capital liabilities, you subscribe to an authorized fractional stake (1% integer units) with fixed monthly keep and direct rights to 75% of net prize money.',
    },
    {
      q: 'How does the 5×M Join Float Model work?',
      a: 'When joining a syndicate, you pay an initial float equal to 5 months of keep (3 months security deposit reserve + 2 months prepaid keep). Monthly billing of $M starts in Month 2. This structure completely prevents surprise cash calls. When the lease concludes, all unused deposit and prepaid funds are refunded pro-rata within 14 days.',
    },
    {
      q: 'How is prize money calculated and distributed?',
      a: 'Prize money is calculated directly from officially published NZTR gross stakes (e.g. on Loveracing NZ). Syndicate members receive 75% pro-rata to their shareholding. The remaining 25% is retained by the lessor to absorb all jockey, trainer, nom/acceptance fees, and operational overheads.',
    },
    {
      q: 'Who decides where and when the horse races?',
      a: 'Under Clause 6 of the Syndicate Agreement, the licensed trainer holds sole and absolute authority over all race placement, training regimen, spelling periods, and horse welfare decisions. This ensures the horse is conditioned to the highest professional and veterinary standard without amateur interference.',
    },
    {
      q: 'Is Evolution Stables regulated in New Zealand?',
      a: 'Yes. Evolution Stables operates as an Authorised Syndicator under New Zealand Thoroughbred Racing (NZTR) in accordance with the Financial Markets Conduct (Equine Syndicating Schemes) Exemption Notice.',
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#d4a964] hover:underline mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Return to Home</span>
      </Link>

      <div className="inline-flex items-center gap-2 rounded-full border border-[#d4a964]/40 bg-[#d4a964]/10 px-3.5 py-1 text-xs font-mono tracking-[0.2em] uppercase text-[#d4a964] mb-4">
        <HelpCircle className="h-3.5 w-3.5" />
        <span>Investor Knowledge Base</span>
      </div>

      <h1 className="text-4xl font-light tracking-tight text-foreground sm:text-5xl">
        Frequently Asked <span className="font-serif italic text-[#d4a964]">Questions</span>
      </h1>
      <p className="mt-2 text-xs font-mono text-muted-foreground">
        Clear, mathematical answers to common questions about Evolution Stables.
      </p>

      <div className="mt-12 space-y-6">
        {faqs.map((faq, idx) => (
          <div key={idx} className="rounded-xl border border-border bg-card p-6 transition-all hover:border-[#d4a964]/40">
            <h3 className="text-base font-medium text-foreground flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-[#d4a964] shrink-0" />
              <span>{faq.q}</span>
            </h3>
            <p className="mt-3 pl-6 text-sm text-muted-foreground leading-relaxed">
              {faq.a}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-border bg-gradient-to-r from-card to-background p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-medium text-foreground">Have additional questions?</h3>
          <p className="text-xs text-muted-foreground mt-1">Our bloodstock desk is available for bespoke queries.</p>
        </div>
        <Link
          href="/#marketplace"
          className="inline-flex items-center gap-2 rounded-lg bg-[#d4a964] px-5 py-2.5 text-xs font-semibold text-[#0a0a0a] hover:bg-[#c39853] transition-all"
        >
          <span>Explore Available Horses</span>
        </Link>
      </div>
    </div>
  );
}
