/* CampaignStatusBlock — server-presentational component for the horse page
 * below the story section, above DetailTabs.
 * Renders what's-next, investor update link + count, and trainer quote
 * from the campaign.softLegal fields (dual-shape camelCase + snake_case).
 *
 * Props (all immutable/read-only; suitable for Next.js 15 RSC):
 *   nextUp?:       string | null   — "What's Next" headline text
 *   latestUpdateUrl?: string | null — URL for the latest investor update
 *   updateCount?:  number | null   — how many investor updates sent
 *   trainerQuote?: string | null   — pull-quote text from the trainer
 */

/** Label classes: uppercase tracking, smaller size, muted foreground. */
const LABEL_CLASSES =
  'text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground';

/** Body classes: font-light, normal size, foreground. */
const BODY_CLASSES = 'text-[14px] font-light text-foreground';

/** Pull-quote classes: gold-accent border, muted foreground, font-light. */
const PULL_QUOTE_CLASSES =
  'rounded-2xl border border-accent/20 bg-accent/5 p-4 border-border font-light text-[13px] leading-relaxed text-foreground';

export function CampaignStatusBlock({
  nextUp,
  latestUpdateUrl,
  updateCount,
  trainerQuote,
}: {
  nextUp?: string | null;
  latestUpdateUrl?: string | null;
  updateCount?: number | null;
  trainerQuote?: string | null;
}) {
  /* ---- 1. What's Next block ---- */
  if (nextUp && nextUp.trim()) {
    return (
      <div key="next-up" className="space-y-2">
        <p className={LABEL_CLASSES}>What's Next</p>
        <p className={BODY_CLASSES}>{nextUp.trim()}</p>
      </div>
    );
  }

  /* ---- 2. Investor update link + count ---- */
  if (latestUpdateUrl && latestUpdateUrl.trim() && (updateCount ?? 0) > 0) {
    return (
      <div key="investor-update" className="space-y-2">
        <p className={LABEL_CLASSES}>Investor updates</p>
        <a
          href={latestUpdateUrl.trim()}
          target="_blank"
          rel="noopener noreferrer"
          className="font-light transition-colors hover:text-accent"
        >
          Read the latest investor update →
        </a>
        <p className={LABEL_CLASSES}>
          {String(updateCount)} investor updates sent
        </p>
      </div>
    );
  }

  /* ---- 3. Trainer quote (pull-quote) ---- */
  if (trainerQuote && trainerQuote.trim()) {
    return (
      <div key="trainer-quote" className={PULL_QUOTE_CLASSES}>
        <span className="font-light">{trainerQuote.trim()}</span>
      </div>
    );
  }

  return null;
}