/**
 * DSL Workflow — live capture + approval + flip orchestrator (007 T5a).
 *
 * Walks a horse from clean draft → listed through three doc gates:
 *   term sheet (owner-set fields captured live) → PDS → SA → flip to listed.
 *
 * The term-sheet surface is a CREATE-DSL form: the header (title/version/date/
 * manager) is locked, every body field is a dropdown/input starting blank, and
 * picking the horse cascades microchip/owner/trainer/commercials from prod.
 *
 * Two modes:
 *   serve    — HTTP server: serves the capture form + PDS/SA views, catches
 *              save/approve/pending/delete POSTs, writes prod, advances state.
 *   headless — no server: apply values / approve / flip directly (tests + CI).
 *
 * Data source: PROD Supabase via the Management API (database/query), because
 * local .env.local points at a stale local Supabase. Token: ~/.supabase/access-token.
 *
 * Run:
 *   pnpm --filter @evo/legal_engine exec tsx scripts/dsl-workflow.ts serve --slug i-stole-a-manolo
 *   pnpm --filter @evo/legal_engine exec tsx scripts/dsl-workflow.ts headless --slug i-stole-a-manolo \
 *     --apply '{"distributionSplit":"75% Investor Pool / 25% Owner Retention","distributionSchedule":"Quarterly (2-month paid-up qualification prior to race date)"}' \
 *     --approve all --flip
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { compileLegalPack, computeDslPricing, foalingLabel } from '../src';
import { prefillSoftSections } from '../src/soft-prefill';
import type { SyndicateLegalContext } from '../src';

const REF = 'ejdenhlpvtldiljxawtd';
const OUT_DIR = '/home/evo/evolution/workspace/war-room/_today';
const STATE_FILE = path.join(OUT_DIR, 'dsl-workflow-state.json');
const TOKEN = fs.readFileSync('/home/evo/.supabase/access-token', 'utf8').trim();

// ── Owner-set dropdown options (suggestions only — never a platform default) ──
const SPLIT_OPTIONS = [
  '75% Investor Pool / 25% Owner Retention',
  '80% Investor Pool / 20% Owner Retention',
  '70% Investor Pool / 30% Owner Retention',
  '85% Investor Pool / 15% Owner Retention',
];
const SCHEDULE_OPTIONS = [
  'Quarterly (2-month paid-up qualification prior to race date)',
  'Monthly (2-month paid-up qualification prior to race date)',
  'Quarterly (no qualification)',
  'Monthly (no qualification)',
];

// ── Management API ──────────────────────────────────────────────────────────
async function query(sql: string): Promise<Record<string, unknown>[]> {
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  });
  if (!res.ok) {
    throw new Error(`query failed (${res.status}): ${await res.text()}`);
  }
  return (await res.json()) as Record<string, unknown>[];
}

// ── Registry (all horses / owners / trainers) for the create-DSL form ───────
interface RegistryHorse {
  slug: string;
  legalName: string;
  barnName: string;
  microchip: string;
  sire: string;
  dam: string;
  gender: string;
  breeder: string;
  foalingYear: number;
  ownerSlug: string;
  trainerSlug: string;
  costMonthlyNzd: number;
  listedStakePct: number;
  minStakePct: number;
  stakeStepPct: number;
  termStart: string | null;
  termEnd: string | null;
  closeStyle: string;
  paymentStyle: string;
  status: string;
}
interface RegistryOwner { slug: string; entity: string; contact: string; id: string; }
interface RegistryTrainer { slug: string; name: string; location: string; stableName: string; }
interface Registry {
  horses: RegistryHorse[];
  owners: RegistryOwner[];
  trainers: RegistryTrainer[];
}

async function loadRegistry(): Promise<Registry> {
  const [invRows, ownerRows, trainerRows] = await Promise.all([
    query(`select * from public.inventory order by slug`),
    query(`select id, slug, entity, contact from public.owners`),
    query(`select slug, name, location, stable_name from public.trainer_profiles`),
  ]);

  const owners: RegistryOwner[] = ownerRows.map((o) => ({
    slug: o.slug as string,
    entity: o.entity as string,
    contact: o.contact as string,
    id: o.id as string,
  }));
  const trainers: RegistryTrainer[] = trainerRows.map((t) => ({
    slug: t.slug as string,
    name: t.name as string,
    location: t.location as string,
    stableName: (t.stable_name as string) ?? '',
  }));

  const horses: RegistryHorse[] = invRows.map((inv) => {
    const ped = (inv.pedigree_data ?? {}) as Record<string, unknown>;
    const owner = owners.find((o) => o.id === (inv.owner_id as string));
    const trainer = trainers.find(
      (t) => t.name === (inv.trainer_name as string) || t.stableName === (inv.trainer_name as string)
    );
    return {
      slug: inv.slug as string,
      legalName: inv.legal_name as string,
      barnName: inv.barn_name as string,
      microchip: (ped.microchip as string) ?? '',
      sire: (inv.sire as string) ?? '',
      dam: (inv.dam as string) ?? '',
      gender: (ped.gender as string) ?? '',
      breeder: (ped.breeder as string) ?? '',
      foalingYear: ped.foaling_date ? parseInt(String(ped.foaling_date).split('-')[0], 10) : 0,
      ownerSlug: owner?.slug ?? '',
      trainerSlug: trainer?.slug ?? '',
      costMonthlyNzd: Number(inv.cost_monthly_nzd),
      listedStakePct: Number(inv.listed_stake_pct),
      minStakePct: Number(inv.min_stake_pct),
      stakeStepPct: Number(inv.stake_step_pct),
      termStart: (inv.term_start_date as string) ?? null,
      termEnd: (inv.term_end_date as string) ?? null,
      closeStyle: inv.close_style as string,
      paymentStyle: inv.payment_style as string,
      status: inv.status as string,
    };
  });

  return { horses, owners, trainers };
}

// ── Campaign load (prod → SyndicateLegalContext) ────────────────────────────
/** Inclusive whole-month count between two ISO dates (e.g. 2026-09-01 → 2028-06-30 = 22). */
function monthsBetweenInclusive(start: string | undefined, end: string | undefined): number | undefined {
  if (!start || !end) return undefined;
  const s = new Date(`${start}T00:00:00Z`);
  const e = new Date(`${end}T00:00:00Z`);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e < s) return undefined;
  return (e.getUTCFullYear() - s.getUTCFullYear()) * 12 + (e.getUTCMonth() - s.getUTCMonth()) + 1;
}

