'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LogoCarousel, type LogoItem } from "@/components/ui/LogoCarousel";
import pressData from "@/dna/content/press.json";

gsap.registerPlugin(ScrollTrigger);

interface PressArticle {
  title: string;
  url: string;
  publisher: string;
  date: string;
  excerpt?: string;
  imageUrl?: string;
}

export function PressShowcaseSection() {
  const articles: PressArticle[] = pressData.articles;
  
  const sectionRef = useRef<HTMLElement>(null);
  const newsHeaderRef = useRef<HTMLDivElement>(null);
  const featuredHeaderRef = useRef<HTMLDivElement>(null);
  
  const leadArticle =
    articles.find(
      (article) =>
        article.url ===
        '/updates/prudentia_update_10june2026_email.html'
    ) ?? articles[0];

  const remainingArticles =
    articles.filter((article) => article !== leadArticle) || [];

  const preferredOrder = [
    'https://businessdesk.co.nz/article/technology/bringing-racing-into-the-digital-age',
    'https://trackside.co.nz/article/thoroughbred-ownership-reimagined',
    'https://www.investing.com/news/cryptocurrency-news/tokinvest-and-singularry-superapp-partner-to-make-regulated-realworld-asset-investing-accessible-to-everyone-4316762',
  ];

  const orderMap = new Map(
    preferredOrder.map((url, index) => [url, index])
  );

  const rightArticles = [...remainingArticles].sort((a, b) => {
    const aRank = orderMap.get(a.url);
    const bRank = orderMap.get(b.url);

    if (aRank !== undefined || bRank !== undefined) {
      if (aRank === undefined) return 1;
      if (bRank === undefined) return -1;
      return aRank - bRank;
    }

    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const visibleCount = Math.min(6, rightArticles.length);
  const shouldRotate = rightArticles.length > visibleCount;
  const animationDuration = 800;
  const displayDuration = 4200;

  const [openArticleUrl, setOpenArticleUrl] = useState<string | null>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [itemHeight, setItemHeight] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const itemRef = useRef<HTMLDivElement | null>(null);
  const rotateTimeoutRef = useRef<number | null>(null);

  const toggleArticle = (article: PressArticle) => {
    setOpenArticleUrl((current) => (current === article.url ? null : article.url));
  };

  const resetCarouselRef = useRef(false);
  useEffect(() => {
    if (resetCarouselRef.current) return;
    resetCarouselRef.current = true;
    setStartIndex(0);
    setOpenArticleUrl(null);
  }, [rightArticles.length]);

  useEffect(() => {
    if (!itemRef.current || openArticleUrl) return;

    const measure = () => {
      if (!itemRef.current) return;
      const nextHeight = itemRef.current.getBoundingClientRect().height;
      if (nextHeight > 0) {
        setItemHeight(nextHeight);
      }
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [rightArticles.length, openArticleUrl]);

  const isPaused = isHovered || openArticleUrl !== null;

  useEffect(() => {
    if (!shouldRotate || isPaused || !itemHeight) return;

    const startTimer = window.setTimeout(() => {
      setIsAnimating(true);
      rotateTimeoutRef.current = window.setTimeout(() => {
        setStartIndex((current) => (current + 1) % rightArticles.length);
        setIsAnimating(false);
        setOpenArticleUrl(null);
      }, animationDuration);
    }, displayDuration);

    return () => {
      window.clearTimeout(startTimer);
      if (rotateTimeoutRef.current) {
        window.clearTimeout(rotateTimeoutRef.current);
        rotateTimeoutRef.current = null;
      }
    };
  }, [animationDuration, displayDuration, isPaused, itemHeight, rightArticles.length, shouldRotate, startIndex]);

  const renderArticles = useMemo(() => {
    if (!shouldRotate) return rightArticles;
    return Array.from({ length: visibleCount + 1 }, (_, index) => {
      return rightArticles[(startIndex + index) % rightArticles.length];
    });
  }, [rightArticles, shouldRotate, startIndex, visibleCount]);

  const partnerLogos: LogoItem[] = [
    { name: "Trackside NZ", src: "/images/partners/trackside-nz.png" },
    { name: "Business Desk", src: "/images/partners/businessdesk.jpg" },
    { name: "Singularry", src: "/images/partners/singularry.webp" },
    { name: "Investing.com", src: "/images/partners/investing-com.png" },
    { name: "NZTR", src: "/images/partners/nztr-white.png" },
    { name: "Stephen Grey Racing", src: "/images/partners/stephen-grey-racing.png" },
    { name: "Arabian Business", src: "/images/partners/arabian-business.png" },
  ];

  const formatDate = (value: string) => {
    const parts = value.split('-');
    if (parts.length !== 3) return value;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  // GSAP scroll reveals
  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      if (newsHeaderRef.current) {
        gsap.fromTo(
          newsHeaderRef.current,
          { x: -60, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: newsHeaderRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      if (featuredHeaderRef.current) {
        const logos = featuredHeaderRef.current.querySelectorAll('.partner-logo-wrapper');
        gsap.fromTo(
          logos,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: featuredHeaderRef.current,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef} className="relative bg-canvas text-white overflow-hidden py-24 bloomberg-showcase">
      <div className="max-w-5xl mx-auto px-12 md:px-16 lg:px-20 w-full space-y-24">
        {/* News and Updates Section - On Top */}
        <div>
          <p className="text-[11px] font-light tracking-[0.2em] uppercase mb-12 text-muted-foreground">
            NEWS AND UPDATES
          </p>
          <div ref={newsHeaderRef} className="grid grid-cols-1 lg:grid-cols-[6fr,4fr] gap-0">
            <a
              href={leadArticle.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative pr-0 lg:pr-12 py-8 flex flex-col justify-center bg-canvas hover:bg-canvas/95 transition-colors duration-300 cursor-pointer"
            >
              <div className="space-y-8 max-w-2xl">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground transition-colors group-hover:text-heading">
                      {formatDate(leadArticle.date)}
                    </span>
                    <div className="h-px w-8 bg-white/10" />
                    <span className="text-xs uppercase tracking-[0.3em] text-foreground transition-colors group-hover:text-heading">
                      {leadArticle.publisher}
                    </span>
                  </div>
                  <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground transition-colors group-hover:text-heading">
                    <span className="relative inline-flex items-center gap-2 overflow-hidden">
                      <span className="relative z-10">Read the full story here</span>
                      <span className="relative z-10">→</span>
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 animate-text-wave"
                        style={{ animationDelay: '1.2s' }}
                      />
                    </span>
                  </div>
                </div>

                <div className="relative w-full h-96 overflow-hidden rounded-sm shadow-2xl opacity-90 transition-opacity duration-500 group-hover:opacity-100">
                  {leadArticle.imageUrl && (
                    <Image
                      src={leadArticle.imageUrl}
                      alt={leadArticle.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  )}
                </div>

                <h3 className="text-3xl md:text-4xl font-light leading-[1.15] tracking-tight text-heading transition-colors duration-300 group-hover:text-heading">
                  {leadArticle.title}
                </h3>

                <p className="text-[15px] md:text-[17px] font-light leading-[1.7] text-muted-foreground transition-colors duration-300 group-hover:text-muted-foreground">
                  {leadArticle.excerpt}
                </p>
              </div>
            </a>

            <div className="relative bg-canvas flex flex-col pl-0 lg:pl-12 py-8">
              <div
                className={`relative overflow-x-hidden ${
                  shouldRotate ? (openArticleUrl ? 'overflow-y-auto' : 'overflow-hidden') : ''
                }`}
                style={
                  shouldRotate && itemHeight
                    ? { height: itemHeight * visibleCount }
                    : undefined
                }
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div
                  className="space-y-0"
                  style={
                    shouldRotate && itemHeight
                      ? {
                          transform: isAnimating ? `translateY(-${itemHeight}px)` : 'translateY(0px)',
                          transition: isAnimating
                            ? `transform ${animationDuration}ms ease-in-out`
                            : 'none',
                        }
                      : undefined
                  }
                >
                  {renderArticles.map((article, index) => {
                    const isOpen = openArticleUrl === article.url;
                    const lastVisibleIndex = shouldRotate
                      ? isAnimating
                        ? visibleCount
                        : visibleCount - 1
                      : renderArticles.length - 1;
                    const isLast = index === lastVisibleIndex;
                    return (
                      <div
                        key={`${article.url}-${index}`}
                        ref={index === 0 ? itemRef : undefined}
                        className={`transition-all duration-300 ease-out hover:border-border ${
                          isLast ? '' : 'border-b border-border'
                        }`}
                      >
                        <button
                          onClick={() => toggleArticle(article)}
                          className="w-full text-left py-6 group"
                        >
                          <div className="flex items-center justify-between gap-6">
                            <div className="flex flex-col gap-2">
                              <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                                {article.publisher}
                              </span>
                              <span className="text-[15px] md:text-[16px] font-light text-heading line-clamp-2">
                                {article.title}
                              </span>
                            </div>
                            <svg
                              className={`h-4 w-4 shrink-0 transition-all duration-300 ease-out ${
                                isOpen ? 'rotate-45 text-foreground' : 'rotate-0 text-muted-foreground'
                              } group-hover:text-frost`}
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
                        <div
                          className={`overflow-hidden transition-all duration-500 ease-out ${
                            isOpen ? 'max-h-[900px] opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div
                            className={`pt-2 pb-8 space-y-4 transition-all duration-300 ease-out ${
                              isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                                {formatDate(article.date)}
                              </span>
                              <div className="h-px w-6 bg-white/10" />
                              <span className="text-[10px] uppercase tracking-[0.3em] text-foreground">
                                {article.publisher}
                              </span>
                            </div>

                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm grayscale hover:grayscale-0 transition-all duration-700">
                                {article.imageUrl && (
                                  <Image
                                    src={article.imageUrl}
                                    alt={article.title}
                                    fill
                                    className="object-cover"
                                  />
                                )}
                              </div>
                            </a>

                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <h4 className="text-[17px] md:text-[19px] font-light leading-tight tracking-tight text-heading hover:text-white transition-colors">
                                {article.title}
                              </h4>
                            </a>

                            <p className="text-[14px] md:text-[15px] font-light leading-[1.7] text-muted-foreground line-clamp-4">
                              {article.excerpt}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-10">
                <Link
                  href="/press"
                  className="text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-white transition-colors group"
                >
                  <span className="relative inline-flex items-center gap-2 overflow-hidden">
                    <span className="relative z-10">View All Press Coverage</span>
                    <span className="relative z-10 group-hover:translate-x-1 transition-transform">→</span>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 animate-text-wave"
                    />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* As Featured In Section - On Bottom */}
        <div>
          <p className="text-[11px] font-light tracking-[0.2em] uppercase text-muted-foreground mb-12">
            AS FEATURED IN
          </p>
          <div ref={featuredHeaderRef} className="pb-6">
            <LogoCarousel logos={partnerLogos} speed={16} logoHeight={35} />
          </div>
        </div>
      </div>
    </section>
  );
}
