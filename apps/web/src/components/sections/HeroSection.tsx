'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  backgroundImage?: string;
  overlay?: boolean;
  className?: string;
}

export function HeroSection({
  backgroundImage = '/images/content/background/horse-double-black.png',
  overlay = true,
  className = '',
}: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !bgRef.current || !contentRef.current) return;

    // NS-6: honour prefers-reduced-motion. Hero parallax + content fade
    // are decorative — skip entirely if the user has asked for less motion.
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Background parallax — drifts down slightly as you scroll
      gsap.to(bgRef.current, {
        y: 80,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });

      // Content drifts up + fades as you scroll through hero
      gsap.to(contentRef.current, {
        y: -100,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className={`relative flex min-h-screen items-center justify-center overflow-hidden pt-24 pb-48 ${className}`}
    >
      {/* Background Layer */}
      <div ref={bgRef} className="absolute inset-0">
        <Image
          src={backgroundImage}
          alt="Majestic racehorses representing Evolution Stables digital ownership"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-canvas" style={{ opacity: 0.35 }} />
      </div>

      <div ref={contentRef} className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-start gap-4 px-8 pb-16 md:px-12">
        {/* Logo — visible h1 (north-star rule: one display h1 per page) */}
        <h1 className="relative w-full max-w-[720px] animate-hero-logo">
          <Image
            src="/images/brand/lockups/gold/lockup-horizontal-gold.png"
            alt="Evolution Stables — Digital Racehorse Ownership"
            width={1200}
            height={400}
            priority
            className="relative z-20 h-auto w-full"
          />
        </h1>

        {/* Tagline — three positioning pillars, gold rule dividers between each.
            Hierarchy: subordinate to h1 wordmark but visible as a positioning
            unit, not a footnote. Matches marketplace eyebrow scale per NS-5. */}
        <div className="mt-8 flex animate-hero-tagline flex-wrap items-center gap-x-4 gap-y-3 text-[11px] font-light uppercase tracking-[0.2em] text-muted-foreground">
          <span className="whitespace-nowrap">Grounded in tradition</span>
          <span aria-hidden="true" className="inline-block h-3 w-px bg-accent/60" />
          <span className="whitespace-nowrap">Evolved through innovation</span>
          <span aria-hidden="true" className="inline-block h-3 w-px bg-accent/60" />
          <span className="whitespace-nowrap">Ownership transformed</span>
        </div>
      </div>
    </section>
  );
}
