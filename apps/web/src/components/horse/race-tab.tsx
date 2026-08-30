// Race Record Tab — server-compatible, no hooks
// Used inside the RACE RECORD tab of the horse page

interface RaceLogEntry {
  date: string;
  venue: string;
  race: string;
  trackCondition?: string;
  result?: string;
  margin?: string;
  distance_m?: number;
  race_class?: string;
  jockey?: string;
  prizemoney_nzd?: number;
  starting_price?: string;
}

interface RaceTabProps {
  horseName: string;
  raceLog?: RaceLogEntry[];
  status: 'listed' | 'coming_soon' | 'fully_subscribed' | 'completed';
  breedingUrl?: string;
  nztrUrl?: string;
}

/** Status‑aware empty‑state copy (founder‑approved). */
const EMPTY_COPY: Record<'listed' | 'coming_soon' | 'fully_subscribed' | 'completed', string> = {
  completed: 'No recent starts recorded in our timeline. View the Full NZTR Record for complete race history.',
  fully_subscribed: 'No recent starts recorded yet. Horse may be in early campaign or pre‑race preparation.',
  listed: 'No recent starts recorded. Horse is currently in pre‑training preparation.',
  coming_soon: 'No recent starts recorded. Horse is currently in pre‑training preparation.',
};

/** Format NZ dollar amount to en‑NZ notation. */
function formatPrizemoney(amount?: number): string {
  if (amount === undefined || amount === null) return '';
  return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(amount);
}

/** Determine if a result counts as a win. */
function isWin(result?: string): boolean {
  if (!result) return false;
  const trimmed = result.trim();
  return trimmed === '1st' || trimmed.startsWith('1st ');
}

/** Determine if a result counts as a place (2nd or 3rd). */
function isPlace(result?: string): boolean {
  if (!result) return false;
  const trimmed = result.trim();
  return trimmed === '2nd' || trimmed === '3rd';
}

/** Count wins and places from race log entries. */
function computeSummary(raceLog: RaceLogEntry[]): { wins: number; places: number } {
  let wins = 0;
  let places = 0;
  for (const entry of raceLog) {
    if (isWin(entry.result)) wins++;
    if (isPlace(entry.result)) places++;
  }
  return { wins, places };
}

/** Render the status‑mapped empty‑state message. */
function EmptyState({ status }: { status: string }) {
  const copy = EMPTY_COPY[status as keyof typeof EMPTY_COPY];
  return (
    <div className="mt-3 text-sm font-light text-muted-foreground">
      {copy}
    </div>
  );
}

/** Render a single timeline row for a race entry. */
function TimelineRow({ entry }: { entry: RaceLogEntry }) {
  const date = new Date(entry.date);
  const formattedDate = date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const resultClass = entry.result
    ? entry.result.trim() === '1st'
      ? 'border-status-active/40 bg-status-active/10 text-status-active'
      : entry.result.trim() === '2nd' || entry.result.trim() === '3rd'
        ? 'border-accent/40 bg-accent/10 text-accent'
        : 'border-border bg-card text-muted-foreground'
    : 'border-border bg-card text-muted-foreground';

  const prizemoney = formatPrizemoney(entry.prizemoney_nzd);

  return (
    <div
      key={`${entry.date}-${entry.venue}`}
      className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-xl border border-border bg-card/40 px-4 py-3"
    >
      <span className="font-mono text-xs text-muted-foreground">{formattedDate}</span>

      <div className="text-sm text-heading">
        {entry.venue} {entry.race}
      </div>

      <span className={resultClass} style={{ padding: '2px 6px', borderRadius: '3px' }}>
        {entry.result || '-'}
      </span>

      <span className="text-xs font-mono text-muted-foreground">
        {entry.distance_m ? `${entry.distance_m}m` : ''}
      </span>

      <span className="text-xs font-light text-muted-foreground">{entry.jockey || '-'}</span>

      <span className="text-xs font-mono text-muted-foreground">{prizemoney}</span>

      <span className="text-xs font-mono text-muted-foreground">{entry.starting_price || '-'}</span>
    </div>
  );
}

/** Render the race record tab. */
export function RaceTab({
  horseName,
  raceLog,
  status,
  breedingUrl,
  nztrUrl,
}: RaceTabProps) {
  // Compute summary from data (never hardcoded)
  const { wins, places } = raceLog ? computeSummary(raceLog) : { wins: 0, places: 0 };
  const hasData = raceLog && raceLog.length > 0;

  // Sort entries by date descending (for timeline render)
  const sortedLog = raceLog
    ? [...raceLog].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    : [];

  return (
    <div className="space-y-6">
      {/* ── 1. Header row ────────────────────────────────────────────── */}
      <div className="flex items-start gap-4">
        <h3 className="text-lg font-medium text-heading">
          Race Timeline & Starts
        </h3>

        {/* Right‑aligned link row */}
        <div className="ml-auto flex items-center gap-2">
          {breedingUrl && (
            <a
              href={breedingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-mono uppercase tracking-widest text-accent hover:underline"
            >
              BREEDING RECORD ↗
            </a>
          )}

          {nztrUrl && (
            <a
              href={nztrUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-mono uppercase tracking-widest text-accent hover:underline"
            >
              FULL NZTR RECORD ↗
            </a>
          )}
        </div>
      </div>

      {/* ── 2. Summary line ──────────────────────────────────────────── }}
      <p
        className="text-xs font-mono text-muted-foreground"
      >
        {wins + places === 0
          ? 'Summary: None Wins · None Places'
          : `${wins} Win${wins !== 1 ? 's' : ''} · ${places} Place${places !== 1 ? 's' : ''}`}
      </p>

      {/* ── 3. Empty state ───────────────────────────────────────────── */}
      {hasData ? null : (
        <EmptyState status={status} />
      )}

      {/* ── 4. Timeline ──────────────────────────────────────────────── */}
      {hasData && raceLog ? (
        <div>
          {sortedLog.map((entry, idx) => (
            <TimelineRow key={idx} entry={entry} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
