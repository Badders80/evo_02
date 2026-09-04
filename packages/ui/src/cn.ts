import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Class combiner — mirrors the @evo/brand_dna idiom (clsx + tailwind-merge). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
