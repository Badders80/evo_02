/**
 * Dependency-free Markdown → PDF renderer for legal documents.
 *
 * Why hand-rolled: the artifact must be produced (a) inside a serverless handler
 * with no headless browser, (b) with NO new dependency, and (c) deterministically —
 * the same recorded bytes must always render the same bytes, because the PDF is the
 * investor's locked copy of the document they ticked.
 *
 * Coverage is deliberately the subset the PDS/SA generators emit: headings,
 * paragraphs, bullets, blockquote-ish lines, horizontal rules, two-column tables
 * and bold runs. Base-14 Helvetica (WinAnsi) means no font embedding.
 */

const PAGE_W = 595.28; // A4 portrait, points
const PAGE_H = 841.89;
const MARGIN_X = 56;
const MARGIN_TOP = 64;
const MARGIN_BOTTOM = 64;
const BODY_SIZE = 9.6;
const BODY_LEADING = 13.4;
const HEADING_SIZES = [15, 12.5, 11] as const; // h1, h2, h3+

/** WinAnsi-safe transliteration: curly punctuation and arrows have no glyph in
 * Helvetica/WinAnsi and would corrupt the content stream. */
function ascii(input: string): string {
  return input
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014\u2015]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[\u2192\u27A1\u2794]/g, '->')
    .replace(/\u00D7/g, 'x')
    .replace(/\u2022/g, '-')
    .replace(/\u00A0/g, ' ')
    // strip anything outside printable ASCII + Latin-1 (no control chars: the
    // markdown is line-split first, so newlines never reach this function)
    .replace(/[^\u0020-\u007E\u00A1-\u00FF]/g, '');
}

/** Approximate Helvetica advance widths (per 1000 units) — enough for wrapping. */
const NARROW = new Set('iljtfr.,;:!|\'`I[](){} '.split(''));
function widthOf(text: string, size: number, bold: boolean): number {
  let units = 0;
  for (const ch of text) {
    if (NARROW.has(ch)) units += 278;
    else if (/[A-Z0-9]/.test(ch)) units += 611;
    else units += bold ? 556 : 500;
  }
  return (units / 1000) * size;
}

