import assert from 'node:assert/strict';
import { renderLegalPdf } from '../src/pdf';

const shortDoc = `# Syndicate Agreement
## Lady Ketchikan (NZ) Syndicate

**Campaign:** nellie

1. The Syndicate is divided into 10 shares of 0.5% each, representing the 5% leasehold interest.

- are at least 18 years of age;
- are not subject to any racing disqualification or exclusion order;

| Field | Value |
| --- | --- |
| Sire | Almanzor |
| Dam | Night Danza |

**Shareholder Name:** Alex Smith
**Date:** 2026-09-12

Punctuation that must be transliterated: \u2019curly\u2019 \u201Cquotes\u201D \u2014 dash \u2192 arrow \u00D7 times.
`;

const pdf = renderLegalPdf(shortDoc, {
  title: 'Syndicate Agreement',
  docHash: 'a'.repeat(64),
  version: 'v1.0.0',
});

// 1. Structural: a real PDF with the required objects.
const text = pdf.toString('latin1');
assert.ok(text.startsWith('%PDF-1.4'), 'starts with %PDF-1.4');
assert.ok(text.trimEnd().endsWith('%%EOF'), 'ends with %%EOF');
assert.ok(text.includes('/Type /Catalog'), 'has catalog');
assert.ok(text.includes('/BaseFont /Helvetica'), 'uses base-14 Helvetica (no embedding)');
assert.ok(/xref\n0 \d+\n/.test(text), 'has xref table');
assert.ok(/startxref\n\d+\n%%EOF/.test(text), 'has startxref offset');
assert.ok(pdf.length > 1200, `non-trivial size (${pdf.length} bytes)`);

// 2. Determinism: the locked artifact must re-render byte-identically for the same bytes.
const again = renderLegalPdf(shortDoc, { title: 'Syndicate Agreement', docHash: 'a'.repeat(64), version: 'v1.0.0' });
assert.equal(again.toString('latin1'), text, 'byte-identical re-render (no timestamps/ids)');
assert.ok(!/\/CreationDate|\/ID\s*\[/.test(text), 'no timestamps or doc ids in the PDF');

// 3. Content: key strings survive, punctuation is transliterated to WinAnsi-safe ASCII.
assert.ok(text.includes('10 shares of 0.5% each'), 'share sentence preserved');
assert.ok(text.includes('Shareholder Name: Alex Smith'), 'execution name preserved');
assert.ok(text.includes("'curly' \"quotes\" - dash -> arrow x times"), 'punctuation transliterated');
assert.ok(!/[\u2018\u2019\u201C\u201D\u2192\u00D7]/.test(text), 'no un-encodable glyphs left');

// 4. Multi-page: a long document paginates and the page count is declared.
const longDoc = Array.from({ length: 220 }, (_, i) => `Paragraph ${i + 1}: ${'lorem ipsum dolor sit amet '.repeat(6)}`).join('\n\n');
const longPdf = renderLegalPdf(longDoc, { title: 'Product Disclosure Statement', docHash: 'b'.repeat(64) });
const longText = longPdf.toString('latin1');
const count = Number(/\/Count (\d+)/.exec(longText)?.[1] ?? '0');
assert.ok(count >= 3, `long doc paginates (pages=${count})`);
assert.equal((longText.match(/\/Type \/Page[^s]/g) ?? []).length, count, 'page objects match declared count');
assert.ok(longText.includes(`Page ${count} of ${count}`), 'last-page footer present');

// 5. Same doc + different hash renders the hash into the footer (the visible lock).
const hashed = renderLegalPdf(shortDoc, { title: 'Syndicate Agreement', docHash: 'c'.repeat(64) });
assert.ok(hashed.toString('latin1').includes(`${'c'.repeat(16)}...`), 'doc hash printed in footer');

console.log('pdf.test.ts — all assertions passed');
