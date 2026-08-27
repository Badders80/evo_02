"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface LogoItem {
  name: string;
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface LogoCarouselProps {
  logos: LogoItem[];
  /** Scroll speed in seconds for one full loop. Default 30s */
  speed?: number;
  /** Logo height in px. Default 28 */
  logoHeight?: number;
  className?: string;
}

export function LogoCarousel({
  logos,
  speed = 30,
  logoHeight = 28,
  className,
}: LogoCarouselProps) {
  // Duplicate logos for seamless loop
  const loopLogos = [...logos, ...logos];

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Edge fade masks — left and right */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-canvas to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-canvas to-transparent"
        aria-hidden
      />

      {/* Scrolling track — duplicated for seamless loop */}
      <div
        className="flex items-center gap-12 whitespace-nowrap will-change-transform"
        style={{
          animation: `logo-scroll ${speed}s linear infinite`,
        }}
      >
        {loopLogos.map((logo, index) => (
          <img
            key={`${logo.name}-${index}`}
            src={logo.src}
            alt={logo.alt ?? logo.name}
            height={logoHeight}
            width={logo.width ?? logoHeight * 3}
            style={{ height: logoHeight, width: "auto", objectFit: "contain" }}
            className="shrink-0 opacity-60 grayscale transition-opacity duration-300 hover:opacity-90"
          />
        ))}
      </div>
    </div>
  );
}