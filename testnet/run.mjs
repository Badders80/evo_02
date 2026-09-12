#!/usr/bin/env node
// testnet/run.mjs — the local testnet: one command, real money rail, machine-judged.
//
//   node testnet/run.mjs                 # run every check (M1..M8)
//   node testnet/run.mjs M4 M5           # run a subset (earlier checks' state must already exist)
//
// What it is NOT: a unit-test replacement. It exercises the running app end to end
// (login -> checkout -> real Stripe test card -> webhook -> holding -> MyStable) against
// the local Supabase and localhost:3000, and writes PASS/FAIL evidence per check.
//
// Hard guard: refuses to run when the preview bypass is on, because that flag disables
// every checkout/eligibility gate and would silently green-light a bypassed path.
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checks } from './checks.mjs';
import { ensureChromium } from './lib/browser.mjs';
import { inventory, setStatus, releaseExpiredReservations, rearmFixtures, clearInvestorHorse, profileByEmail, sql } from './lib/db.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..');

const cfg = {
  slug: process.env.TESTNET_SLUG || 'nellie',
  inventoryId: process.env.TESTNET_INVENTORY_ID || '11111111-0000-0000-0000-000000000001',
  email: process.env.TESTNET_EMAIL || 'test.investor@evolutionstables.nz',
  password: process.env.TESTNET_PASSWORD || 'TestPass123!',
  stepPct: Number(process.env.TESTNET_STEP_PCT || 0.5),
  rearmShares: Number(process.env.TESTNET_REARM_SHARES || 8),
  rearmReserved: Number(process.env.TESTNET_REARM_RESERVED || 2),
  stripeKey: '',
};

