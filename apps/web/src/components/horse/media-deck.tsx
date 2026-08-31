'use client';

import * as React from 'react';

export interface MediaDeckProps {
  heroImage: string;
  gallery: string[];
  videoUrl?: string;
  age?: number;
  sex?: string;
  colour?: string;
  sire?: string;
  dam?: string;
  /** Breadcrumb name shown top-left (prod style: MARKETPLACE / <NAME>). */
  breadcrumbName?: string;
}

interface Slide {
  src: string;
  type: 'image' | 'video';
}

const CHEVRON_LEFT = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const CHEVRON_RIGHT = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const CLOSE_X = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const PLAY_TRIANGLE = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="6 3 21 12 6 21" />
  </svg>
);

function buildDeck(heroImage: string, gallery: string[], videoUrl?: string): Slide[] {
  const deck: Slide[] = [{ src: heroImage, type: 'image' }];
  if (videoUrl) deck.splice(1, 0, { src: videoUrl, type: 'video' });
  for (const img of gallery) deck.push({ src: img, type: 'image' });
  return deck;
}

const ARROW_CLASSES =
  'absolute top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all duration-300 h-10 w-10 flex items-center justify-center';
const SPEC_LABEL = 'text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground';
const SPEC_VALUE = 'mt-1 text-[15px] font-light text-heading';

function SpecCell({ label, value }: { label: string; value?: string }) {
  return (
    <div className="text-left">
      <p className={SPEC_LABEL}>{label}</p>
      <p className={SPEC_VALUE}>{value || '—'}</p>
    </div>
  );
}

export function MediaDeck({ heroImage, gallery, videoUrl, age, sex, colour, sire, dam, breadcrumbName }: MediaDeckProps) {
  const deck = React.useMemo(() => buildDeck(heroImage, gallery, videoUrl), [heroImage, gallery, videoUrl]);
  const totalSlides = deck.length;
  const videoIndex = videoUrl ? 1 : -1; // deck order: hero, [video], ...gallery

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const playTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1s-delay muted autoplay on arrival; pause when leaving the slide.
  React.useEffect(() => {
    if (playTimer.current) {
      clearTimeout(playTimer.current);
      playTimer.current = null;
    }
    if (currentIndex !== videoIndex) {
      const v = videoRef.current;
      if (v && !v.paused) v.pause();
      return;
    }
    const v = videoRef.current;
    if (!v) return;
    playTimer.current = setTimeout(() => {
      const p = v.play();
      if (p !== undefined) p.catch(() => {});
    }, 1000);
    return () => {
      if (playTimer.current) clearTimeout(playTimer.current);
    };
  }, [currentIndex, videoIndex]);

  // Escape closes lightbox (document-level, works without focus)
  React.useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lightboxOpen]);

  const slide = deck[currentIndex];
  const prev = () => setCurrentIndex((i) => (i - 1 + totalSlides) % totalSlides);
  const next = () => setCurrentIndex((i) => (i + 1) % totalSlides);

  return (
    <div className="w-full">
      {/* Hero — constant aspect box (prod base: shaded surface-base fill behind photo) */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-surface-base">
        {slide && (
          <button
            type="button"
            className="absolute inset-0 flex cursor-zoom-in items-center justify-center"
            aria-label={slide.type === 'video' ? 'Open video full size' : 'Open image full size'}
            onClick={() => setLightboxOpen(true)}
          >
            {slide.type === 'image' ? (
              <img src={slide.src} alt={`Horse media slide ${currentIndex + 1}`} className="max-h-full max-w-full object-contain" />
            ) : (
              <video ref={videoRef} src={slide.src} muted loop playsInline className="max-h-full max-w-full object-contain" />
            )}
          </button>
        )}

        <button type="button" onClick={prev} className={`${ARROW_CLASSES} left-3`} aria-label="Previous image">
          {CHEVRON_LEFT}
        </button>
        <button type="button" onClick={next} className={`${ARROW_CLASSES} right-3`} aria-label="Next image">
          {CHEVRON_RIGHT}
        </button>

        <div className="absolute bottom-4 right-4 rounded-md border border-border/80 bg-background/80 px-3 py-1.5 font-mono text-xs text-foreground backdrop-blur-md">
          {`${String(currentIndex + 1).padStart(2, '0')} · ${String(totalSlides).padStart(2, '0')}`}
        </div>
      </div>

      {/* Base-info strip — prod style: surface-base card, AGE | SEX | COLOUR | SIRE | DAM.
          Content-sized cells hugging the left (founder: compact cells left, no spread). */}
      <div className="mt-4 flex flex-wrap gap-x-10 gap-y-4 rounded-2xl border border-border bg-surface-base p-6">
        <SpecCell label="Age" value={age !== undefined ? String(age) : undefined} />
        <SpecCell label="Sex" value={sex} />
        <SpecCell label="Colour" value={colour} />
        <SpecCell label="Sire" value={sire} />
        <SpecCell label="Dam" value={dam} />
      </div>

      {/* Thumbnail row */}
      <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
        {deck.map((s, idx) => (
          <button
            key={s.src + idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border transition-all duration-300 ${
              currentIndex === idx ? 'border-accent' : 'border-border opacity-60 hover:opacity-100'
            }`}
          >
            {s.type === 'video' ? (
              <span className="relative block h-full w-full">
                <video src={s.src} preload="metadata" muted playsInline className="h-full w-full object-cover" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm">
                    {PLAY_TRIANGLE}
                  </span>
                </span>
              </span>
            ) : (
              <img src={s.src} alt={`Slide ${idx + 1}`} className="h-full w-full object-cover" />
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && slide && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 p-8 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            {slide.type === 'image' ? (
              <img src={slide.src} alt={`Horse media slide ${currentIndex + 1}`} className="max-h-[90vh] max-w-[90vw] object-contain" />
            ) : (
              <video
                src={slide.src}
                muted
                loop
                playsInline
                controls
                className="max-h-[90vh] max-w-[90vw] object-contain"
              />
            )}

            <button
              type="button"
              className={`${ARROW_CLASSES} right-3 top-3 translate-y-0`}
              onClick={(e) => {
                e.stopPropagation();
                setLightboxOpen(false);
              }}
              aria-label="Close"
            >
              {CLOSE_X}
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); prev(); }} className={`${ARROW_CLASSES} left-3`} aria-label="Previous image">
              {CHEVRON_LEFT}
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); next(); }} className={`${ARROW_CLASSES} right-3`} aria-label="Next image">
              {CHEVRON_RIGHT}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
