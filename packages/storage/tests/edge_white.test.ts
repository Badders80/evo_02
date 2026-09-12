/**
 * Edge-white gate: no shipped public image may sit on an opaque white edge.
 *
 * Catches BOTH failure modes:
 *  - RGB files flattened onto a white background (no alpha channel at all)
 *  - RGBA files whose border pixels are opaque white (alpha present but unused)
 *
 * Method: for each image under apps/web/public, sample the 8 edge-midpoint /
 * corner pixels. An image FAILS when >= 6 samples are opaque (alpha >= 250)
 * AND near-white (min(R,G,B) >= 250). A flattened cutout scores 8/8; real
 * photography almost never does.
 *
 * EXEMPT list: deliberate white-art-on-white compositions. Keep short, one
 * public path per entry, with a reason.
 *
 * Implementation note: pixel work runs in Python/PIL (env has it; Node has no
 * image codec). The helper lives in this package's tests/ dir.
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

console.log('Running @evo/storage edge-white gate...');

const testDir = dirname(fileURLToPath(import.meta.url));
const helper = join(testDir, 'edge_white_scan.py');

let stdout: string;
try {
  stdout = execFileSync('python3', [helper], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    timeout: 120_000,
  });
} catch (err) {
  const e = err as { stdout?: string; stderr?: string };
  // Scanner prints failures as JSON lines; surface them verbatim on failure.
  assert.fail(`edge-white scanner failed:\n${e.stdout ?? ''}${e.stderr ?? err}`);
}

const report = JSON.parse(stdout) as {
  scanned: number;
  failures: { path: string; whiteEdges: number }[];
  exempt: string[];
};

assert.ok(report.scanned > 0, 'scanner must find images to scan');

const offenders = report.failures.filter((f) => !report.exempt.includes(f.path));
assert.deepEqual(
  offenders,
  [],
  `opaque white edges found (flattened cutouts ship as white boxes):\n` +
    offenders.map((f) => `  ${f.path} (${f.whiteEdges}/8 white edge samples)`).join('\n')
);

console.log(`OK: ${report.scanned} images scanned, 0 opaque-white edges` +
  (report.exempt.length ? ` (${report.exempt.length} exempt)` : ''));
