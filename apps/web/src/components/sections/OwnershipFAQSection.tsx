'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CollapsePanel } from '@/components/ui/CollapsePanel';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import faqData from '@/dna/content/ownership-faq.json';

gsap.registerPlugin(ScrollTrigger);

interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Ownership FAQ — the mechanics set (DSL, 5×M float, prize money, trainer
 * authority, regulation). Lives at the bottom of /marketplace; the landing
 * FAQSection is the separate storefront set (faq.json) — do not merge.
 */
export function OwnershipFAQSection() {
  const items: FAQItem[] = faqData.items;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const faqListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
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

      if (faqListRef.current) {
        const faqItems = faqListRef.current.querySelectorAll(':scope > div');
        gsap.fromTo(
          faqItems,
          { x: -80, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: faqListRef.current,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleMouseLeave = () => {
    setOpenIndex(null);
  };

  return (
    <section ref={sectionRef} id="ownership-faq" className="py-56 bg-canvas text-foreground">
      <div className="max-w-6xl mx-auto px-12 md:px-16 lg:px-20">
        {/* Section Label — static */}
        <p className="text-[11px] font-light tracking-[0.2em] uppercase mb-12 text-muted-foreground">
          Ownership FAQ
        </p>

        <div ref={headerRef}>
          <h2 className="text-[36px] md:text-[48px] leading-[1.1] text-heading font-light tracking-tight mb-6">
            Ownership,
            <br />
            explained.
          </h2>
        </div>

        <div ref={bodyRef}>
          <p className="text-[18px] leading-[1.7] font-light text-muted-foreground mb-24 max-w-xl">
            The mechanics of a Digital Syndication Lease — what you hold, how prize money flows, and who governs the term.
          </p>
        </div>

        {/* FAQ Container with Auto-Collapse on Mouse Leave */}
        <div
          ref={faqListRef}
          className="max-w-3xl mx-auto"
          onMouseLeave={handleMouseLeave}
        >
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`transition-all duration-300 ${index === 0 ? 'border-t border-border' : ''}`}
              >
                <div className="py-8 border-b border-border transition-all duration-300 ease-out hover:border-border">
                  <button
                    onClick={() => toggleQuestion(index)}
                    className="w-full text-left cursor-pointer group relative focus:outline-none"
                    aria-expanded={isOpen}
                    aria-controls={`ownership-faq-panel-${index}`}
                  >
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex-1">
                        <h3 className={`font-heading text-base font-light tracking-tight transition-all duration-300 ease-out ${
                          isOpen ? 'text-white' : 'text-white/95'
                        } group-hover:text-white`}>
                          {item.question}
                        </h3>
                      </div>

                      {/* Plus icon that rotates 45 degrees to a cross */}
                      <svg
                        className={`h-5 w-5 shrink-0 transition-all duration-300 ease-out ${
                          isOpen ? 'rotate-45 text-accent' : 'rotate-0 text-muted-foreground'
                        } group-hover:text-accent`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        aria-hidden
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                      </svg>
                    </div>
                  </button>

                  {/* Smooth dynamic height container (CSS grid-rows transition) */}
                  <CollapsePanel open={isOpen} id={`ownership-faq-panel-${index}`}>
                    <div
                      className="text-base leading-relaxed font-light max-w-2xl pt-4 pb-2 text-foreground"
                    >
                      {item.answer}
                    </div>
                  </CollapsePanel>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
