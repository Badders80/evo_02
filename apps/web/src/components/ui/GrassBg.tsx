"use client";

import Image from "next/image";

interface GrassBgProps {
  src: string;
  alt?: string;
}

export function GrassBg({ src, alt = "Background" }: GrassBgProps) {
  return (
    <div className="relative w-full h-[50vh] overflow-hidden">
      <Image src={src} alt={alt} fill sizes="100vw" className="object-cover" priority={false} />
    </div>
  );
}