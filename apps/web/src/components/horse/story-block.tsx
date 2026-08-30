/* StoryBlock — pure server-presentational component for the horse page story section.
 * No 'use client', no hooks. Receives data from the horse campaign and renders:
 *   - Eyebrow "THE STORY" + status chip
 *   - "Meet {legalName}" heading — Benedict font, gold #d4a964 (pass-3 founder
 *     spec). When a REAL nickname exists it renders as "(aka Coco)" inline at
 *     30% smaller than the main heading text. No nickname → name only.
 *   - Story paragraph text blocks
 *
 * Props (all immutable/read-only; suitable for Next.js 15 RSC):
 *   legalName:  legal/original name of the horse (always rendered)
 *   barnName?:  optional yard/barn nickname; shown as "(aka {barnName})" at
 *               70% of the heading size ONLY when it genuinely differs from
 *               the legal name (derived non-nicknames are suppressed upstream
 *               at the data layer — see horses-data.ts rowToCampaign)
 *   status:     listing status — drives the colour/label of the status chip
 *   storyParagraphs: array of paragraph strings; a blank array renders nothing
 */

type Status =
  | 'listed'
  | 'coming_soon'
  | 'fully_subscribed'
  | 'completed';

interface StoryBlockProps {
  legalName: string;
  barnName?: string | null;
  status: Status;
  storyParagraphs: string[];
}

const STATUS_CLASSES: Record<Status, string> = {
  listed:
    'rounded-full border border-status-active/40 bg-status-active/10 text-status-active text-[9px] font-medium uppercase tracking-widest',
  coming_soon:
    'rounded-full border border-accent/40 bg-accent/10 text-accent text-[9px] font-medium uppercase tracking-widest',
  fully_subscribed:
    'rounded-full border border-border bg-card text-muted-foreground text-[9px] font-medium uppercase tracking-widest',
  completed:
    'rounded-full border border-border bg-card text-muted-foreground text-[9px] font-medium uppercase tracking-widest',
};

const STATUS_LABELS: Record<Status, string> = {
  listed: 'Become An Owner',
  coming_soon: 'Coming Soon',
  fully_subscribed: 'Fully Subscribed',
  completed: 'Completed',
};

/** Strip a trailing parenthetical suffix (e.g. " (NZ)", " (USA)") from a name. */
function stripParentheticalSuffix(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

/** Determine whether the "(aka …)" segment should be shown.
 *  Shown only when ALL of these hold:
 *   1. barnName is present and non-empty after trim
 *   2. barnName differs from the bare legalName (case-insensitive,
 *      stripping any parenthetical suffix such as " (NZ)")
 *  If any condition fails, we render just "Meet {legalName}" — no aka.
 */
function shouldShowAka(legalName: string, barnName: string | null | undefined): boolean {
  const name = barnName ?? '';
  if (!name.trim()) return false;
  const bareLegal = stripParentheticalSuffix(legalName);
  return name.trim().toLowerCase() !== bareLegal.toLowerCase();
}

/** Pass-3 founder spec: Benedict display font, gold #d4a964 (token text-accent). */
const HEADING_CLASSES =
  'font-benedict mt-4 text-[28px] font-light tracking-tight text-accent md:text-[36px]';

/** Nickname segment renders 30% smaller than the heading (0.7em scales with it). */
const AKA_CLASSES =
  'ml-2 align-baseline font-light text-accent/80 text-[0.7em]';

export function StoryBlock({
  legalName,
  barnName,
  status,
  storyParagraphs,
}: StoryBlockProps) {
  const showAka = shouldShowAka(legalName, barnName);

  return (
    <>
      {/* 1. Eyebrow row + status chip */}
      <div className="flex items-center gap-2">
        <p className="text-[11px] font-light tracking-[0.2em] uppercase text-muted-foreground">
          THE STORY
        </p>

        <div
          className={STATUS_CLASSES[status]}
        >
          <span className="h-2 w-2 rounded-full mr-1 bg-current" aria-hidden="true" />
          <span>{STATUS_LABELS[status]}</span>
        </div>
      </div>

      {/* 2. Heading — Benedict, gold; "(aka X)" at 30% smaller when real */}
      <h2 className={HEADING_CLASSES}>
        Meet {legalName}
        {showAka && (
          <span className={AKA_CLASSES}>
            (aka {barnName})
          </span>
        )}
      </h2>

      {/* 3. Paragraphs — map over storyParagraphs; blank array renders nothing */}
      {storyParagraphs.length > 0 && (
        <>
          {storyParagraphs.map((paragraph, idx) => (
            <p
              key={idx}
              className="mt-4 text-[15px] leading-[1.8] font-light text-foreground"
            >
              {paragraph}
            </p>
          ))}
        </>
      )}
    </>
  );
}

/* ── NOTES FOR FUTURE EDITORS ──────────────────────────────────────────
 * Pass-3 changes (founder-locked):
 *   - Heading font: .font-benedict (Benedict woff2 when the founder drops
 *     it in public/fonts/, Georgia serif fallback until then)
 *   - Heading colour: text-accent = #d4a964
 *   - Nickname: "(aka Coco)" wrapped in parentheses at start AND end,
 *     rendered at 0.7em (30% smaller), same gold at 80% opacity
 *   - Manolo has NO nickname: barn_name='Manolo' is suppressed at the data
 *     layer (horses-data.ts rowToCampaign), so Manolo renders name only.
 * Edge cases handled by shouldShowAka():
 *   - barnName empty string           → no aka
 *   - barnName === legalName (case)   → no aka (they're the same)
 *   - legalName 'Prudentia (NZ)' + barnName 'Prudentia' → no aka
 * - storyParagraphs = [] → nothing rendered (no empty-state box)
 * - Component is RSC-compatible: no 'use client', no hooks, no async calls.
 */