function loadEnvLocal() {
  const p = join(REPO, 'apps/web/.env.local');
  if (!existsSync(p)) return {};
  const out = {};
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

function banner(s) {
  console.log(`\n${s}`);
}

async function main() {
  const env = loadEnvLocal();
  cfg.stripeKey = process.env.STRIPE_SECRET_KEY || env.STRIPE_SECRET_KEY || '';

  // ---- guard: never run against a bypassed path ----
  const previewOn =
    ['WORKFLOW_PREVIEW', 'NEXT_PUBLIC_WORKFLOW_PREVIEW'].some((k) => (process.env[k] ?? env[k]) === 'true') ||
    ['WORKFLOW_PREVIEW', 'NEXT_PUBLIC_WORKFLOW_PREVIEW'].some((k) => (env[k] ?? process.env[k]) === 'true');
  if (previewOn && process.env.TESTNET_ALLOW_PREVIEW !== '1') {
    console.error(
      'REFUSING TO RUN: WORKFLOW_PREVIEW is on (apps/web/.env.local or this shell). That flag disables every\n' +
        'checkout/eligibility gate, so a green run would prove nothing. Unset it, or set TESTNET_ALLOW_PREVIEW=1\n' +
        'if you are deliberately walking the preview path.'
    );
    process.exit(2);
  }
  if (!cfg.stripeKey.startsWith('sk_test')) {
    console.error('REFUSING TO RUN: STRIPE_SECRET_KEY must be a test key (sk_test…). No live mode, ever.');
    process.exit(2);
  }

  const wanted = process.argv.slice(2).filter((a) => /^M\d+$/.test(a));
  const selected = wanted.length ? checks.filter((c) => wanted.includes(c.id)) : checks;

  const started = new Date();
  const stamp = started.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outDir = join(HERE, 'reports', stamp);
  mkdirSync(outDir, { recursive: true });

  const before = inventory(cfg.slug);
  const profile = profileByEmail(cfg.email);
  cfg.userId = profile?.id ?? null;
  if (!cfg.userId) {
    console.error(`REFUSING TO RUN: no profile row for ${cfg.email} in the local DB.`);
    process.exit(2);
  }
  banner(`testnet — ${cfg.slug} — ${started.toISOString()}`);
  console.log(`  inventory before : ${JSON.stringify(before)}`);
  console.log(`  investor         : ${profile?.email} kyc=${profile?.kycStatus}`);
  console.log(`  checks           : ${selected.map((c) => c.id).join(' ')}`);

  const chromium = await ensureChromium();
  console.log(`  chromium         : ${chromium.started ? `started pid ${chromium.pid}` : 'already live on :9222'}`);

  // ---- deterministic fixture state: the walk owns the listed flip ----
  // A full run re-arms availability first (the walk deliberately buys out the whole remainder,
  // so without this a second run would find nothing left to buy). TESTNET_REARM=0 disables.
  const fullRun = selected.length === checks.length;
  if (fullRun && process.env.TESTNET_REARM !== '0') {
    const cleared = clearInvestorHorse(cfg.userId, cfg.inventoryId);
    const armed = rearmFixtures(cfg.slug, cfg.inventoryId, cfg.rearmShares, cfg.rearmReserved);
    console.log(
      `  re-arm           : shares_available=${armed.shares} reserved=${armed.reserved} (released ${armed.released} expired)` +
        ` | cleared this investor: ${cleared.holdings} holding(s), ${cleared.reservations} reservation(s)`
    );
  }
  releaseExpiredReservations();
  setStatus(cfg.slug, 'listed');
  console.log(`  fixture          : ${cfg.slug} -> listed (revert happens in the finally block)`);

  const ctx = { cfg, state: {}, outDir };
  const results = [];
  let failed = 0;
  try {
    const seen = new Map();
    for (const c of selected) {
      const t0 = Date.now();
      let r;
      const missing = (c.needs || []).filter((n) => seen.get(n) !== true);
      if (missing.length) {
        results.push({ id: c.id, title: c.title, task: c.task, ok: false, skipped: true, evidence: `skipped: ${missing.join(', ')} did not pass`, detail: 'dependency not met', ms: 0 });
        console.log(`  SKIP  ${c.id.padEnd(3)} ${c.title}`);
        console.log(`        why: ${missing.join(', ')} did not pass`);
        seen.set(c.id, false);
        continue;
      }
      try {
        r = await c.run(ctx);
      } catch (e) {
        r = { ok: false, evidence: `threw: ${e.message}`, detail: e.stack?.split('\n')[1]?.trim() || '' };
      }
      seen.set(c.id, r.ok);
      const ms = Date.now() - t0;
      if (!r.ok && !r.skipped) failed++;
      results.push({ id: c.id, title: c.title, task: c.task, ok: r.ok, evidence: r.evidence, detail: r.detail, ms });
      console.log(`  ${r.ok ? 'PASS' : 'FAIL'}  ${c.id.padEnd(3)} ${c.title}`);
      if (r.evidence) console.log(`        evidence: ${r.evidence}`);
      if (!r.ok && r.detail) console.log(`        why     : ${r.detail}`);
    }
  } finally {
    // ---- always revert, even on a crash mid-walk ----
    releaseExpiredReservations();
    setStatus(cfg.slug, 'coming_soon');
    const after = inventory(cfg.slug);
    ctx.state.revertNote = `${cfg.slug} -> coming_soon; shares_available=${after?.sharesAvailable}`;
    const held = results.find((r) => r.id === 'M5');
    if (held) held.evidence += ` | ${ctx.state.revertNote}`;
    console.log(`\n  revert           : ${ctx.state.revertNote}`);
  }

  const report = {
    runAt: started.toISOString(),
    durationMs: Date.now() - started.getTime(),
    slug: cfg.slug,
    inventoryBefore: before,
    inventoryAfter: inventory(cfg.slug),
    investor: profile,
    passed: results.filter((r) => r.ok).length,
    failed,
    skipped: results.filter((r) => r.skipped).length,
    results,
  };
  writeFileSync(join(outDir, 'report.json'), JSON.stringify(report, null, 2));

  const md = [
    `# testnet run — ${report.runAt}`,
    '',
    `**${report.passed}/${results.length} checks passed.** horse \`${cfg.slug}\` · investor ${cfg.email} · ${Math.round(report.durationMs / 1000)}s`,
    '',
    '| check | task | verdict | evidence |',
    '|---|---|---|---|',
    ...results.map((r) => `| ${r.id} ${r.title} | ${r.task} | ${r.ok ? '✅' : r.skipped ? '⏭️' : '❌'} | ${String(r.evidence).replace(/\|/g, '\\|')} |`),
    '',
    `Revert: ${ctx.state.revertNote}`,
    '',
  ].join('\n');
  writeFileSync(join(outDir, 'report.md'), md);

  banner(failed === 0 ? `ALL GREEN — ${report.passed}/${results.length}` : `FAILED — ${failed} of ${results.length}`);
  console.log(`  report: ${join(outDir, 'report.md')}\n`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error('testnet crashed:', e);
  process.exit(1);
});
