"use client";

import Image from "next/image";

interface FixedBgProps {
  src: string;
  height?: string;
  alt?: string;
}

export function FixedBg({ src, height = "h-[50vh]", alt = "Background" }: FixedBgProps) {
  return (
    <div className={`relative w-full ${height} overflow-hidden`}>
      <Image src={src} alt={alt} fill sizes="100vw" className="object-cover" priority={false} />
    </div>
  );
}