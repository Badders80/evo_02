/**
 * computeRaceSummary — compute wins, places, and earnings from a race log.
 * Never hardcoded; always derived from raceLog entries.
 *
 * isWin: result starts with '1st'
 * isPlace: result is '2nd' or '3rd'
 * earnings: sum of prizemoney_nzd, skipping non-numbers
 */
export interface RaceLogEntry {
  date: string;
  venue: string;
  race: string;
  trackCondition?: string;
  result?: string;
  margin?: string;
  distance_m?: number;
  race_class?: string;
  jockey?: string;
  prizemoney_nzd?: number | string;
  starting_price?: string;
}

export interface ComputeRaceSummaryResult {
  wins: number;
  places: number;
  earnings: number;
}

export function computeRaceSummary(
  raceLog: RaceLogEntry[] | null | undefined
): ComputeRaceSummaryResult {
  let wins = 0;
  let places = 0;
  let earnings = 0;

  const entries = raceLog ?? [];

  for (const entry of entries) {
    const result = (entry.result || '').trim();

    // isWin: result starts with '1st'
    if (result === '1st' || result.startsWith('1st ')) {
      wins++;
    }

    // isPlace: result is '2nd' or '3rd'
    if (result === '2nd' || result === '3rd') {
      places++;
    }

    // earnings: sum of prizemoney_nzd, skipping non-numbers
    const pm = entry.prizemoney_nzd;
    if (typeof pm === 'number' && !Number.isNaN(pm)) {
      earnings += pm;
    }
    // if pm is a string that can be parsed as a number, try it
    if (typeof pm === 'string') {
      const parsed = Number(pm);
      if (!Number.isNaN(parsed)) {
        earnings += parsed;
      }
    }
  }

  return { wins, places, earnings };
}