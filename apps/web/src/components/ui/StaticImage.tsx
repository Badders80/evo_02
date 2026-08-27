"use client";

import React from "react";
import Image from "next/image";

interface StaticImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  imageClassName?: string;
  opacity?: number;
}

export function StaticImage({
  src,
  alt,
  className = "",
  fill = false,
  priority,
  width,
  height,
  sizes,
  imageClassName,
  opacity = 1,
}: StaticImageProps) {
  return (
    <div
      className={`${fill ? "" : "overflow-hidden"} ${className || ""}`}
      style={{
        position: fill ? ("absolute" as const) : undefined,
        inset: fill ? 0 : undefined,
        opacity: opacity,
      }}
    >
      <Image
        src={src}
        alt={alt}
        priority={priority}
        {...(fill
          ? { fill: true }
          : { width: width || 1920, height: height || 1080 })}
        className={imageClassName || "object-cover"}
        sizes={sizes || (fill ? "100vw" : undefined)}
      />
    </div>
  );
}

export default StaticImage;