function wrap(text: string, size: number, bold: boolean, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (widthOf(next, size, bold) <= maxWidth) line = next;
    else {
      if (line) lines.push(line);
      if (widthOf(word, size, bold) > maxWidth) {
        // hard-break an unbreakable token (hashes, long URLs)
        let chunk = '';
        for (const ch of word) {
          if (widthOf(chunk + ch, size, bold) > maxWidth) {
            lines.push(chunk);
            chunk = ch;
          } else chunk += ch;
        }
        line = chunk;
      } else line = word;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

type Block = { text: string; size: number; bold: boolean; indent: number; gapAfter: number; rule?: boolean };

function markdownToBlocks(md: string): Block[] {
  const blocks: Block[] = [];

  for (const rawLine of md.split(/\r?\n/)) {
    const line = ascii(rawLine).replace(/\s+$/, '');
    if (/^\s*```/.test(line)) continue; // fenced-code markers never appear in the offer docs
    if (!line.trim()) continue;
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      blocks.push({ text: '', size: BODY_SIZE, bold: false, indent: 0, gapAfter: 6, rule: true });
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      const size = HEADING_SIZES[Math.min(level, 3) - 1];
      blocks.push({
        text: heading[2].replace(/\*\*/g, ''),
        size,
        bold: true,
        indent: 0,
        gapAfter: level === 1 ? 8 : 5,
      });
      continue;
    }
    const bullet = line.match(/^\s*([-*+]|\d+\.)\s+(.*)$/);
    if (bullet) {
      blocks.push({ text: `- ${bullet[2].replace(/\*\*/g, '')}`, size: BODY_SIZE, bold: false, indent: 12, gapAfter: 2 });
      continue;
    }
    const tableRow = line.match(/^\s*\|(.+)\|\s*$/);
    if (tableRow && !/^\s*\|[\s:|-]+\|\s*$/.test(line)) {
      const cells = tableRow[1].split('|').map((c) => c.trim().replace(/\*\*/g, ''));
      blocks.push({ text: cells.join('   |   '), size: BODY_SIZE - 0.6, bold: false, indent: 4, gapAfter: 1 });
      continue;
    }
    if (/^\s*\|[\s:|-]+\|\s*$/.test(line)) continue; // table separator row
    const bold = /^\*\*[^*]+\*\*:?$/.test(line.trim());
    blocks.push({
      text: line.replace(/\*\*/g, '').replace(/^\s*>\s?/, '').trim(),
      size: BODY_SIZE,
      bold,
      indent: 0,
      gapAfter: 6,
    });
  }
  return blocks;
}

function pdfString(text: string): string {
  return `(${text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')})`;
}

export interface RenderLegalPdfOptions {
  /** Document title printed on the first line (PDS/SA heading). */
  title: string;
  /** Footer left: e.g. "Evolution Stables - Syndicate Manager". */
  footerLeft?: string;
  /** Footer centre: the recorded document hash — the lock, printed on every page. */
  docHash?: string;
  /** Footer right: e.g. "Page 1 of 3". */
  version?: string;
}

/**
 * Renders markdown to a deterministic single/multi-page PDF (no timestamps, no
 * document IDs, no compression).
 */
export function renderLegalPdf(markdown: string, options: RenderLegalPdfOptions): Buffer {
  const maxWidth = PAGE_W - MARGIN_X * 2;
  const blocks = markdownToBlocks(markdown);

  const pages: string[] = [];
  let ops: string[] = [];
  let y = PAGE_H - MARGIN_TOP;
  const newPage = () => {
    pages.push(ops.join('\n'));
    ops = [];
    y = PAGE_H - MARGIN_TOP;
  };
  const text = (s: string, x: number, size: number, bold: boolean) => {
    ops.push(`BT /${bold ? 'F2' : 'F1'} ${size} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td ${pdfString(s)} Tj ET`);
  };

  text(options.title, MARGIN_X, 15, true);
  y -= 20;
  ops.push(`0.75 w 0.6 0.6 0.6 RG ${MARGIN_X} ${y.toFixed(2)} m ${(PAGE_W - MARGIN_X).toFixed(2)} ${y.toFixed(2)} l S`);
  y -= 18;

  for (const block of blocks) {
    if (block.rule) {
      ops.push(`0.75 w 0.8 0.8 0.8 RG ${MARGIN_X} ${y.toFixed(2)} m ${(PAGE_W - MARGIN_X).toFixed(2)} ${y.toFixed(2)} l S`);
      y -= block.gapAfter + 4;
      continue;
    }
    const lines = wrap(block.text, block.size, block.bold, maxWidth - block.indent);
    for (const line of lines) {
      if (y < MARGIN_BOTTOM + BODY_LEADING) newPage();
      text(line, MARGIN_X + block.indent, block.size, block.bold);
      y -= BODY_LEADING * (block.size / BODY_SIZE);
    }
    y -= block.gapAfter;
  }
  pages.push(ops.join('\n'));

  const footers = pages.map((content, i) => {
    const left = ascii(options.footerLeft ?? 'Evolution Stables - Syndicate Manager');
    const centre = ascii(options.docHash ? `${options.docHash.slice(0, 16)}...${options.docHash.slice(-8)}` : '');
    const right = ascii(`${options.version ? options.version + ' - ' : ''}Page ${i + 1} of ${pages.length}`);
    return (
      content +
      `\nBT /F1 7 Tf ${MARGIN_X} 40 Td ${pdfString(left)} Tj ET` +
      (centre ? `\nBT /F1 7 Tf ${(PAGE_W / 2 - 60).toFixed(2)} 40 Td ${pdfString(centre)} Tj ET` : '') +
      `\nBT /F1 7 Tf ${(PAGE_W - MARGIN_X - 70).toFixed(2)} 40 Td ${pdfString(right)} Tj ET`
    );
  });

  // --- object assembly (deterministic order, fixed ids) ---
  const objects: string[] = [];
  const pageIds = footers.map((_, i) => 4 + i * 2); // page, content, page, content...
  const fontRegularId = 4 + footers.length * 2;
  const fontBoldId = fontRegularId + 1;

  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  objects.push(
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${footers.length} >>`
  );
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  footers.forEach((content, i) => {
    const pageId = 4 + i * 2;
    const contentId = pageId + 1;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentId} 0 R >>`
    );
    objects.push(`<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream`);
  });
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) pdf += `${off.toString().padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, 'latin1');
}
