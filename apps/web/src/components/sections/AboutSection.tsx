'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const AboutSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !bodyRef.current) return;

    const ctx = gsap.context(() => {
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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-canvas py-56 text-foreground" id="about">
      <div className="mx-auto w-full max-w-6xl px-12 md:px-16 lg:px-20">
        <div>
          <p className="mb-12 text-[11px] font-light uppercase tracking-[0.2em] text-muted-foreground">
            ABOUT
          </p>

          <div ref={headerRef}>
            <h2 className="mb-8 text-[36px] font-light leading-[1.1] tracking-tight text-heading md:text-[48px]">
              Own the Experience
            </h2>
          </div>
        </div>

        <div ref={bodyRef} className="mt-6 space-y-8">
          <p className="text-[16px] font-light leading-[1.7] text-foreground">
            Racehorse ownership has changed. Evolution Stables removes the barriers that once made it
            complex and inaccessible — opening the door for first-timers and seasoned fans alike to not
            just watch, but own the experience.
          </p>
        </div>
      </div>
    </section>
  );
};