async function loadCampaign(slug: string): Promise<{ context: SyndicateLegalContext; inv: Record<string, unknown> }> {
  const rows = await query(`select * from public.inventory where slug = '${slug}'`);
  const inv = rows[0];
  if (!inv) throw new Error(`Campaign not found: ${slug}`);

  const owners = await query(`select slug, entity, contact from public.owners`);
  const owner = owners.find((o) => o.slug === 'bax-bloodstock') ?? owners[0];

  const ped = (inv.pedigree_data ?? {}) as Record<string, unknown>;
  const soft = (inv.soft_legal ?? {}) as Record<string, unknown>;
  const marketing = (inv.marketing ?? {}) as Record<string, unknown>;

  const pricing = computeDslPricing(Number(inv.cost_monthly_nzd), 1.0);

  const context: SyndicateLegalContext = {
    syndicateName: `${inv.legal_name} Syndicate`,
    campaignSlug: inv.slug as string,
    ownerName: (owner?.entity as string) ?? 'B.A.X Bloodstock',
    horse: {
      legalName: inv.legal_name as string,
      barnName: (inv.barn_name as string) || (inv.legal_name as string),
      foalingYear: ped.foaling_date ? parseInt(String(ped.foaling_date).split('-')[0], 10) : 0,
      foalingDate: (ped.foaling_date as string) || undefined,
      gender: (ped.gender as 'Colt' | 'Filly' | 'Gelding' | 'Mare' | 'Horse') ?? 'Filly',
      breeder: (ped.breeder as string) ?? '',
      microchip: (ped.microchip as string) ?? undefined,
      sire: (inv.sire as string) ?? '',
      dam: (inv.dam as string) ?? '',
      studBookUrl: (ped.stud_book_url as string) ?? undefined,
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
    termMonths: monthsBetweenInclusive(inv.term_start_date as string | undefined, inv.term_end_date as string | undefined),
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

  return { context, inv };
}

// ── Prod writes ─────────────────────────────────────────────────────────────
function escSql(s: string): string {
  return s.replace(/'/g, "''");
}

async function applyFullContext(slug: string, data: Record<string, string>) {
  const set: string[] = [];
  const num = (v: string | undefined) => (v === undefined || v === '' ? 'null' : `'${escSql(v)}'`);

  if (data.ownerId !== undefined) set.push(`owner_id = ${data.ownerId ? `'${escSql(data.ownerId)}'` : 'null'}`);
  if (data.trainerName !== undefined) set.push(`trainer_name = ${num(data.trainerName)}`);
  if (data.trainerLocation !== undefined) set.push(`trainer_location = ${num(data.trainerLocation)}`);
  if (data.costMonthlyNzd !== undefined) set.push(`cost_monthly_nzd = ${data.costMonthlyNzd === '' ? 'null' : data.costMonthlyNzd}`);
  if (data.listedStakePct !== undefined) set.push(`listed_stake_pct = ${data.listedStakePct === '' ? 'null' : data.listedStakePct}`);
  if (data.minStakePct !== undefined) set.push(`min_stake_pct = ${data.minStakePct === '' ? 'null' : data.minStakePct}`);
  if (data.stakeStepPct !== undefined) set.push(`stake_step_pct = ${data.stakeStepPct === '' ? 'null' : data.stakeStepPct}`);
  if (data.termStart !== undefined) set.push(`term_start_date = ${data.termStart ? `'${escSql(data.termStart)}'` : 'null'}`);
  if (data.termEnd !== undefined) set.push(`term_end_date = ${data.termEnd ? `'${escSql(data.termEnd)}'` : 'null'}`);
  if (data.closeStyle !== undefined) set.push(`close_style = ${data.closeStyle ? `'${escSql(data.closeStyle)}'` : 'null'}`);
  if (data.paymentStyle !== undefined) set.push(`payment_style = ${data.paymentStyle ? `'${escSql(data.paymentStyle)}'` : 'null'}`);
  if (data.distributionSplit !== undefined) set.push(`distribution_split = ${data.distributionSplit ? `'${escSql(data.distributionSplit)}'` : 'null'}`);
  if (data.distributionSchedule !== undefined) set.push(`distribution_schedule = ${data.distributionSchedule ? `'${escSql(data.distributionSchedule)}'` : 'null'}`);

  if (set.length === 0) return;
  await query(`update public.inventory set ${set.join(', ')} where slug = '${slug}'`);
}

async function setDocStatus(slug: string, doc: 'term_sheet' | 'pds' | 'sa' | 'soft_content', status: 'draft' | 'pending' | 'approved' | 'rejected') {
  const col = `${doc}_status`;
  const lockCol = `${doc}_locked_at`;
  const lockVal = status === 'approved' ? 'now()' : 'null';
  await query(
    `update public.inventory set ${col} = '${status}', ${lockCol} = ${lockVal} where slug = '${slug}'`
  );
}

async function flipListed(slug: string) {
  // The BEFORE UPDATE trigger enforces: listed requires all three docs approved.
  await query(`update public.inventory set status = 'listed' where slug = '${slug}'`);
}

// ── Soft approval stage (4 sections, accordion, Hotta exemplars) ─────────────
type SoftField = 'raceExpectation' | 'aboutHorse' | 'trainerBio' | 'racingOutlookAndPedigree';

const SECTION_DEFS: { field: SoftField; title: string; hint: string }[] = [
  { field: 'raceExpectation', title: 'Key Information — Race Schedule Expectation', hint: 'renders §2.4; forward-looking, yard-confirmed only' },
  { field: 'aboutHorse', title: '§2.1 About Horse', hint: 'identity + profile narrative' },
  { field: 'trainerBio', title: '§2.1 Trainer', hint: 'stable + trainer editorial' },
  { field: 'racingOutlookAndPedigree', title: '§2.3 Racing Outlook & Pedigree', hint: 'sire-line significance, no invented relatives' },
];

// Frozen Hotta excerpts — reference bar only, never rendered into output.
const HOTTA_EXEMPLARS: Record<SoftField, string> = {
  raceExpectation:
    'Hottathanafantasy is returning to training from early January 2026. Syndicate members can expect regular updates and potential race entries as she builds fitness throughout her preparation.',
  aboutHorse:
    'Hottathanafantasy (NZ) is a New Zealand-bred bay filly by the champion sire Contributer (IRE) out of the winning dam Whiffle (USA) — producer of stakes-placed progeny — foaled on 24 October 2023.',
  trainerBio:
    'Wexford Stables is a name synonymous with excellence in New Zealand racing history, continuing its legacy under the leadership of Lance O\u2019Sullivan ONZM and Andrew Scott. Operating out of the world-class facilities in Matamata, Wexford Stables maintains one of the best strike rates in the country, ensuring horses like this promising filly receive top preparation for upcoming trials and races.',
  racingOutlookAndPedigree:
    'Hottathanafantasy carries a pedigree built for performance in Australasian racing conditions, combining a proven commercial sire with a durable New Zealand maternal line. Her sire, Contributer, is one of New Zealand\u2019s leading sires, consistently producing elite performers.',
};

const normSlug = (s: string) =>
  s.toLowerCase().replace(/\s*\([^)]*\)\s*/g, '').trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Merge DB soft_legal (wins) over engine/content pre-fill (drafts blanks). */
function mergedSoft(
  slug: string,
  inv: Record<string, unknown>,
  trainers: { slug: string; name: string; stableName: string }[]
): { texts: Record<SoftField, string>; prefilled: SoftField[]; approved: Record<SoftField, boolean>; rejected: Record<SoftField, boolean> } {
  const soft = ((inv.soft_legal ?? {}) as Record<string, unknown>);
  const sectionState = ((soft._sectionState ?? {}) as Record<string, string>);
  const sire = normSlug(String((inv as Record<string, unknown>).sire ?? ''));
  const matchedTrainers = trainers.filter((t) =>
    String((inv as Record<string, unknown>).trainer_name ?? '').includes(t.name)
  );
  const stableSlug =
    normSlug(matchedTrainers[0]?.stableName ?? '') || undefined;
  const pre = prefillSoftSections({
    horseSlug: slug,
    stableSlug,
    sirePedigreeSlug: sire.split('-').slice(0, 2).join('-') || undefined,
    trainerPersonSlugs: matchedTrainers.map((t) => t.slug),
    barnName: (inv.barn_name as string) || (inv.legal_name as string),
    legalName: inv.legal_name as string,
    racingStatus: (soft.racingStatus as string) || 'in training',
  });
  const texts = {} as Record<SoftField, string>;
  const prefilled: SoftField[] = [];
  for (const d of SECTION_DEFS) {
    const dbVal = (soft[d.field] as string) ?? '';
    if (dbVal) {
      texts[d.field] = dbVal;
    } else {
      texts[d.field] = pre[d.field] ?? '';
      if (texts[d.field]) prefilled.push(d.field);
    }
  }
  const approved = {} as Record<SoftField, boolean>;
  const rejected = {} as Record<SoftField, boolean>;
  for (const d of SECTION_DEFS) {
    approved[d.field] = sectionState[d.field] === 'approved';
    rejected[d.field] = sectionState[d.field] === 'rejected';
  }
  return { texts, prefilled, approved, rejected };
}

async function saveSoftLegalFields(slug: string, fields: Record<string, unknown>): Promise<void> {
  const rows = await query(`select soft_legal from public.inventory where slug = '${slug}'`);
  const current = ((rows[0]?.soft_legal ?? {}) as Record<string, unknown>);
  const merged = { ...current, ...fields };
  await query(`update public.inventory set soft_legal = '${escSql(JSON.stringify(merged))}' where slug = '${slug}'`);
}

// ── State file (so the agent can read progress) ────────────────────────────
function writeState(state: Record<string, unknown>) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ── HTML helpers ────────────────────────────────────────────────────────────
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ── CREATE-DSL capture form (header locked, body = dropdowns/inputs) ────────
function renderTermSheetHtml(registry: Registry, inv: Record<string, unknown>): string {
  const status = inv.term_sheet_status as string;
  const currentSplit = (inv.distribution_split as string) ?? '';
  const currentSchedule = (inv.distribution_schedule as string) ?? '';

  const horsesJson = JSON.stringify(registry.horses);
  const ownersJson = JSON.stringify(registry.owners);
  const trainersJson = JSON.stringify(registry.trainers);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>DSL Term Sheet — Create</title>
<style>
  :root { --ink:#1a1a1a; --muted:#444; --line:#ccc; --blank-bg:#ececec; --blank-border:#bdbdbd; --blank-ink:#9a9a9a; --accent:#d4a964; }
  * { box-sizing:border-box; }
  body { font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; color:var(--ink); line-height:1.55; font-size:13px; background:#f4f4f2; margin:0; padding:24px 0 80px; }
  .sheet { max-width:170mm; margin:0 auto; background:#fff; padding:20mm; box-shadow:0 1px 6px rgba(0,0,0,.08); }
  h1 { font-size:22px; font-weight:600; margin:0 0 2px; }
  .meta { color:var(--muted); font-size:12px; margin:2px 0; }
  h3 { font-size:13px; font-weight:600; margin:18px 0 6px; border-bottom:1px solid #ddd; padding-bottom:4px; }
  ul { margin:4px 0 4px 18px; padding:0; }
  li { margin:4px 0; }
  hr { border:none; border-top:1px solid var(--line); margin:12px 0; }
  table { border-collapse:collapse; width:100%; margin:8px 0; }
  th,td { border:1px solid var(--line); padding:6px 8px; text-align:left; font-size:12px; }
  th { background:#f5f5f5; }
  .fineprint { font-size:10px; color:#666; font-style:italic; }
  .blank { display:inline-block; background:var(--blank-bg); border:1px dashed var(--blank-border); color:var(--blank-ink); border-radius:4px; padding:1px 8px; font-style:italic; font-size:11px; letter-spacing:.02em; }
  select, input[type="text"], input[type="number"], input[type="month"] { font-family:inherit; font-size:12px; color:var(--ink); background:#fff; border:1px solid var(--line); border-radius:4px; padding:3px 6px; max-width:100%; }
  select { min-width:280px; }
  input[type="text"] { min-width:280px; }
  input[type="number"] { width:110px; }
  input[type="month"] { width:150px; }
  select.blank, input.blank { background:var(--blank-bg); border:1px dashed var(--blank-border); color:var(--blank-ink); font-style:italic; }
  select:focus, input:focus { outline:1px solid var(--accent); }
  .auto { color:var(--muted); font-size:11px; }
  .indent { margin-left:24px; }
  .locked { color:var(--muted); }
  .legend { font-size:11px; color:var(--muted); margin:6px 0 0; }
  .lock-tag { color:#155724; font-size:11px; font-weight:600; }
  .var-tag { color:#856404; font-size:11px; font-weight:600; }
  .custom-row { display:none; margin-top:4px; }
  .custom-row.show { display:block; }
  .bar { position:fixed; bottom:0; left:0; right:0; background:#fff; border-top:1px solid var(--line); padding:12px 20px; display:flex; gap:10px; align-items:center; justify-content:center; box-shadow:0 -1px 6px rgba(0,0,0,.06); }
  .bar button { font-family:inherit; font-size:13px; padding:8px 18px; border-radius:6px; border:1px solid var(--line); cursor:pointer; background:#fff; color:var(--ink); }
  .bar button.primary { background:var(--ink); color:#fff; border-color:var(--ink); }
  .bar button.danger { color:#b00020; border-color:#b00020; }
  .bar button:disabled { opacity:.4; cursor:not-allowed; }
  .status-pill { display:inline-block; font-size:11px; padding:2px 10px; border-radius:10px; margin-left:8px; vertical-align:middle; }
  .status-draft { background:#ececec; color:#666; }
  .status-pending { background:#fff3cd; color:#856404; }
  .status-approved { background:#d4edda; color:#155724; }
  .status-rejected { background:#f8d7da; color:#721c24; }
  .toast { position:fixed; top:16px; right:16px; background:var(--ink); color:#fff; padding:10px 16px; border-radius:6px; font-size:13px; opacity:0; transition:opacity .2s; }
  .toast.show { opacity:1; }
  .side { position:fixed; top:0; left:0; bottom:0; width:200px; background:#fff; border-right:1px solid var(--line); padding:16px 12px; display:flex; flex-direction:column; gap:6px; overflow-y:auto; z-index:10; }
  .side .brand { font-size:12px; font-weight:600; margin-bottom:8px; letter-spacing:.02em; }
  .side a { display:block; font-size:12px; color:var(--ink); text-decoration:none; padding:6px 10px; border-radius:6px; }
  .side a:hover { background:#f0f0f0; }
  .side a.active { background:var(--ink); color:#fff; }
  .side .sep { border-top:1px solid var(--line); margin:8px 0; }
  .side button { font-family:inherit; font-size:12px; padding:7px 10px; border-radius:6px; border:1px solid var(--line); cursor:pointer; background:#fff; color:var(--ink); text-align:left; }
  .side button.primary { background:var(--ink); color:#fff; border-color:var(--ink); }
  .side button.danger { color:#b00020; border-color:#b00020; }
  .side button:disabled { opacity:.4; cursor:not-allowed; }
  .sheet { margin-left:240px; }
</style>
</head>
<body>
<div class="side">
  <div class="brand">DSL Workflow</div>
  <a href="/" class="active">Term Sheet</a>
  <a href="/soft-content">Soft Content</a>
  <a href="/pds">PDS</a>
  <a href="/sa">SA</a>
  <a href="/flip">Flip to Listed</a>
  <div class="sep"></div>
  <button id="save" class="primary">Save</button>
  <button id="pending">Pending</button>
  <button id="approve">Approve → PDS</button>
  <button id="delete" class="danger">Delete</button>
</div>
<div class="sheet">
  <h1>DSL Term Sheet - <span id="h-name" class="blank">not filled in yet</span> <span class="status-pill status-${esc(status)}">${esc(status)}</span></h1>
  <p class="meta"><strong>Version:</strong> <span class="locked">1.0.0</span> | <strong>Effective Date:</strong> <span id="h-date" class="blank">not filled in yet</span></p>
  <p class="meta"><strong>Manager:</strong> <span class="locked">Evolution Stables (NZTR Authorised Syndicator)</span></p>
  <hr>

  <h3>1. Thoroughbred &amp; Parties</h3>
  <ul>
    <li><strong>Horse:</strong> <select id="horse" class="blank"><option value="" selected>not filled in yet</option></select></li>
    <li><strong>Microchip / ID:</strong> <span id="microchip" class="blank">not filled in yet</span></li>
    <li><strong>Owner:</strong> <select id="owner" class="blank"><option value="" selected>not filled in yet</option></select></li>
    <li><strong>Trainer:</strong> <select id="trainer" class="blank"><option value="" selected>not filled in yet</option></select></li>
  </ul>

  <h3>2. Syndicate Stake &amp; Commercials</h3>
  <ul>
    <li><strong>Syndicated Stake in Horse:</strong> <input type="number" id="stake" class="blank" step="0.5" min="0.5" max="100" placeholder="not filled in yet"> % available</li>
    <li><strong>Minimum Investment:</strong> <input type="number" id="min" class="blank" step="0.25" min="0.25" placeholder="not filled in yet"> %</li>
    <li><strong>Increments:</strong> <input type="number" id="step" class="blank" step="0.25" min="0.25" placeholder="not filled in yet"> %</li>
    <li><strong>Wholesale Monthly Rate (M):</strong> $<input type="number" id="wholesale" class="blank" step="0.01" min="0" placeholder="not filled in yet"> <span class="auto">/ month per 1% stake</span></li>
    <li><strong>Evolution Margin:</strong> <span class="locked">5.0%</span> | <strong>Platform Fees:</strong> <span class="locked">3.0%</span></li>
    <li><strong>Retail Monthly Rate (M):</strong> <span id="retail" class="blank">not filled in yet</span> <span class="auto">auto</span></li>
    <li><strong>Lease Term:</strong></li>
    <li class="indent"><input type="month" id="termStart" class="blank"> → <input type="month" id="termEnd" class="blank"></li>
    <li class="indent"><span id="termLine" class="auto"></span></li>
  </ul>

  <h3>3. Payment Structure &amp; Float</h3>
  <ul>
    <li><strong>Payment Model:</strong> <select id="model" class="blank"><option value="" selected>not filled in yet</option></select></li>
    <li><strong>Initial Join Payment:</strong> <span id="join" class="blank">not filled in yet</span></li>
    <li><strong>Settlement:</strong> <span id="settlement" class="blank">not filled in yet</span></li>
  </ul>

  <h3>4. Prize Money &amp; Exit Terms</h3>
  <ul>
    <li>
      <strong>Gross Stakes Distribution:</strong>
      <select id="split" class="blank">
        <option value=""${currentSplit ? '' : ' selected'}>not filled in yet</option>
        ${SPLIT_OPTIONS.map((o) => `<option value="${esc(o)}"${o === currentSplit ? ' selected' : ''}>${esc(o)}</option>`).join('')}
        <option value="__custom__"${currentSplit && !SPLIT_OPTIONS.includes(currentSplit) ? ' selected' : ''}>Other (type below)…</option>
      </select>
      <div class="custom-row" id="split-custom-row"><input type="text" id="split-custom" placeholder="Custom split" value="${currentSplit && !SPLIT_OPTIONS.includes(currentSplit) ? esc(currentSplit) : ''}"></div>
    </li>
    <li>
      <strong>Distribution Schedule:</strong>
      <select id="schedule" class="blank">
        <option value=""${currentSchedule ? '' : ' selected'}>not filled in yet</option>
        ${SCHEDULE_OPTIONS.map((o) => `<option value="${esc(o)}"${o === currentSchedule ? ' selected' : ''}>${esc(o)}</option>`).join('')}
        <option value="__custom__"${currentSchedule && !SCHEDULE_OPTIONS.includes(currentSchedule) ? ' selected' : ''}>Other (type below)…</option>
      </select>
      <div class="custom-row" id="schedule-custom-row"><input type="text" id="schedule-custom" placeholder="Custom schedule" value="${currentSchedule && !SCHEDULE_OPTIONS.includes(currentSchedule) ? esc(currentSchedule) : ''}"></div>
    </li>
    <li><strong>Exit / Close Style:</strong> <select id="close" class="blank"><option value="" selected>not filled in yet</option></select></li>
  </ul>

  <hr>
  <p class="fineprint">Summary of terms under the NZTR Code of Practice Rule 22.1. Subject to execution of formal PDS and Syndicate Agreement.</p>
</div>

<div class="toast" id="toast"></div>

<script>
const HORSES = ${horsesJson};
const OWNERS = ${ownersJson};
const TRAINERS = ${trainersJson};
const MODELS = [
  { id:'subscription_float', label:'Subscription Float ($5×M Join + $M/mo Keep)' },
  { id:'upfront', label:'Upfront (Lump Sum for Full Term)' },
];
const CLOSES = [
  { id:'fourteen_day', label:'Lessor 14-Day Break' },
  { id:'three_x_remaining', label:'Early Sale / Buyout (3× remaining lease value)' },
];

const $ = (id) => document.getElementById(id);
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const toast = (msg) => { const t = $('toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2500); };

function formatTermDate(iso) {
  if (!iso) return null;
  const d = new Date(iso + 'T00:00:00Z');
  if (Number.isNaN(d.getTime())) return null;
  return d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
}
function monthsBetween(startIso, endIso) {
  if (!startIso || !endIso) return null;
  const s = new Date(startIso + 'T00:00:00Z');
  const e = new Date(endIso + 'T00:00:00Z');
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null;
  return (e.getUTCFullYear() - s.getUTCFullYear()) * 12 + (e.getUTCMonth() - s.getUTCMonth()) + 1;
}
function lastDayOfMonth(iso) {
  const d = new Date(iso + 'T00:00:00Z');
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
}
function retailFromWholesale(w) { return Math.ceil(w * 1.05 * 1.03); }
function money(n) { return '$' + n.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function setBlank(el, filled) { if (filled) el.classList.remove('blank'); else el.classList.add('blank'); }

// Populate dropdowns
function fillSelect(sel, items, labelFn) {
  for (const it of items) {
    const o = document.createElement('option');
    o.value = it.id ?? it.slug;
    o.textContent = labelFn(it);
    sel.appendChild(o);
  }
}
fillSelect($('horse'), HORSES, (h) => h.legalName + (h.barnName && h.barnName !== h.legalName ? ' (' + h.barnName + ')' : ''));
fillSelect($('owner'), OWNERS, (o) => o.entity + (o.contact ? ' (' + o.contact + ')' : ''));
fillSelect($('trainer'), TRAINERS, (t) => t.name + ' — ' + t.location);
fillSelect($('model'), MODELS, (m) => m.label);
fillSelect($('close'), CLOSES, (c) => c.label);

function syncCustom(selId, rowId, customId) {
  const sel = $(selId), row = $(rowId), custom = $(customId);
  const isCustom = sel.value === '__custom__';
  row.classList.toggle('show', isCustom);
  sel.classList.toggle('blank', sel.value === '');
  return isCustom ? custom.value : sel.value;
}
$('split').addEventListener('change', () => syncCustom('split','split-custom-row','split-custom'));
$('schedule').addEventListener('change', () => syncCustom('schedule','schedule-custom-row','schedule-custom'));
// Initialize blank/filled styling + custom-row visibility on load (server renders
// class="blank" unconditionally; without this an existing value still LOOKS blank).
syncCustom('split','split-custom-row','split-custom');
syncCustom('schedule','schedule-custom-row','schedule-custom');

function render() {
  const horse = HORSES.find(h => h.slug === $('horse').value);
  const owner = OWNERS.find(o => (o.id ?? o.slug) === $('owner').value);
  const trainer = TRAINERS.find(t => t.slug === $('trainer').value);
  const model = MODELS.find(m => m.id === $('model').value);
  const close = CLOSES.find(c => c.id === $('close').value);
  const stake = parseFloat($('stake').value);
  const wholesale = parseFloat($('wholesale').value);
  const startIso = $('termStart').value;
  const endIso = $('termEnd').value;

  // Header
  $('h-name').textContent = horse ? horse.legalName + ' Syndicate' : 'not filled in yet';
  setBlank($('h-name'), !!horse);
  $('h-date').textContent = startIso ? formatTermDate(startIso) : 'not filled in yet';
  setBlank($('h-date'), !!startIso);

  // §1
  setBlank($('horse'), !!horse);
  $('microchip').textContent = horse && horse.microchip ? horse.microchip : 'not filled in yet';
  setBlank($('microchip'), !!(horse && horse.microchip));
  setBlank($('owner'), !!owner);
  setBlank($('trainer'), !!trainer);

  // §2
  setBlank($('stake'), Number.isFinite(stake));
  setBlank($('min'), Number.isFinite(parseFloat($('min').value)));
  setBlank($('step'), Number.isFinite(parseFloat($('step').value)));
  setBlank($('wholesale'), Number.isFinite(wholesale));

  const retail = Number.isFinite(wholesale) ? retailFromWholesale(wholesale) : null;
  $('retail').textContent = retail != null ? money(retail) + ' / month per 1% stake' : 'not filled in yet';
  setBlank($('retail'), retail != null);

  const months = monthsBetween(startIso, endIso);
  const startLabel = formatTermDate(startIso);
  const endLabel = endIso ? formatTermDate(endIso.slice(0,7) + '-' + String(lastDayOfMonth(endIso)).padStart(2,'0')) : null;
  setBlank($('termStart'), !!startIso);
  setBlank($('termEnd'), !!endIso);
  $('termLine').textContent = (months && startLabel && endLabel) ? months + ' months (' + startLabel + ' → ' + endLabel + ')' : '';

  // §3
  setBlank($('model'), !!model);
  if (model) {
    if (model.id === 'upfront') {
      const upfrontTotal = (retail != null && months) ? money(retail * months) : 'not filled in yet';
      $('join').textContent = 'Upfront Payment: ' + upfrontTotal + ' per 1% stake (' + (months ?? '—') + ' months @ ' + (retail != null ? money(retail) : '—') + '/mo)';
      $('settlement').textContent = 'Pro-rata refund of unused preparation keep upon early termination.';
    } else {
      $('join').textContent = '3 mo reserve deposit + 2 mo advance keep';
      $('settlement').textContent = 'Deposit refunded in full; unused advance keep refunded pro-rata upon lease termination within 14 business days.';
    }
    setBlank($('join'), false);
    setBlank($('settlement'), false);
  } else {
    $('join').textContent = 'not filled in yet';
    $('settlement').textContent = 'not filled in yet';
    setBlank($('join'), true);
    setBlank($('settlement'), true);
  }

  // §4
  setBlank($('close'), !!close);
}

// Horse selection fills ONLY the locked microchip — everything else stays blank
// (owner/trainer/commercials are variable, set by the founder).
$('horse').addEventListener('change', () => {
  const horse = HORSES.find(h => h.slug === $('horse').value);
  if (horse) {
    $('microchip').textContent = horse.microchip || 'not filled in yet';
  }
  render();
});

$('owner').addEventListener('change', render);
$('trainer').addEventListener('change', render);
$('model').addEventListener('change', render);
$('close').addEventListener('change', render);
$('stake').addEventListener('input', render);
$('min').addEventListener('input', render);
$('step').addEventListener('input', render);
$('wholesale').addEventListener('input', render);
$('termStart').addEventListener('change', render);
$('termEnd').addEventListener('change', render);

function currentValues() {
  const owner = OWNERS.find(o => (o.id ?? o.slug) === $('owner').value);
  const trainer = TRAINERS.find(t => t.slug === $('trainer').value);
  // Wholesale field is "per 1% stake"; DB cost_monthly_nzd is the TOTAL monthly
  // cost (per-1% × 100). Convert on save.
  const wholesalePerPct = parseFloat($('wholesale').value);
  const costMonthlyNzd = Number.isFinite(wholesalePerPct) ? String(wholesalePerPct * 100) : '';
  return {
    horseSlug: $('horse').value,
    ownerId: owner ? owner.id : '',
    trainerName: trainer ? trainer.name : '',
    trainerLocation: trainer ? trainer.location : '',
    costMonthlyNzd,
    listedStakePct: $('stake').value,
    minStakePct: $('min').value,
    stakeStepPct: $('step').value,
    termStart: $('termStart').value ? $('termStart').value + '-01' : '',
    termEnd: $('termEnd').value ? $('termEnd').value + '-' + String(lastDayOfMonth($('termEnd').value)).padStart(2,'0') : '',
    closeStyle: $('close').value,
    paymentStyle: $('model').value,
    distributionSplit: syncCustom('split','split-custom-row','split-custom'),
    distributionSchedule: syncCustom('schedule','schedule-custom-row','schedule-custom'),
  };
}

async function post(action, body) {
  const res = await fetch('/' + action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
  const data = await res.json();
  if (!res.ok) { toast('Error: ' + (data.error || res.status)); return null; }
  return data;
}

$('save').addEventListener('click', async () => {
  const v = currentValues();
  if (!v.horseSlug) { toast('Pick a horse first'); return; }
  if (!v.distributionSplit || !v.distributionSchedule) { toast('Fill both owner-set fields first'); return; }
  const data = await post('save', v);
  if (data) { toast('Saved to prod ✓'); setTimeout(() => location.reload(), 600); }
});
$('pending').addEventListener('click', async () => {
  const data = await post('pending');
  if (data) { toast('Marked pending'); setTimeout(() => location.reload(), 600); }
});
$('approve').addEventListener('click', async () => {
  const v = currentValues();
  if (!v.horseSlug) { toast('Pick a horse first'); return; }
  if (!v.distributionSplit || !v.distributionSchedule) { toast('Fill both owner-set fields before approving'); return; }
  const data = await post('approve', v);
  if (data) { toast('Term sheet approved → Soft Content'); setTimeout(() => location.href = '/soft-content', 600); }
});
$('delete').addEventListener('click', async () => {
  if (!confirm('Reset this term sheet to draft and clear the owner-set values?')) return;
  const data = await post('delete');
  if (data) { toast('Reset to draft'); setTimeout(() => location.reload(), 600); }
});

render();
</script>
</body>
</html>`;
}

// ── Light markdown → HTML (for read-only PDS/SA views) ─────────────────────
function mdToHtml(md: string): string {
  const lines = md.split('\n');
  let html = '';
  let inTable = false;
  let inList = false;
  for (const raw of lines) {
    const line = raw;
    if (line.startsWith('|')) {
      if (!inTable) { html += '<table>'; inTable = true; }
      const cells = line.split('|').filter((_, i, a) => i > 0 && i < a.length - 1);
      const isHeader = /^:?-{3,}:?$/.test(cells[0]?.trim() ?? '');
      if (isHeader) continue;
      const tag = inTable && html.endsWith('</tr>') ? 'td' : 'th';
      html += '<tr>' + cells.map((c) => `<${tag}>${inline(c.trim())}</${tag}>`).join('') + '</tr>';
      continue;
    } else if (inTable) { html += '</table>'; inTable = false; }

    if (/^\s*[-*]\s+/.test(line)) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${inline(line.replace(/^\s*[-*]\s+/, ''))}</li>`;
      continue;
    } else if (inList) { html += '</ul>'; inList = false; }

    if (line.startsWith('### ')) html += `<h3>${inline(line.slice(4))}</h3>`;
    else if (line.startsWith('## ')) html += `<h2>${inline(line.slice(3))}</h2>`;
    else if (line.startsWith('# ')) html += `<h1>${inline(line.slice(2))}</h1>`;
    else if (line.startsWith('---')) html += '<hr>';
    else if (line.trim() === '') html += '';
    else html += `<p>${inline(line)}</p>`;
  }
  if (inTable) html += '</table>';
  if (inList) html += '</ul>';
  return html;
}

function inline(s: string): string {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[not filled in yet\]/g, '<span class="blank">not filled in yet</span>');
}

function renderDocHtml(title: string, doc: 'pds' | 'sa', markdown: string, status: string, nextLabel: string, nextHref: string): string {
  const ep = `/${doc}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>
  :root { --ink:#1a1a1a; --muted:#444; --line:#ccc; --blank-bg:#ececec; --blank-border:#bdbdbd; --blank-ink:#9a9a9a; --accent:#d4a964; }
  * { box-sizing:border-box; }
  body { font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; color:var(--ink); line-height:1.6; font-size:13px; background:#f4f4f2; margin:0; padding:24px 0 80px; }
  .sheet { max-width:170mm; margin:0 auto; background:#fff; padding:20mm; box-shadow:0 1px 6px rgba(0,0,0,.08); }
  h1 { font-size:22px; font-weight:600; margin:0 0 2px; }
  h2 { font-size:16px; font-weight:600; margin:18px 0 6px; }
  h3 { font-size:13px; font-weight:600; margin:16px 0 6px; border-bottom:1px solid #ddd; padding-bottom:4px; }
  p { margin:6px 0; }
  ul { margin:4px 0 4px 18px; padding:0; }
  li { margin:3px 0; }
  hr { border:none; border-top:1px solid var(--line); margin:12px 0; }
  table { border-collapse:collapse; width:100%; margin:8px 0; }
  th,td { border:1px solid var(--line); padding:6px 8px; text-align:left; font-size:12px; }
  th { background:#f5f5f5; }
  .blank { display:inline-block; background:var(--blank-bg); border:1px dashed var(--blank-border); color:var(--blank-ink); border-radius:4px; padding:1px 8px; font-style:italic; font-size:11px; }
  .bar { position:fixed; bottom:0; left:0; right:0; background:#fff; border-top:1px solid var(--line); padding:12px 20px; display:flex; gap:10px; align-items:center; justify-content:center; box-shadow:0 -1px 6px rgba(0,0,0,.06); }
  .bar button { font-family:inherit; font-size:13px; padding:8px 18px; border-radius:6px; border:1px solid var(--line); cursor:pointer; background:#fff; color:var(--ink); }
  .bar button.primary { background:var(--ink); color:#fff; border-color:var(--ink); }
  .bar button.danger { color:#b00020; border-color:#b00020; }
  .status-pill { display:inline-block; font-size:11px; padding:2px 10px; border-radius:10px; margin-left:8px; vertical-align:middle; }
  .status-draft { background:#ececec; color:#666; }
  .status-pending { background:#fff3cd; color:#856404; }
  .status-approved { background:#d4edda; color:#155724; }
  .status-rejected { background:#f8d7da; color:#721c24; }
  .toast { position:fixed; top:16px; right:16px; background:var(--ink); color:#fff; padding:10px 16px; border-radius:6px; font-size:13px; opacity:0; transition:opacity .2s; }
  .toast.show { opacity:1; }
  .side { position:fixed; top:0; left:0; bottom:0; width:200px; background:#fff; border-right:1px solid var(--line); padding:16px 12px; display:flex; flex-direction:column; gap:6px; overflow-y:auto; z-index:10; }
  .side .brand { font-size:12px; font-weight:600; margin-bottom:8px; letter-spacing:.02em; }
  .side a { display:block; font-size:12px; color:var(--ink); text-decoration:none; padding:6px 10px; border-radius:6px; }
  .side a:hover { background:#f0f0f0; }
  .side a.active { background:var(--ink); color:#fff; }
  .side .sep { border-top:1px solid var(--line); margin:8px 0; }
  .side button { font-family:inherit; font-size:12px; padding:7px 10px; border-radius:6px; border:1px solid var(--line); cursor:pointer; background:#fff; color:var(--ink); text-align:left; }
  .side button.primary { background:var(--ink); color:#fff; border-color:var(--ink); }
  .side button.danger { color:#b00020; border-color:#b00020; }
  .sheet { margin-left:240px; }
</style>
</head>
<body>
<div class="side">
  <div class="brand">DSL Workflow</div>
  <a href="/">Term Sheet</a>
  <a href="/soft-content">Soft Content</a>
  <a href="/pds"${doc === 'pds' ? ' class="active"' : ''}>PDS</a>
  <a href="/sa"${doc === 'sa' ? ' class="active"' : ''}>SA</a>
  <a href="/flip">Flip to Listed</a>
  <div class="sep"></div>
  <button id="pending">Pending</button>
  <button id="approve" class="primary">Approve → ${esc(nextLabel)}</button>
  <button id="delete" class="danger">Delete</button>
</div>
<div class="sheet">
  <h1>${esc(title)} <span class="status-pill status-${esc(status)}">${esc(status)}</span></h1>
  ${mdToHtml(markdown)}
</div>
<div class="toast" id="toast"></div>
<script>
const $ = (id) => document.getElementById(id);
const toast = (msg) => { const t = $('toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2500); };
async function post(action) {
  const res = await fetch('${ep}/' + action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  const data = await res.json();
  if (!res.ok) { toast('Error: ' + (data.error || res.status)); return null; }
  return data;
}
$('pending').addEventListener('click', async () => { const d = await post('pending'); if (d) { toast('Marked pending'); setTimeout(() => location.reload(), 600); } });
$('approve').addEventListener('click', async () => { const d = await post('approve'); if (d) { toast('Approved → ${esc(nextLabel)}'); setTimeout(() => location.href = '${nextHref}', 600); } });
$('delete').addEventListener('click', async () => { if (!confirm('Reset this document to draft?')) return; const d = await post('delete'); if (d) { toast('Reset to draft'); setTimeout(() => location.reload(), 600); } });
</script>
</body>
</html>`;
}

function renderSoftContentHtml(
  context: SyndicateLegalContext,
  inv: Record<string, unknown>,
  trainers: { slug: string; name: string; stableName: string }[]
): string {
  const status = (inv.soft_content_status as string) ?? 'draft';
  const h = context.horse;
  const ep = '/soft-content';
  const slug = context.campaignSlug;
  const { texts, prefilled, approved, rejected } = mergedSoft(slug, inv, trainers);
  const approvedCount = SECTION_DEFS.filter((d) => approved[d.field]).length;
  const firstOpen =
    SECTION_DEFS.find((d) => !approved[d.field])?.field ??
    SECTION_DEFS.find((d) => rejected[d.field])?.field ??
    SECTION_DEFS[0].field;

  const sectionsHtml = SECTION_DEFS.map((d, i) => {
    const state = approved[d.field] ? 'approved' : rejected[d.field] ? 'rejected' : 'draft';
    const text = texts[d.field] ?? '';
    const open = !approved[d.field] && d.field === firstOpen ? ' open' : '';
    const preTag = prefilled.includes(d.field) ? ' <span class="pre-tag">pre-filled — verify</span>' : '';
    const actionBar = approved[d.field]
      ? '<div class="sec-locked">✓ Approved — locked. Content confirmed for the PDS.</div>'
      : `<div class="sec-actions">
      <button onclick="actSec('${d.field}','reject')">Reject</button>
      <button onclick="toggleEdit('${d.field}')">Edit</button>
      <button class="primary" onclick="actSec('${d.field}','approve')">Approve</button>
    </div>`;
    const editPane = approved[d.field] ? '' : `<div class="sec-edit" style="display:none">
      <textarea id="edit-${d.field}" rows="6">${esc(text)}</textarea>
      <button onclick="saveSec('${d.field}')">Save</button>
    </div>`;
    return `<div class="acc${open}" id="sec-${d.field}">
  <button class="acc-head" onclick="toggleSec('${d.field}')">
    <span class="n">${i + 1}</span>
    <span class="t">${esc(d.title)}</span>
    <span class="status-pill status-${state}">${state}</span>
    <span class="chev">▾</span>
  </button>
  <div class="acc-body">
    <p class="hint">${esc(d.hint)}${preTag}</p>
    <div class="sec-text">${text ? esc(text) : '<span class="blank">not filled in yet</span>'}</div>
    ${editPane}
    <details class="exemplar"><summary>Hotta example (reference only)</summary><p>${esc(HOTTA_EXEMPLARS[d.field])}</p></details>
    ${actionBar}
  </div>
</div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Soft Content — ${esc(context.syndicateName)}</title>
<style>
  :root { --ink:#1a1a1a; --muted:#444; --line:#ccc; --blank-bg:#ececec; --blank-border:#bdbdbd; --blank-ink:#9a9a9a; }
  * { box-sizing:border-box; }
  body { font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; color:var(--ink); line-height:1.6; font-size:13px; background:#f4f4f2; margin:0; padding:24px 0 80px; }
  .sheet { max-width:170mm; margin:0 auto; background:#fff; padding:20mm; box-shadow:0 1px 6px rgba(0,0,0,.08); }
  h1 { font-size:22px; font-weight:600; margin:0 0 2px; }
  h3 { font-size:13px; font-weight:600; margin:16px 0 6px; border-bottom:1px solid #ddd; padding-bottom:4px; }
  p { margin:6px 0; }
  hr { border:none; border-top:1px solid var(--line); margin:12px 0; }
  table { border-collapse:collapse; width:100%; margin:8px 0; }
  th,td { border:1px solid var(--line); padding:6px 8px; text-align:left; font-size:12px; }
  th { background:#f5f5f5; }
  .blank { display:inline-block; background:var(--blank-bg); border:1px dashed var(--blank-border); color:var(--blank-ink); border-radius:4px; padding:1px 8px; font-style:italic; font-size:11px; }
  .hint { font-size:11px; color:var(--muted); font-style:italic; }
  .pre-tag { background:#e8f0fe; color:#1a56db; border-radius:4px; padding:1px 8px; font-style:normal; }
  .acc { border:1px solid var(--line); border-radius:8px; margin:10px 0; overflow:hidden; }
  .acc-head { width:100%; display:flex; gap:10px; align-items:center; background:#fafafa; border:none; padding:10px 14px; cursor:pointer; font:inherit; text-align:left; }
  .acc-head .n { background:var(--ink); color:#fff; border-radius:50%; width:22px; height:22px; display:inline-flex; align-items:center; justify-content:center; font-size:11px; flex:none; }
  .acc-head .t { font-weight:600; flex:1; }
  .acc-head .chev { color:var(--muted); }
  .acc .acc-body { display:none; padding:12px 14px; border-top:1px solid var(--line); }
  .acc.open .acc-body { display:block; }
  .acc.open .acc-head .chev { transform:rotate(180deg); }
  .sec-text { white-space:pre-wrap; margin:8px 0; }
  .sec-edit textarea { width:100%; font:inherit; padding:8px; border:1px solid var(--line); border-radius:6px; }
  .exemplar { margin:8px 0; font-size:12px; color:var(--muted); }
  .exemplar summary { cursor:pointer; font-style:italic; }
  .sec-locked { margin-top:8px; font-size:12px; color:#155724; background:#d4edda; border:1px solid #b7dfb9; border-radius:6px; padding:6px 12px; }
  .sec-actions { display:flex; gap:8px; margin-top:8px; }
  .sec-actions button, .sec-edit button { font:inherit; font-size:12px; padding:6px 14px; border-radius:6px; border:1px solid var(--line); cursor:pointer; background:#fff; }
  .sec-actions button.primary { background:var(--ink); color:#fff; border-color:var(--ink); }
  .bar { position:fixed; bottom:0; left:0; right:0; background:#fff; border-top:1px solid var(--line); padding:12px 20px; display:flex; gap:10px; align-items:center; justify-content:center; box-shadow:0 -1px 6px rgba(0,0,0,.06); }
  .bar button { font-family:inherit; font-size:13px; padding:8px 18px; border-radius:6px; border:1px solid var(--line); cursor:pointer; background:#fff; color:var(--ink); }
  .bar button.primary { background:var(--ink); color:#fff; border-color:var(--ink); }
  .bar button.danger { color:#b00020; border-color:#b00020; }
  .status-pill { display:inline-block; font-size:11px; padding:2px 10px; border-radius:10px; margin-left:8px; vertical-align:middle; }
  .status-draft { background:#ececec; color:#666; }
  .status-pending { background:#fff3cd; color:#856404; }
  .status-approved { background:#d4edda; color:#155724; }
  .status-rejected { background:#f8d7da; color:#721c24; }
  .toast { position:fixed; top:16px; right:16px; background:var(--ink); color:#fff; padding:10px 16px; border-radius:6px; font-size:13px; opacity:0; transition:opacity .2s; }
  .toast.show { opacity:1; }
  .side { position:fixed; top:0; left:0; bottom:0; width:200px; background:#fff; border-right:1px solid var(--line); padding:16px 12px; display:flex; flex-direction:column; gap:6px; overflow-y:auto; z-index:10; }
  .side .brand { font-size:12px; font-weight:600; margin-bottom:8px; letter-spacing:.02em; }
  .side a { display:block; font-size:12px; color:var(--ink); text-decoration:none; padding:6px 10px; border-radius:6px; }
  .side a:hover { background:#f0f0f0; }
  .side a.active { background:var(--ink); color:#fff; }
  .side .sep { border-top:1px solid var(--line); margin:8px 0; }
  .side button { font-family:inherit; font-size:12px; padding:7px 10px; border-radius:6px; border:1px solid var(--line); cursor:pointer; background:#fff; color:var(--ink); text-align:left; }
  .side button.primary { background:var(--ink); color:#fff; border-color:var(--ink); }
  .side button.danger { color:#b00020; border-color:#b00020; }
  .sheet { margin-left:240px; }
</style>
</head>
<body>
<div class="side">
  <div class="brand">DSL Workflow</div>
  <a href="/">Term Sheet</a>
  <a href="/soft-content" class="active">Soft Content</a>
  <a href="/pds">PDS</a>
  <a href="/sa">SA</a>
  <a href="/flip">Flip to Listed</a>
  <div class="sep"></div>
  <button id="pending">Pending</button>
  <button id="approve" class="primary">Approve → PDS (${approvedCount}/4)</button>
  <button id="delete" class="danger">Delete</button>
</div>
<div class="sheet">
  <h1>Soft Content <span class="status-pill status-${esc(status)}">${esc(status)}</span></h1>
  <p class="hint">One section open at a time. Each section: Reject (collapses) · Edit (master overwrite) · Approve (closes, opens next). ${approvedCount}/4 approved. Hotta excerpts are reference only — never rendered into output.</p>
  <hr>
${sectionsHtml}
  <hr>
  <h3>Hard facts to verify against <span class="hint">(LOCKED — from loveracing.nz)</span></h3>
  <table>
    <tr><th>Field</th><th>Value</th></tr>
    <tr><td>Horse</td><td>${esc(h.legalName)}</td></tr>
    <tr><td>Microchip</td><td>${esc(h.microchip ?? '—')}</td></tr>
    <tr><td>Sire</td><td>${esc(h.sire)}</td></tr>
    <tr><td>Dam</td><td>${esc(h.dam)}</td></tr>
    <tr><td>Gender</td><td>${esc(h.gender)}</td></tr>
    <tr><td>Foaling date</td><td>${esc(foalingLabel(h.foalingDate) || String(h.foalingYear))}</td></tr>
    <tr><td>Breeder</td><td>${esc(h.breeder)}</td></tr>
    <tr><td>Trainer</td><td>${esc(context.trainer.name)} (${esc(context.trainer.location)})</td></tr>
  </table>
</div>

<div class="toast" id="toast"></div>
<script>
const $ = (id) => document.getElementById(id);
const toast = (msg) => { const t = $('toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2500); };
const ORDER = ${JSON.stringify(SECTION_DEFS.map((d) => d.field))};
function toggleSec(field) {
  for (const f of ORDER) {
    const el = $('sec-' + f);
    if (f === field) el.classList.toggle('open');
    else el.classList.remove('open');
  }
}
function toggleEdit(field) {
  const el = document.querySelector('#sec-' + field + ' .sec-edit');
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
}
async function post2(action, body) {
  const res = await fetch('${ep}/' + action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) { toast('Error: ' + (data.error || res.status)); return null; }
  return data;
}
async function actSec(field, action) {
  const d = await post2(action + '-section', { field });
  if (!d) return;
  toast(action === 'approve' ? 'Section approved' : 'Section rejected');
  setTimeout(() => location.reload(), 600);
}
async function saveSec(field) {
  const text = $('edit-' + field).value;
  const d = await post2('save-section', { field, text });
  if (!d) return;
  toast('Saved');
  setTimeout(() => location.reload(), 600);
}
async function post(action) {
  const res = await fetch('${ep}/' + action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  const data = await res.json();
  if (!res.ok) { toast('Error: ' + (data.error || res.status)); return null; }
  return data;
}
$('pending').addEventListener('click', async () => { const d = await post('pending'); if (d) { toast('Marked pending'); setTimeout(() => location.reload(), 600); } });
$('approve').addEventListener('click', async () => { const d = await post('approve'); if (d) { toast('Soft content approved → PDS'); setTimeout(() => location.href = '/pds', 600); } });
$('delete').addEventListener('click', async () => { if (!confirm('Reset soft content status to draft? (The text is NOT deleted — only the lock.)')) return; const d = await post('delete'); if (d) { toast('Reset to draft'); setTimeout(() => location.reload(), 600); } });
</script>
</body>
</html>`;
}


function renderFlipHtml(context: SyndicateLegalContext, inv: Record<string, unknown>): string {
  const allApproved =
    inv.term_sheet_status === 'approved' && inv.pds_status === 'approved' && inv.sa_status === 'approved';
  const listed = inv.status === 'listed';
  const statusLabel = (s: unknown) => (s === 'draft' ? 'saved' : String(s ?? 'draft'));
  const statusClass = (s: unknown) => (s === 'approved' ? 'ok' : s === 'rejected' ? 'no' : 'saved');
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Flip to Listed — ${esc(context.syndicateName)}</title>
<style>
  body { font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; color:#1a1a1a; background:#f4f4f2; margin:0; padding:40px; line-height:1.6; }
  .card { max-width:600px; margin:0 auto; background:#fff; padding:32px; box-shadow:0 1px 6px rgba(0,0,0,.08); border-radius:8px; }
  h1 { font-size:20px; margin:0 0 16px; }
  .row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #eee; }
  .ok { color:#155724; font-weight:600; }
  .no { color:#b00020; font-weight:600; }
  .saved { color:#856404; font-weight:600; }
  .view { font-size:12px; color:#1a1a1a; text-decoration:none; border:1px solid #ccc; border-radius:4px; padding:2px 10px; margin-left:8px; }
  .view:hover { background:#f0f0f0; }
  button { font-family:inherit; font-size:14px; padding:10px 20px; border-radius:6px; border:1px solid #ccc; cursor:pointer; background:#1a1a1a; color:#fff; margin-top:16px; }
  button:disabled { opacity:.4; cursor:not-allowed; }
  .toast { position:fixed; top:16px; right:16px; background:#1a1a1a; color:#fff; padding:10px 16px; border-radius:6px; opacity:0; transition:opacity .2s; }
  .toast.show { opacity:1; }
</style>
</head>
<body>
<div class="card">
  <h1>Flip to Listed — ${esc(context.syndicateName)}</h1>
  <div class="row"><span>Term Sheet</span><span><span class="${statusClass(inv.term_sheet_status)}">${esc(statusLabel(inv.term_sheet_status))}</span><a class="view" href="/term-sheet">VIEW</a></span></div>
  <div class="row"><span>PDS</span><span><span class="${statusClass(inv.pds_status)}">${esc(statusLabel(inv.pds_status))}</span><a class="view" href="/pds">VIEW</a></span></div>
  <div class="row"><span>SA</span><span><span class="${statusClass(inv.sa_status)}">${esc(statusLabel(inv.sa_status))}</span><a class="view" href="/sa">VIEW</a></span></div>
  <div class="row"><span>Current status</span><span>${esc(String(inv.status))}</span></div>
  <p style="margin-top:16px;font-size:13px;color:#666;">
    ${listed ? '✅ Already listed.' : allApproved ? 'All three docs approved — ready to flip.' : '⚠️ Not all docs approved. The legal-lock gate will block the flip.'}
  </p>
  <button id="flip" ${listed || !allApproved ? 'disabled' : ''}>Flip to Listed</button>
</div>
<div class="toast" id="toast"></div>
<script>
const $ = (id) => document.getElementById(id);
const toast = (msg) => { const t = $('toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2500); };
$('flip').addEventListener('click', async () => {
  const res = await fetch('/flip', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  const data = await res.json();
  if (!res.ok) { toast('Error: ' + (data.error || res.status)); return; }
  toast('✅ Listed!'); setTimeout(() => location.reload(), 800);
});
</script>
</body>
</html>`;
}

// ── Server ──────────────────────────────────────────────────────────────────
async function serve(slug: string, port: number) {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://localhost:${port}`);
    const send = (body: string, status = 200, type = 'text/html') => {
      res.writeHead(status, { 'Content-Type': `${type}; charset=utf-8` });
      res.end(body);
    };
    const sendJson = (obj: Record<string, unknown>, status = 200) => {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(obj));
    };

    try {
      const registry = await loadRegistry();
      const { context, inv } = await loadCampaign(slug);
      const { pack } = compileLegalPack(context, { skipValidation: true });

      if (req.method === 'GET') {
        if (url.pathname === '/' || url.pathname === '/term-sheet') {
          send(renderTermSheetHtml(registry, inv));
        } else if (url.pathname === '/soft-content') {
          send(renderSoftContentHtml(context, inv, registry.trainers));
        } else if (url.pathname === '/pds') {
          send(renderDocHtml('Product Disclosure Statement', 'pds', pack.pdsMarkdown, inv.pds_status as string, 'SA', '/sa'));
        } else if (url.pathname === '/sa') {
          send(renderDocHtml('Syndicate Agreement', 'sa', pack.saMarkdown, inv.sa_status as string, 'Flip to Listed', '/flip'));
        } else if (url.pathname === '/flip') {
          send(renderFlipHtml(context, inv));
        } else {
          send('Not found', 404);
        }
        return;
      }

      if (req.method === 'POST') {
        const body = await readBody(req);
        // Path shape: /<action> (term sheet) or /<doc>/<action> (pds|sa|soft-content).
        const parts = url.pathname.split('/').filter(Boolean);
        let doc: 'term_sheet' | 'pds' | 'sa' | 'soft_content' = 'term_sheet';
        let action: string;
        if (parts.length === 2 && (parts[0] === 'pds' || parts[0] === 'sa' || parts[0] === 'soft-content')) {
          doc = parts[0] === 'soft-content' ? 'soft_content' : (parts[0] as 'pds' | 'sa');
          action = parts[1];
        } else {
          action = parts[0] ?? '';
        }

        if (action === 'save-section' || action === 'approve-section' || action === 'reject-section') {
          if (doc !== 'soft_content') {
            sendJson({ error: 'Section actions live under /soft-content/' }, 400);
            return;
          }
          const field = body.field as string;
          if (!SECTION_DEFS.some((d) => d.field === field)) {
            sendJson({ error: `Unknown section: ${field}` }, 400);
            return;
          }
          const rows = await query(`select soft_legal from public.inventory where slug = '${slug}'`);
          const current = ((rows[0]?.soft_legal ?? {}) as Record<string, unknown>);
          const sectionState = ({ ...((current._sectionState ?? {}) as Record<string, string>) });
          if (action === 'save-section') {
            const text = (body.text as string) ?? '';
            await saveSoftLegalFields(slug, { [field]: text, _sectionState: { ...sectionState, [field]: 'draft' } });
          } else if (action === 'approve-section') {
            const val = (current[field] as string) ?? '';
            if (!val) {
              // Pre-filled registry text counts as content — persist it on approve.
              const { texts } = mergedSoft(slug, inv, registry.trainers);
              const pre = (texts as Record<string, string>)[field] ?? '';
              if (!pre) {
                sendJson({ error: 'Cannot approve an empty section — edit first' }, 400);
                return;
              }
              await saveSoftLegalFields(slug, { [field]: pre, _sectionState: { ...sectionState, [field]: 'approved' } });
            } else {
              await saveSoftLegalFields(slug, { _sectionState: { ...sectionState, [field]: 'approved' } });
            }
          } else {
            await saveSoftLegalFields(slug, { _sectionState: { ...sectionState, [field]: 'rejected' } });
          }
          writeState({ action, slug, field, at: new Date().toISOString() });
          sendJson({ ok: true });
          return;
        }

        if (action === 'save') {
          const { distributionSplit, distributionSchedule } = body;
          if (!distributionSplit || !distributionSchedule) {
            sendJson({ error: 'Both owner-set fields required' }, 400);
            return;
          }
          await applyFullContext(slug, body);
          writeState({ action: 'save', slug, body, at: new Date().toISOString() });
          sendJson({ ok: true });
          return;
        }

        if (action === 'pending') {
          await setDocStatus(slug, doc, 'pending');
          writeState({ action: 'pending', slug, doc, at: new Date().toISOString() });
          sendJson({ ok: true });
          return;
        }

        if (action === 'approve') {
          if (doc === 'term_sheet') {
            const { distributionSplit, distributionSchedule } = body;
            if (!distributionSplit || !distributionSchedule) {
              sendJson({ error: 'Both owner-set fields required before approve' }, 400);
              return;
            }
            await applyFullContext(slug, body);
          }
          if (doc === 'soft_content') {
            const rows = await query(`select soft_legal from public.inventory where slug = '${slug}'`);
            const sectionState = ((((rows[0]?.soft_legal ?? {}) as Record<string, unknown>)._sectionState ?? {}) as Record<string, string>);
            const missing = SECTION_DEFS.filter((d) => sectionState[d.field] !== 'approved').map((d) => d.field);
            if (missing.length > 0) {
              sendJson({ error: `Sections pending: ${missing.join(', ')}` }, 400);
              return;
            }
          }
          await setDocStatus(slug, doc, 'approved');
          writeState({ action: 'approve', slug, doc, at: new Date().toISOString() });
          sendJson({ ok: true });
          return;
        }

        if (action === 'delete') {
          await setDocStatus(slug, doc, 'draft');
          if (doc === 'term_sheet') {
            await applyFullContext(slug, { distributionSplit: '', distributionSchedule: '' });
          }
          writeState({ action: 'delete', slug, doc, at: new Date().toISOString() });
          sendJson({ ok: true });
          return;
        }

        if (action === 'flip') {
          await flipListed(slug);
          writeState({ action: 'flip', slug, at: new Date().toISOString() });
          sendJson({ ok: true });
          return;
        }

        sendJson({ error: `Unknown action: ${action}` }, 404);
        return;
      }

      send('Method not allowed', 405);
    } catch (e) {
      sendJson({ error: e instanceof Error ? e.message : String(e) }, 500);
    }
  });

  server.listen(port, () => {
    console.log(`DSL workflow server → http://localhost:${port}/  (slug: ${slug})`);
    console.log(`  /term-sheet  CREATE-DSL capture form (all fields blank, horse cascades)`);
    console.log(`  /soft-content soft content review (verify against hard facts)`);
    console.log(`  /pds         PDS view`);
    console.log(`  /sa          SA view`);
    console.log(`  /flip        flip-to-listed view`);
  });
}

function readBody(req: http.IncomingMessage): Promise<Record<string, string>> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch { resolve({}); }
    });
    req.on('error', reject);
  });
}

// ── Headless mode ───────────────────────────────────────────────────────────
async function headless(args: { slug: string; apply?: { distributionSplit: string; distributionSchedule: string }; approve?: string; flip?: boolean; reset?: boolean; saveSoft?: Record<string, string>; approveSection?: string }) {
  const { slug } = args;
  const { context, inv } = await loadCampaign(slug);

  console.log('=== BEFORE ===');
  console.log(`status: ${inv.status} | term_sheet: ${inv.term_sheet_status} | pds: ${inv.pds_status} | sa: ${inv.sa_status}`);
  console.log(`distributionSplit: ${inv.distribution_split ?? '(unset)'}`);
  console.log(`distributionSchedule: ${inv.distribution_schedule ?? '(unset)'}`);
  console.log(`softSections: ${JSON.stringify((inv.soft_legal as Record<string, unknown>)?._sectionState ?? {})}`);

  if (args.reset) {
    await query(`update public.inventory set status = 'coming_soon', term_sheet_status = 'draft', term_sheet_locked_at = null, soft_content_status = 'draft', soft_content_locked_at = null, pds_status = 'draft', pds_locked_at = null, sa_status = 'draft', sa_locked_at = null, distribution_split = null, distribution_schedule = null, soft_legal = '{}' where slug = '${slug}'`);
    console.log('✓ Reset to clean draft (statuses draft, owner-set fields + soft text cleared)');
  }

  if (args.apply) {
    await applyFullContext(slug, {
      distributionSplit: args.apply.distributionSplit,
      distributionSchedule: args.apply.distributionSchedule,
    });
    console.log(`\n✓ Applied distribution: ${args.apply.distributionSplit} | ${args.apply.distributionSchedule}`);
  }

  if (args.saveSoft) {
    await saveSoftLegalFields(slug, args.saveSoft);
    console.log(`✓ Saved soft fields: ${Object.keys(args.saveSoft).join(', ')}`);
  }

  if (args.approveSection) {
    if (!SECTION_DEFS.some((d) => d.field === args.approveSection)) {
      console.log(`✗ Unknown section: ${args.approveSection}`);
    } else {
      const rows = await query(`select soft_legal from public.inventory where slug = '${slug}'`);
      const current = ((rows[0]?.soft_legal ?? {}) as Record<string, unknown>);
      const sectionState = ({ ...((current._sectionState ?? {}) as Record<string, string>) });
      sectionState[args.approveSection] = 'approved';
      await saveSoftLegalFields(slug, { _sectionState: sectionState });
      console.log(`✓ Approved section ${args.approveSection}`);
    }
  }

  if (args.approve) {
    // Order matters: PDS approval is trigger-gated on soft_content (00014).
    const docs = args.approve === 'all' ? ['term_sheet', 'soft_content', 'pds', 'sa'] : [args.approve];
    for (const doc of docs) {
      await setDocStatus(slug, doc as 'term_sheet' | 'pds' | 'sa' | 'soft_content', 'approved');
      console.log(`✓ Approved ${doc}`);
    }
  }

  if (args.flip) {
    try {
      await flipListed(slug);
      console.log('✓ Flipped to listed');
    } catch (e) {
      console.log(`✗ Flip FAILED (legal-lock): ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const after = (await query(`select * from public.inventory where slug = '${slug}'`))[0];
  console.log('\n=== AFTER ===');
  console.log(`status: ${after.status} | term_sheet: ${after.term_sheet_status} | pds: ${after.pds_status} | sa: ${after.sa_status}`);
  console.log(`distributionSplit: ${after.distribution_split ?? '(unset)'}`);
  console.log(`distributionSchedule: ${after.distribution_schedule ?? '(unset)'}`);

  // Regenerate + write docs to _today for eyeball
  const { pack } = compileLegalPack(context, { skipValidation: true });
  const files: Record<string, string> = {
    'manolo-term-sheet.md': pack.termSheetMarkdown,
    'manolo-pds.md': pack.pdsMarkdown,
    'manolo-sa.md': pack.saMarkdown,
  };
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(OUT_DIR, name), content);
  }
  console.log('\n✓ Wrote term-sheet/pds/sa .md to _today/');
}

// ── CLI ─────────────────────────────────────────────────────────────────────
function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) { out[key] = next; i++; }
      else out[key] = 'true';
    }
  }
  return out;
}

async function main() {
  const [mode, ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);
  const slug = args.slug ?? 'i-stole-a-manolo';

  if (mode === 'serve') {
    const port = Number(args.port ?? 4173);
    await serve(slug, port);
    return;
  }

  if (mode === 'headless') {
    await headless({
      slug,
      apply: args.apply ? JSON.parse(args.apply) : undefined,
      approve: args.approve,
      flip: args.flip === 'true',
      reset: args.reset === 'true',
      saveSoft: args['save-soft'] ? JSON.parse(args['save-soft']) : undefined,
      approveSection: args['approve-section'],
    });
    return;
  }

  console.log('Usage:');
  console.log('  tsx dsl-workflow.ts serve --slug i-stole-a-manolo [--port 4173]');
  console.log('  tsx dsl-workflow.ts headless --slug i-stole-a-manolo [--apply JSON] [--approve term_sheet|pds|sa|all] [--flip]');
  console.log("  tsx dsl-workflow.ts headless --slug X --save-soft '{\"aboutHorse\":\"...\"}' --approve-section aboutHorse");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
