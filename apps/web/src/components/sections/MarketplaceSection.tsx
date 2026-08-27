'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function MarketplaceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Headline + description slide in from left
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { x: -60, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headerRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Body — triggers after header
      if (bodyRef.current) {
        gsap.fromTo(
          bodyRef.current,
          { x: -60, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: bodyRef.current,
              start: 'top 78%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Cards stagger up from below
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll(':scope > div');
        gsap.fromTo(
          cards,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="marketplace" className="py-56 bg-canvas text-foreground">
      <div className="max-w-6xl mx-auto px-12 md:px-16 lg:px-20 w-full">
        <div>
          {/* Original Regulated Marketplace Label */}
          <p className="text-[11px] font-light tracking-[0.2em] uppercase mb-12 text-muted-foreground">
            REGULATED MARKETPLACE
          </p>

          <div ref={headerRef}>
            {/* Headline */}
            <h2 className="text-[36px] md:text-[48px] leading-[1.1] text-heading font-light tracking-tight mb-6">
              Transformation Powered
              <br />
              by <span className="text-[#00E599]">Regulation</span>
            </h2>
          </div>

          <div ref={bodyRef}>
            {/* Description */}
            <p className="text-[16px] leading-[1.7] font-light text-muted-foreground mb-16 max-w-3xl">
              Evolution Stables operates as an Authorised Syndicator — delivering regulated, financial-grade infrastructure built for modern racehorse owners.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-32 w-full">
          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3">
            {/* Card 1 - Discover Opportunities */}
            <div className="group flex flex-col gap-6 relative px-8 py-12 md:px-10 md:py-16 transition-all duration-500">
              {/* Vertical lines */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-[1px] bg-border" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-[1px] bg-accent origin-center scale-y-0 transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-y-100" />
              <div className="space-y-12">
                <div>
                  <svg
                    className="h-8 w-8 text-foreground transition-colors duration-500 group-hover:text-heading"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[18px] font-light text-heading leading-tight relative overflow-hidden">
                    <span className="relative inline-block">
                      Discover Opportunities
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-black/70 to-transparent -translate-x-full opacity-0 group-hover:translate-x-full group-hover:opacity-100 group-hover:transition-all group-hover:duration-700 group-hover:ease-in-out transition-none" />
                    </span>
                  </h4>
                  <p className="text-[15px] leading-[1.7] font-light text-muted-foreground transition-colors duration-500 group-hover:text-frost">
                    Explore available syndications and short-term leases — all
                    clearly structured, fully transparent, and ready to invest
                    in with confidence.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2 - Trade with Confidence */}
            <div className="group flex flex-col gap-6 relative px-8 py-12 md:px-10 md:py-16 transition-all duration-500">
              {/* Vertical lines */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-[1px] bg-border" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-[1px] bg-accent origin-center scale-y-0 transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-y-100" />
              <div className="space-y-12">
                <div>
                  <svg
                    className="h-8 w-8 text-foreground transition-colors duration-500 group-hover:text-heading"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                    />
                  </svg>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[18px] font-light text-heading leading-tight relative overflow-hidden">
                    <span className="relative inline-block">
                      Trade with Confidence
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-black/70 to-transparent -translate-x-full opacity-0 group-hover:translate-x-full group-hover:opacity-100 group-hover:transition-all group-hover:duration-700 group-hover:ease-in-out transition-none" />
                    </span>
                  </h4>
                  <p className="text-[15px] leading-[1.7] font-light text-muted-foreground transition-colors duration-500 group-hover:text-frost">
                    Our regulated platform ensures secure transactions,
                    compliant ownership records, and integrated settlements — so
                    every trade is safe, clear, and straightforward.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3 - Real-Time Insight */}
            <div className="group flex flex-col gap-6 relative px-8 py-12 md:px-10 md:py-16 transition-all duration-500">
              {/* Vertical lines */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-[1px] bg-border" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-[1px] bg-accent origin-center scale-y-0 transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-y-100" />
              <div className="space-y-12">
                <div>
                  <svg
                    className="h-8 w-8 text-foreground transition-colors duration-500 group-hover:text-heading"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[18px] font-light text-heading leading-tight relative overflow-hidden">
                    <span className="relative inline-block">
                      Real-Time Insight
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-black/70 to-transparent -translate-x-full opacity-0 group-hover:translate-x-full group-hover:opacity-100 group-hover:transition-all group-hover:duration-700 group-hover:ease-in-out transition-none" />
                    </span>
                  </h4>
                  <p className="text-[15px] leading-[1.7] font-light text-muted-foreground transition-colors duration-500 group-hover:text-frost">
                    Follow your horses, track performance, and manage your
                    positions in real time — with ownership data, updates, and
                    key information always at your fingertips.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
