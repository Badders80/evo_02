'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface StakeholderCard {
  title: string;
  subtitle: string;
  description: string;
}

const cards: StakeholderCard[] = [
  {
    title: "Investors & Fans",
    subtitle: "Experience the thrill — without the hassle.",
    description:
      "Ownership, on your terms. Simplified terms and conditions give you the full thrill of ownership in a transparent, regulated marketplace — where risk and return are clear before you buy.",
  },
  {
    title: "Breeders & Syndicators",
    subtitle: "Unlock new income — same control, zero extra effort.",
    description:
      "Expand your reach and retain full control, with offers structured, managed, and delivered — all in one place.",
  },
  {
    title: "Clubs & Organisations",
    subtitle: "From spectators to invested stakeholders.",
    description:
      "Ownership is the gateway to deeper engagement — turning one-time spectators into lifelong members, building revenue, and strengthening the sport's future, all in one place.",
  },
];

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Header animation
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

      // Body paragraph animation
      // Body paragraph — triggers after header
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
      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll(':scope > div');
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
              trigger: gridRef.current,
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
    <section ref={sectionRef} id="mission" className="py-56 bg-canvas text-foreground">
      <div className="max-w-6xl mx-auto px-12 md:px-16 lg:px-20 w-full">
        {/* Heading & Description */}
        <div className="mb-16">
          <p className="text-[11px] font-light tracking-[0.2em] uppercase mb-12 text-muted-foreground">
            OUR MISSION
          </p>
          <div ref={headerRef}>
            <h2 className="text-[36px] md:text-[48px] leading-[1.1] text-heading font-light tracking-tight mb-8">
              How It Works
            </h2>
          </div>
          <div ref={bodyRef}>
            <p className="text-[16px] leading-[1.7] font-light text-foreground">
              At Evolution Stables, we understand that ownership is the lifeblood of racing — and strengthening it benefits every part of the industry.
            </p>
          </div>
        </div>

        {/* 3 Cards — Sprint-style: header at top, description below */}
        <div ref={gridRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <div
              key={index}
              className="group relative border border-border rounded-xl flex flex-col cursor-pointer transition-all duration-500 hover:border-steel-border hover:scale-[1.02] h-auto lg:h-[340px]"
              style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
            >
              {/* Top — header (fixed height, lighter tone) */}
              <div className="p-6 border-b border-border h-[112px] flex flex-col justify-center" style={{ backgroundColor: "rgba(255,255,255,0.015)" }}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
                      {card.title}
                    </p>
                    <p className="text-[16px] font-light text-heading leading-snug relative overflow-hidden">
                      <span className="relative inline-block">
                        {card.subtitle}
                        {/* Text sweep on hover */}
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-black/70 to-transparent -translate-x-full opacity-0 group-hover:translate-x-full group-hover:opacity-100 group-hover:transition-all group-hover:duration-700 group-hover:ease-in-out transition-none" />
                      </span>
                    </p>
                  </div>
                  {/* Arrow icon */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground group-hover:text-frost group-hover:border-steel-border transition-colors duration-300">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Bottom — description (darker tone) */}
              <div className="p-6 relative overflow-hidden lg:flex-1 bg-canvas/40">
                <p className="text-[14px] leading-[1.8] font-light text-muted-foreground group-hover:text-frost transition-colors duration-500">
                  {card.description}
                </p>
                {/* Fade overlay at bottom — only on desktop fixed height */}
                <div
                  className="hidden lg:block absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
