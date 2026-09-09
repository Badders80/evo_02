/**
 * Live DSL rehearsal — generate Manolo's three docs from PROD Supabase.
 *
 * Reads prod data via the Supabase Management API (database/query) because the
 * local .env.local points at a stale local Supabase. Runs the REAL generator
 * (compileLegalPack from @evo/legal_engine) — the same code path the app uses.
 * Writes term sheet / PDS / SA markdown to war-room/_today/ for founder eyeball.
 *
 * Run: pnpm --filter @evo/legal_engine exec tsx scripts/rehearse-dsl-prod.ts
 */
import fs from 'fs';
import path from 'path';
import { compileLegalPack, computeDslPricing } from '../src';

const REF = 'ejdenhlpvtldiljxawtd';
const SLUG = 'i-stole-a-manolo';
const OUT_DIR = '/home/evo/evolution/workspace/war-room/_today';

// Read the Supabase management token (same one used to apply migrations).
const TOKEN = fs.readFileSync('/home/evo/.supabase/access-token', 'utf8').trim();

async function query(sql: string): Promise<Record<string, unknown>[]> {
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  if (!res.ok) {
    throw new Error(`query failed (${res.status}): ${await res.text()}`);
  }
  return (await res.json()) as Record<string, unknown>[];
}

async function main() {
  const rows = await query(
    `select * from public.inventory where slug = '${SLUG}'`
  );
  const inv = rows[0];
  if (!inv) {
    console.error(`Campaign not found: ${SLUG}`);
    process.exit(1);
  }

  const owners = await query(`select slug, entity, contact from public.owners`);
  const owner = owners.find((o) => o.slug === 'bax-bloodstock') ?? owners[0];

  const ped = (inv.pedigree_data ?? {}) as Record<string, unknown>;
  const soft = (inv.soft_legal ?? {}) as Record<string, unknown>;
  const marketing = (inv.marketing ?? {}) as Record<string, unknown>;

  const pricing = computeDslPricing(Number(inv.cost_monthly_nzd), 1.0);

  const context = {
    syndicateName: `${inv.legal_name} Syndicate`,
    campaignSlug: inv.slug as string,
    ownerName: (owner?.entity as string) ?? 'B.A.X Bloodstock',
    horse: {
      legalName: inv.legal_name as string,
      barnName: (inv.barn_name as string) || (inv.legal_name as string),
      foalingYear: ped.foaling_date
        ? parseInt(String(ped.foaling_date).split('-')[0], 10)
        : 0,
      gender: (ped.gender as 'Colt' | 'Filly' | 'Gelding' | 'Mare' | 'Horse') ?? 'Filly',
      breeder: (ped.breeder as string) ?? '',
      microchip: (ped.microchip as string) ?? undefined,
      sire: (inv.sire as string) ?? '',
      dam: (inv.dam as string) ?? '',
    },
    trainer: {
      name: inv.trainer_name as string,
      location: inv.trainer_location as string,
      managerEntity: 'Evolution Stables',
    },
    pricing,
    closeStyle: (inv.close_style as 'fourteen_day' | 'three_x_remaining') ?? 'fourteen_day',
    totalHorsePercentage: Number(inv.listed_stake_pct),
    totalShares: Number(inv.total_shares),
    sharesAvailable: Number(inv.shares_available),
    paymentModel: (inv.payment_style as 'subscription_float' | 'upfront') ?? 'subscription_float',
    termStartDate: (inv.term_start_date as string) ?? undefined,
    termEndDate: (inv.term_end_date as string) ?? undefined,
    distributionSplit: (inv.distribution_split as string) ?? undefined,
    distributionSchedule: (inv.distribution_schedule as string) ?? undefined,
    minInvestmentPct: Number(inv.min_stake_pct ?? 1.0),
    stakeStepPct: Number(inv.stake_step_pct ?? 0.5),
    pdsVersion: '1.0.0',
    saVersion: '1.0.0',
    effectiveDate: (inv.term_start_date as string) ?? undefined,
    softLegal: {
      aboutHorse: (soft.aboutHorse as string) ?? '',
      trainerBio: (soft.trainerBio as string) ?? '',
      racingOutlookAndPedigree: (soft.racingOutlookAndPedigree as string) ?? '',
      raceExpectation: (soft.raceExpectation as string) ?? undefined,
    },
    marketing: {
      marketplaceHook: (marketing.marketplaceHook as string) ?? '',
      highlightTags: (marketing.highlightTags as string[]) ?? [],
    },
  };

  const { pack } = compileLegalPack(context, { skipValidation: true });

  const files = {
    'manolo-term-sheet.md': pack.termSheetMarkdown,
    'manolo-pds.md': pack.pdsMarkdown,
    'manolo-sa.md': pack.saMarkdown,
  };

  for (const [name, content] of Object.entries(files)) {
    const p = path.join(OUT_DIR, name);
    fs.writeFileSync(p, content);
    console.log(`WROTE ${p} (${content.length} chars)`);
  }

  console.log('\n=== HASHES ===');
  console.log(`termSheetHash: ${pack.termSheetHash}`);
  console.log(`pdsHash:       ${pack.pdsHash}`);
  console.log(`saHash:        ${pack.saHash}`);

  console.log('\n=== CAMPAIGN STATE (prod) ===');
  console.log(`status: ${inv.status}`);
  console.log(`paymentModel: ${inv.payment_style}`);
  console.log(`wholesale: $${inv.cost_monthly_nzd}`);
  console.log(`term: ${inv.term_start_date} -> ${inv.term_end_date}`);
  console.log(`distributionSplit: ${inv.distribution_split ?? '(unset)'}`);
  console.log(`distributionSchedule: ${inv.distribution_schedule ?? '(unset)'}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
