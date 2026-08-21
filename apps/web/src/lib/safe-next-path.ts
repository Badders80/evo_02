/** Relative in-app path only. Rejects protocol-relative and open redirects. */
export function safeNextPath(raw: string | null | undefined, fallback = '/mystable'): string {
  if (!raw) return fallback;
  if (!raw.startsWith('/') || raw.startsWith('//')) return fallback;
  if (raw.includes('\\') || raw.includes('://')) return fallback;
  return raw;
}
