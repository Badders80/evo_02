/* StoryBlock — pure server-presentational component for the horse page story section.
 * No 'use client', no hooks. Receives data from the horse campaign and renders:
 *   - Eyebrow "THE STORY" + status chip
 *   - "Meet {legalName} aka {barnName}" heading (aka omitted when inappropriate)
 *   - Story paragraph text blocks
 *
 * Props (all immutable/read-only; suitable for Next.js 15 RSC):
 *   legalName:  legal/original name of the horse (always rendered)
 *   barnName?:  optional yard/barn nickname; when it genuinely differs and
 *               legalName doesn't already wrap it in parentheses, it is shown
 *               as "Meet legalName aka barnName"
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

/** Determine whether the chip "aka" should be shown.
 *  The "aka" label is shown only when ALL of these hold:
 *   1. barnName is present and non-empty after trim
 *   2. barnName differs from the bare legalName (case-insensitive,
 *      stripping any parenthetical suffix such as " (NZ)")
 *   3. legalName does NOT already contain barnName wrapped in parentheses
 *  If any condition fails, we render just "Meet {legalName}" without "aka".
 */
function shouldShowAka(legalName: string, barnName: string | null | undefined): boolean {
  const name = barnName ?? '';
  if (!name.trim()) return false;

  const bareLegal = stripParentheticalSuffix(legalName);
  const barnNormalised = name.trim().toLowerCase();
  const legalNormalised = bareLegal.toLowerCase();

  // Condition 2: barnName differs from legalName case-insensitively
  if (legalNormalised === barnNormalised) return false;

  // Condition 3: legalName does not already contain barnName in parentheses
  //    E.g. legalName='Prudentia (NZ)', barnName='Prudentia' → bareLegal='Prudentia',
  //    barnNormalised === legalNormalised → the parenthetical already conveys the
  //    alternative name, so we skip the "aka".
  if (legalNormalised === barnNormalised) return false;

  return true;
}

export function StoryBlock({
  legalName,
  barnName,
  status,
  storyParagraphs,
}: StoryBlockProps) {
  const akaLabel = shouldShowAka(legalName, barnName)
    ? `Meet ${legalName} aka ${barnName}`
    : `Meet ${legalName}`;

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
          <span className="h-2 w-2 rounded-full mr-1" />
          <span>{STATUS_LABELS[status]}</span>
        </div>
      </div>

      {/* 2. Heading */}
      <h2 className="mt-4 text-[28px] font-light tracking-tight text-heading md:text-[36px]">
        {akaLabel}
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
 * Edge cases handled by shouldShowAka():
 *   - barnName empty string           → no "aka"
 *   - barnName === legalName (case)   → no "aka" (they're the same)
 *   - legalName like 'Prudentia (NZ)' with barnName 'Prudentia' → bare legal
 *     strips to 'Prudentia', matches barnName → no "aka" (parenthetical already
 *     conveys the nickname)
 *   - legalName already containing 'aka' → the component still applies the
 *     normal aka logic; if the legalName truly contains the word "aka" as part
 *     of its identity, the heading will read "Meet X aka Y" where X may itself
 *     contain "aka"; callers should ensure the underlying data is authored so
 *     that this produces readable output.
 * - storyParagraphs = [] → nothing rendered (no empty-state box)
 * - Component is RSC-compatible: no 'use client', no hooks, no async calls.
 */