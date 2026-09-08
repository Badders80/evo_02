// apps/web/src/lib/eligibility.ts
export const ELIGIBILITY_MONTHS = 2;

/**
 * Hard-coded eligibility gate: an investor is eligible for a race's stakes
 * only if race_date - investment_date >= 2 CALENDAR months. Anchored on
 * investment date vs race date — distribution date is irrelevant.
 *
 * Calendar-month (not 60-day) arithmetic, consistent with the locked
 * "whole-month units only" model: add 2 months to the investment date and
 * require the race date to be on or after that. Handles 28/30/31-day months
 * and month-end boundaries correctly.
 */
export function isEligibleForRace(investmentDate: Date, raceDate: Date): boolean {
  const invest = investmentDate.getTime();
  const race = raceDate.getTime();
  if (!Number.isFinite(invest) || !Number.isFinite(race)) return false;
  const eligibleFrom = addCalendarMonths(investmentDate, ELIGIBILITY_MONTHS);
  return race >= eligibleFrom.getTime();
}

/** Adds N calendar months, clamping the day to the target month's last day. */
function addCalendarMonths(date: Date, months: number): Date {
  const d = new Date(date);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, lastDay));
  return d;
}
