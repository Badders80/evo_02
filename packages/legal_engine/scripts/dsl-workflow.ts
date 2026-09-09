/**
 * DSL Workflow — live capture + approval + flip orchestrator (007 T5a).
 *
 * Walks a horse from clean draft → listed through three doc gates:
 *   term sheet (owner-set fields captured live) → PDS → SA → flip to listed.
 *
 * Two modes:
 *   serve    — HTTP server: serves the term-sheet capture form + PDS/SA views,
 *              catches save/approve/pending/delete, writes prod, advances state.
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
import { compileLegalPack, computeDslPricing } from '../src';
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

// ── Campaign load (prod → SyndicateLegalContext) ────────────────────────────
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

  return { context, inv };
}

// ── Prod writes ─────────────────────────────────────────────────────────────
async function applyDistribution(slug: string, split: string, schedule: string) {
  const esc = (s: string) => s.replace(/'/g, "''");
  await query(
    `update public.inventory set distribution_split = '${esc(split)}', distribution_schedule = '${esc(schedule)}' where slug = '${slug}'`
  );
}

async function setDocStatus(slug: string, doc: 'term_sheet' | 'pds' | 'sa', status: 'draft' | 'pending' | 'approved' | 'rejected') {
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

// ── State file (so the agent can read progress) ────────────────────────────
function writeState(state: Record<string, unknown>) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ── HTML rendering ──────────────────────────────────────────────────────────
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function blankSpan(text: string) {
  return `<span class="blank">${esc(text)}</span>`;
}

function valOrBlank(x: string | number | null | undefined): string {
  if (x === null || x === undefined || x === '') return blankSpan('not filled in yet');
  return esc(String(x));
}

function formatTermDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function monthsBetween(startIso?: string, endIso?: string): number | null {
  if (!startIso || !endIso) return null;
  const s = new Date(`${startIso}T00:00:00Z`);
  const e = new Date(`${endIso}T00:00:00Z`);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null;
  return (e.getUTCFullYear() - s.getUTCFullYear()) * 12 + (e.getUTCMonth() - s.getUTCMonth()) + 1;
}

function selectOptions(options: string[], current?: string): string {
  const opts = options.map((o) => `<option value="${esc(o)}"${o === current ? ' selected' : ''}>${esc(o)}</option>`).join('');
  const customSelected = current && !options.includes(current) ? ' selected' : '';
  return opts + `<option value="__custom__"${customSelected}>Other (type below)…</option>`;
}

function renderTermSheetHtml(context: SyndicateLegalContext, inv: Record<string, unknown>): string {
  const p = context.pricing;
  const h = context.horse;
  const t = context.trainer;
  const wholesalePerPct = p.costMonthlyNzd * 0.01;
  const months = monthsBetween(context.termStartDate, context.termEndDate);
  const startLabel = formatTermDate(context.termStartDate);
  const endLabel = formatTermDate(context.termEndDate);
  const termLine = months && startLabel && endLabel
    ? `${months} months (${startLabel} → ${endLabel})`
    : (startLabel && endLabel ? `${startLabel} → ${endLabel}` : 'not filled in yet');

  const split = context.distributionSplit;
  const schedule = context.distributionSchedule;
  const status = inv.term_sheet_status as string;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>DSL Term Sheet — ${esc(context.syndicateName)}</title>
<style>
  :root { --ink:#1a1a1a; --muted:#444; --line:#ccc; --blank-bg:#ececec; --blank-border:#bdbdbd; --blank-ink:#9a9a9a; --accent:#d4a964; }
  * { box-sizing:border-box; }
  body { font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; color:var(--ink); line-height:1.55; font-size:13px; background:#f4f4f2; margin:0; padding:24px 0 80px; }
  .sheet { max-width:170mm; margin:0 auto; background:#fff; padding:20mm; box-shadow:0 1px 6px rgba(0,0,0,.08); }
  h1 { font-size:22px; font-weight:600; margin:0 0 2px; }
  .meta { color:var(--muted); font-size:12px; margin:2px 0; }
  h3 { font-size:13px; font-weight:600; margin:18px 0 6px; border-bottom:1px solid #ddd; padding-bottom:4px; }
  ul { margin:4px 0 4px 18px; padding:0; }
  li { margin:3px 0; }
  hr { border:none; border-top:1px solid var(--line); margin:12px 0; }
  table { border-collapse:collapse; width:100%; margin:8px 0; }
  th,td { border:1px solid var(--line); padding:6px 8px; text-align:left; font-size:12px; }
  th { background:#f5f5f5; }
  .fineprint { font-size:10px; color:#666; font-style:italic; }
  .blank { display:inline-block; background:var(--blank-bg); border:1px dashed var(--blank-border); color:var(--blank-ink); border-radius:4px; padding:1px 8px; font-style:italic; font-size:11px; letter-spacing:.02em; }
  select, input[type="text"] { font-family:inherit; font-size:12px; color:var(--ink); background:#fff; border:1px solid var(--line); border-radius:4px; padding:3px 6px; max-width:100%; }
  select { min-width:280px; }
  input[type="text"] { min-width:280px; }
  select.blank, input.blank { background:var(--blank-bg); border:1px dashed var(--blank-border); color:var(--blank-ink); font-style:italic; }
  select:focus, input:focus { outline:1px solid var(--accent); }
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
</style>
</head>
<body>
<div class="sheet">
  <h1>DSL Term Sheet - ${esc(context.syndicateName)} <span class="status-pill status-${esc(status)}">${esc(status)}</span></h1>
  <p class="meta"><strong>Version:</strong> ${valOrBlank(context.pdsVersion)} | <strong>Effective Date:</strong> ${valOrBlank(context.effectiveDate)}</p>
  <p class="meta"><strong>Manager:</strong> ${esc(t.managerEntity)} (NZTR Authorised Syndicator)</p>
  <hr>

  <h3>1. Thoroughbred &amp; Parties</h3>
  <ul>
    <li><strong>Horse:</strong> ${esc(h.legalName)}${h.barnName && h.barnName !== h.legalName ? ` <em>(${esc(h.barnName)})</em>` : ''}</li>
    <li><strong>Microchip / ID:</strong> ${valOrBlank(h.microchip)}</li>
    <li><strong>Owner:</strong> ${valOrBlank(context.ownerName)}</li>
    <li><strong>Trainer:</strong> ${esc(t.name)}${t.location ? ` (${esc(t.location)})` : ''}</li>
  </ul>

  <h3>2. Syndicate Stake &amp; Commercials</h3>
  <ul>
    <li><strong>Syndicated Stake in Horse:</strong> ${context.totalHorsePercentage != null ? `${context.totalHorsePercentage.toFixed(1)}%` : blankSpan('not filled in yet')} available (of the horse's total ownership)</li>
    <li><strong>Minimum Investment:</strong> ${context.minInvestmentPct != null ? `${context.minInvestmentPct.toFixed(1)}%` : blankSpan('not filled in yet')} — increments of ${context.stakeStepPct != null ? `${context.stakeStepPct.toFixed(1)}%` : blankSpan('not filled in yet')} thereafter</li>
    <li><strong>Wholesale Monthly Rate (M):</strong> $${wholesalePerPct.toFixed(2)} / month per 1% stake</li>
    <li><strong>Evolution Margin:</strong> ${p.evolutionMarginPercent.toFixed(1)}% | <strong>Platform Cost:</strong> ${p.processingBufferPercent.toFixed(1)}%</li>
    <li><strong>Retail Monthly Rate (M):</strong> $${p.monthlyKeepUnitNzd.toFixed(2)} / month per 1% stake</li>
    <li><strong>Lease Term:</strong> ${esc(termLine)}</li>
  </ul>

  <h3>3. Payment Structure &amp; Float</h3>
  <ul>
    <li><strong>Payment Model:</strong> ${context.paymentModel === 'subscription_float' ? 'Subscription Float ($5×M)' : context.paymentModel === 'upfront' ? 'Upfront' : blankSpan('not filled in yet')}</li>
    <li><strong>Initial Join Payment:</strong> ${context.paymentModel === 'subscription_float' ? '3 mo reserve deposit + 2 mo advance keep' : blankSpan('not filled in yet')}</li>
    <li><strong>Settlement:</strong> ${context.paymentModel === 'subscription_float' ? 'Deposit refunded in full; unused advance keep refunded pro-rata upon lease termination within 14 business days.' : blankSpan('not filled in yet')}</li>
  </ul>

  <h3>4. Prize Money &amp; Exit Terms <span style="color:var(--accent);font-size:11px;">(owner-set — complete below)</span></h3>
  <ul>
    <li>
      <strong>Gross Stakes Distribution:</strong>
      <select id="split" class="${split ? '' : 'blank'}">
        <option value=""${split ? '' : ' selected'}>not filled in yet</option>
        ${selectOptions(SPLIT_OPTIONS, split)}
      </select>
      <div class="custom-row" id="split-custom-row"><input type="text" id="split-custom" placeholder="Custom split (e.g. 75% Investor Pool / 25% Owner Retention)" value="${split && !SPLIT_OPTIONS.includes(split) ? esc(split) : ''}"></div>
    </li>
    <li>
      <strong>Distribution Schedule:</strong>
      <select id="schedule" class="${schedule ? '' : 'blank'}">
        <option value=""${schedule ? '' : ' selected'}>not filled in yet</option>
        ${selectOptions(SCHEDULE_OPTIONS, schedule)}
      </select>
      <div class="custom-row" id="schedule-custom-row"><input type="text" id="schedule-custom" placeholder="Custom schedule" value="${schedule && !SCHEDULE_OPTIONS.includes(schedule) ? esc(schedule) : ''}"></div>
    </li>
    <li><strong>Exit / Close Style:</strong> ${context.closeStyle === 'fourteen_day' ? 'Standard 14-Day Notice (Case B)' : context.closeStyle === 'three_x_remaining' ? '3× Buyout (Case B1)' : blankSpan('not filled in yet')}</li>
  </ul>

  <h3>5. Execution &amp; Approvals</h3>
  <table>
    <tr><th>Party</th><th>Signature</th><th>Date</th></tr>
    <tr><td><strong>${esc(t.managerEntity)}</strong> (Syndicate Manager)</td><td>_________________________</td><td>_____________</td></tr>
    <tr><td><strong>${esc(context.ownerName)}</strong> (Owner)</td><td>_________________________</td><td>_____________</td></tr>
  </table>

  <hr>
  <p class="fineprint">Summary of terms under the NZTR Code of Practice Rule 22.1. Subject to execution of formal PDS and Syndicate Agreement.</p>
</div>

<div class="bar">
  <button id="save" class="primary">Save</button>
  <button id="pending">Pending</button>
  <button id="approve">Approve → PDS</button>
  <button id="delete" class="danger">Delete</button>
</div>
<div class="toast" id="toast"></div>

<script>
const $ = (id) => document.getElementById(id);
const toast = (msg) => { const t = $('toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2500); };

function syncCustom(selId, rowId, customId) {
  const sel = $(selId), row = $(rowId), custom = $(customId);
  const isCustom = sel.value === '__custom__';
  row.classList.toggle('show', isCustom);
  sel.classList.toggle('blank', sel.value === '');
  return isCustom ? custom.value : sel.value;
}
$('split').addEventListener('change', () => syncCustom('split','split-custom-row','split-custom'));
$('schedule').addEventListener('change', () => syncCustom('schedule','schedule-custom-row','schedule-custom'));
syncCustom('split','split-custom-row','split-custom');
syncCustom('schedule','schedule-custom-row','schedule-custom');

function currentValues() {
  return {
    distributionSplit: syncCustom('split','split-custom-row','split-custom'),
    distributionSchedule: syncCustom('schedule','schedule-custom-row','schedule-custom'),
  };
}

async function post(action, body) {
  const res = await fetch('/' + action, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json();
  if (!res.ok) { toast('Error: ' + (data.error || res.status)); return null; }
  return data;
}

$('save').addEventListener('click', async () => {
  const v = currentValues();
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
  if (!v.distributionSplit || !v.distributionSchedule) { toast('Fill both owner-set fields before approving'); return; }
  const data = await post('approve', v);
  if (data) { toast('Term sheet approved → PDS'); setTimeout(() => location.href = '/pds', 600); }
});
$('delete').addEventListener('click', async () => {
  if (!confirm('Reset this term sheet to draft and clear the owner-set values?')) return;
  const data = await post('delete');
  if (data) { toast('Reset to draft'); setTimeout(() => location.reload(), 600); }
});
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
</style>
</head>
<body>
<div class="sheet">
  <h1>${esc(title)} <span class="status-pill status-${esc(status)}">${esc(status)}</span></h1>
  ${mdToHtml(markdown)}
</div>
<div class="bar">
  <button id="pending">Pending</button>
  <button id="approve" class="primary">Approve → ${esc(nextLabel)}</button>
  <button id="delete" class="danger">Delete</button>
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
      const { context, inv } = await loadCampaign(slug);
      const { pack } = compileLegalPack(context, { skipValidation: true });

      if (req.method === 'GET') {
        if (url.pathname === '/' || url.pathname === '/term-sheet') {
          send(renderTermSheetHtml(context, inv));
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
        // Path shape: /<action> (term sheet) or /<doc>/<action> (pds|sa).
        const parts = url.pathname.split('/').filter(Boolean);
        let doc: 'term_sheet' | 'pds' | 'sa' = 'term_sheet';
        let action: string;
        if (parts.length === 2 && (parts[0] === 'pds' || parts[0] === 'sa')) {
          doc = parts[0] as 'pds' | 'sa';
          action = parts[1];
        } else {
          action = parts[0] ?? '';
        }

        if (action === 'save') {
          const { distributionSplit, distributionSchedule } = body;
          if (!distributionSplit || !distributionSchedule) {
            sendJson({ error: 'Both owner-set fields required' }, 400);
            return;
          }
          await applyDistribution(slug, distributionSplit, distributionSchedule);
          writeState({ action: 'save', slug, distributionSplit, distributionSchedule, at: new Date().toISOString() });
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
            await applyDistribution(slug, distributionSplit, distributionSchedule);
          }
          await setDocStatus(slug, doc, 'approved');
          writeState({ action: 'approve', slug, doc, at: new Date().toISOString() });
          sendJson({ ok: true });
          return;
        }

        if (action === 'delete') {
          await setDocStatus(slug, doc, 'draft');
          if (doc === 'term_sheet') {
            await applyDistribution(slug, '', '');
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
    console.log(`  /term-sheet  capture form (owner-set fields)`);
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

function renderFlipHtml(context: SyndicateLegalContext, inv: Record<string, unknown>): string {
  const allApproved =
    inv.term_sheet_status === 'approved' && inv.pds_status === 'approved' && inv.sa_status === 'approved';
  const listed = inv.status === 'listed';
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Flip to Listed — ${esc(context.syndicateName)}</title>
<style>
  body { font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; color:#1a1a1a; background:#f4f4f2; margin:0; padding:40px; line-height:1.6; }
  .card { max-width:600px; margin:0 auto; background:#fff; padding:32px; box-shadow:0 1px 6px rgba(0,0,0,.08); border-radius:8px; }
  h1 { font-size:20px; margin:0 0 16px; }
  .row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #eee; }
  .ok { color:#155724; font-weight:600; }
  .no { color:#b00020; font-weight:600; }
  button { font-family:inherit; font-size:14px; padding:10px 20px; border-radius:6px; border:1px solid #ccc; cursor:pointer; background:#1a1a1a; color:#fff; margin-top:16px; }
  button:disabled { opacity:.4; cursor:not-allowed; }
  .toast { position:fixed; top:16px; right:16px; background:#1a1a1a; color:#fff; padding:10px 16px; border-radius:6px; opacity:0; transition:opacity .2s; }
  .toast.show { opacity:1; }
</style>
</head>
<body>
<div class="card">
  <h1>Flip to Listed — ${esc(context.syndicateName)}</h1>
  <div class="row"><span>Term Sheet</span><span class="${inv.term_sheet_status === 'approved' ? 'ok' : 'no'}">${esc(String(inv.term_sheet_status))}</span></div>
  <div class="row"><span>PDS</span><span class="${inv.pds_status === 'approved' ? 'ok' : 'no'}">${esc(String(inv.pds_status))}</span></div>
  <div class="row"><span>SA</span><span class="${inv.sa_status === 'approved' ? 'ok' : 'no'}">${esc(String(inv.sa_status))}</span></div>
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

// ── Headless mode ───────────────────────────────────────────────────────────
async function headless(args: { slug: string; apply?: { distributionSplit: string; distributionSchedule: string }; approve?: string; flip?: boolean }) {
  const { slug } = args;
  const { context, inv } = await loadCampaign(slug);

  console.log('=== BEFORE ===');
  console.log(`status: ${inv.status} | term_sheet: ${inv.term_sheet_status} | pds: ${inv.pds_status} | sa: ${inv.sa_status}`);
  console.log(`distributionSplit: ${inv.distribution_split ?? '(unset)'}`);
  console.log(`distributionSchedule: ${inv.distribution_schedule ?? '(unset)'}`);

  if (args.apply) {
    await applyDistribution(slug, args.apply.distributionSplit, args.apply.distributionSchedule);
    console.log(`\n✓ Applied distribution: ${args.apply.distributionSplit} | ${args.apply.distributionSchedule}`);
  }

  if (args.approve) {
    const docs = args.approve === 'all' ? ['term_sheet', 'pds', 'sa'] : [args.approve];
    for (const doc of docs) {
      await setDocStatus(slug, doc as 'term_sheet' | 'pds' | 'sa', 'approved');
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
    });
    return;
  }

  console.log('Usage:');
  console.log('  tsx dsl-workflow.ts serve --slug i-stole-a-manolo [--port 4173]');
  console.log('  tsx dsl-workflow.ts headless --slug i-stole-a-manolo [--apply JSON] [--approve term_sheet|pds|sa|all] [--flip]');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
