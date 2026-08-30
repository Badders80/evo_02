/* PedigreeTab — founder-locked pedigree surface (chunk-6 + pass-3 prod style).
 *
 * Pass-3: restored to the ORIGINAL production treatment:
 *   - Header row: BROODMARE SIRE chip (left) + pill sub-tabs (right)
 *   - Horizontal cascading 4-gen tree: SUBJECT → PARENTS → GRANDPARENTS →
 *     GREAT-GRANDPARENTS columns with connector stubs, SIRE green / DAM red
 *     role chips, [country] year badges
 *   - Panel stays INSIDE the page's left two-thirds column; an EXPAND control
 *     opens the same tree full-screen (Esc / overlay click / close button)
 *
 * Line semantics (prod buildPedigreeTree, verified against local DB data):
 *   sire_line[0]        = the sire itself; .partner = the sire's DAM
 *   sire_line[1]        = sire's SIRE;        .partner = that male's dam
 *   sire_line[2]        = sire's sire's sire; .partner = his dam
 *   dam_line[0]         = the dam itself; .partner = the dam's SIRE
 *   dam_line[1]         = dam's DAM;          .partner = that female's sire
 *   dam_line[2]         = dam's dam's dam;    .partner = her sire
 *   cross_line          = the 4 gen-3 great-grandparents not reachable from
 *                         the two tail lines (sire_dam_sire, sire_dam_dam,
 *                         dam_sire_sire, dam_sire_dam)
 */

'use client';

import * as React from 'react';

export interface PedigreeAncestor {
  name: string;
  year?: string;
  country?: string;
  partner?: {
    name?: string;
    country?: string;
    year?: string;
  };
}

export interface PedigreeCrossLine {
  sire_dam_sire?: string;
  sire_dam_dam?: string;
  dam_sire_sire?: string;
  dam_sire_dam?: string;
}

export interface PedigreeTabProps {
  subjectName: string;
  sireName?: string;
  damName?: string;
  sireLine?: PedigreeAncestor[];
  damLine?: PedigreeAncestor[];
  crossLine?: PedigreeCrossLine | null;
  sex?: string;
  colour?: string;
  age?: string;
  foaled?: string;
  breedingRecordUrl?: string;
}

type SubTab = 'matrix' | 'dam-line' | 'sire-line';

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: 'matrix', label: 'PEDIGREE MATRIX' },
  { key: 'dam-line', label: 'DAM LINE' },
  { key: 'sire-line', label: 'SIRE LINE' },
];

const LINE_LABEL = 'text-[9px] font-mono uppercase tracking-[0.25em] text-muted-foreground';

/** Normalised name key for linebreeding comparison (prod pattern: lowercase + trim). */
function nameKey(name: string): string {
  return name.toLowerCase().trim();
}

interface NodeData {
  name: string;
  country?: string;
  year?: string;
  role?: 'subject' | 'sire' | 'dam';
  gen?: number;
}

/** Parses string names like "Derryn (AUS) 2013" into name, country, year (prod parseNameMeta). */
function parseNameMeta(rawName?: string | null, defaultCountry?: string, defaultYear?: string): NodeData {
  if (!rawName || rawName === '—' || rawName.trim() === '') {
    return { name: '—' };
  }
  const match = rawName.match(/^(.*?)(?:\s*\(([A-Z]{2,3})\))?(?:\s*(\d{4}))?$/i);
  if (match) {
    const cleanName = match[1].trim();
    const country = match[2]?.toUpperCase() || defaultCountry;
    const year = match[3] || defaultYear;
    return { name: cleanName || rawName, country, year };
  }
  return { name: rawName, country: defaultCountry, year: defaultYear };
}

function entryToNode(entry?: PedigreeAncestor | null, role: 'sire' | 'dam' = 'sire', gen = 1): NodeData {
  return { ...parseNameMeta(entry?.name, entry?.country, entry?.year), role, gen };
}

function partnerToNode(entry?: PedigreeAncestor | null, role: 'sire' | 'dam' = 'dam', gen = 1): NodeData {
  return { ...parseNameMeta(entry?.partner?.name, entry?.partner?.country, entry?.partner?.year), role, gen };
}

function nameToNode(name: string, role: 'subject' | 'sire' | 'dam' = 'sire', gen = 1): NodeData {
  return { ...parseNameMeta(name), role, gen };
}

export interface PedigreeTreeNodes {
  horse: NodeData;
  sire: NodeData;
  dam: NodeData;
  sireSire: NodeData;
  sireDam: NodeData;
  damSire: NodeData;
  damDam: NodeData;
  sireSireSire: NodeData;
  sireSireDam: NodeData;
  sireDamSire: NodeData;
  sireDamDam: NodeData;
  damSireSire: NodeData;
  damSireDam: NodeData;
  damDamSire: NodeData;
  damDamDam: NodeData;
}

/** Prod builder, ported verbatim (semantics locked against live data). */
export function buildPedigreeTree(
  sireName: string,
  damName: string,
  horseName: string,
  sireLine: PedigreeAncestor[] = [],
  damLine: PedigreeAncestor[] = [],
  crossLine?: PedigreeCrossLine | null
): PedigreeTreeNodes {
  return {
    horse: nameToNode(horseName, 'subject', 0),
    sire: nameToNode(sireName, 'sire', 1),
    dam: nameToNode(damName, 'dam', 1),
    sireSire: entryToNode(sireLine[1], 'sire', 2),
    sireDam: partnerToNode(sireLine[0], 'dam', 2),
    damSire: partnerToNode(damLine[0], 'sire', 2),
    damDam: entryToNode(damLine[1], 'dam', 2),
    sireSireSire: entryToNode(sireLine[2], 'sire', 3),
    sireSireDam: partnerToNode(sireLine[1], 'dam', 3),
    sireDamSire: nameToNode(crossLine?.sire_dam_sire || '—', 'sire', 3),
    sireDamDam: nameToNode(crossLine?.sire_dam_dam || '—', 'dam', 3),
    damSireSire: nameToNode(crossLine?.dam_sire_sire || '—', 'sire', 3),
    damSireDam: nameToNode(crossLine?.dam_sire_dam || '—', 'dam', 3),
    damDamSire: partnerToNode(damLine[1], 'sire', 3),
    damDamDam: entryToNode(damLine[2], 'dam', 3),
  };
}

/** Distinct ancestor names appearing more than once in the 4-gen tree (prod pattern). */
export function getLinebreedingDuplicates(tree: PedigreeTreeNodes): Set<string> {
  const counts = new Map<string, number>();
  const nodes = Object.values(tree);
  for (const node of nodes) {
    if (!node.name || node.name === '—' || node.role === 'subject') continue;
    const norm = nameKey(node.name);
    counts.set(norm, (counts.get(norm) || 0) + 1);
  }
  const duplicates = new Set<string>();
  for (const [norm, count] of counts.entries()) {
    if (count > 1) duplicates.add(norm);
  }
  return duplicates;
}

/** Role chip colours — prod: SIRE green, DAM red-pink. */
function roleChipClass(role?: NodeData['role'], highlight?: boolean): string {
  if (role === 'sire') return highlight ? 'text-status-active' : 'text-status-active/80';
  if (role === 'dam') return highlight ? 'text-rose-300' : 'text-rose-300/80';
  return 'text-muted-foreground';
}

/** A single ancestor card in the matrix: SIRE/DAM chip + name + [country] year. */
function AncestorCard({
  node,
  highlight,
  onHover,
  onLeave,
  showRoleChip = true,
}: {
  node: NodeData;
  highlight: boolean;
  onHover: (name: string | null) => void;
  onLeave: () => void;
  showRoleChip?: boolean;
}) {
  const isUnknown = !node.name || node.name === '—';
  if (isUnknown) {
    return (
      <div className="min-w-[120px] rounded-lg border border-dashed border-border/60 bg-card/40 p-2.5 text-center">
        <span className="text-[11px] font-light text-muted-foreground">—</span>
      </div>
    );
  }
  return (
    <div
      role="presentation"
      onMouseEnter={() => onHover(node.name)}
      onMouseLeave={onLeave}
      className={`min-w-[120px] rounded-lg border p-2.5 transition-all duration-200 ${
        highlight
          ? 'border-accent bg-accent/10 shadow-[0_0_12px_rgba(212,169,100,0.25)]'
          : 'border-border bg-card hover:border-accent/50'
      }`}
    >
      {showRoleChip && node.role && (
        <span className={`text-[8px] font-mono uppercase tracking-[0.2em] ${roleChipClass(node.role, highlight)}`}>
          {node.role}
        </span>
      )}
      <p className={`mt-0.5 truncate text-[12px] font-light ${highlight ? 'text-accent' : 'text-heading'}`} title={node.name}>
        {node.name}
      </p>
      <p className="mt-0.5 font-mono text-[9px] text-muted-foreground">
        {node.country ? `[${node.country}]` : ''}
        {node.country && node.year ? ' ' : ''}
        {node.year || ''}
      </p>
    </div>
  );
}

/** Horizontal cascade column header (prod: SUBJECT / PARENTS / …). */
function ColumnLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-center font-mono text-[8px] uppercase tracking-[0.25em] text-muted-foreground">{children}</p>;
}

/** Connector stub drawn from each node toward the previous column. */
function NodeWithStub({ children, withStub = true }: { children: React.ReactNode; withStub?: boolean }) {
  return (
    <div className="flex items-center">
      {withStub && <span className="h-px w-4 shrink-0 bg-border" aria-hidden="true" />}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/** PEDIGREE MATRIX sub-tab — horizontal cascading 4-gen tree (prod style). */
function PedigreeMatrix({
  tree,
  highlightName,
  setHighlightName,
  large = false,
}: {
  tree: PedigreeTreeNodes;
  highlightName: string | null;
  setHighlightName: (name: string | null) => void;
  large?: boolean;
}) {
  const hoverProps = (node: NodeData) => ({
    node,
    highlight: Boolean(node.name && node.name !== '—' && highlightName && nameKey(node.name) === nameKey(highlightName)),
    onHover: setHighlightName,
    onLeave: () => setHighlightName(null),
  });

  const colGap = large ? 'gap-1' : 'gap-1';
  const stack = large ? 'justify-around gap-3' : 'justify-around gap-2';

  return (
    <div className={large ? 'min-w-[880px]' : 'min-w-[640px]'}>
      <div className={`grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1.2fr] items-stretch ${colGap}`}>
        {/* SUBJECT */}
        <div className="flex flex-col">
          <ColumnLabel>Subject</ColumnLabel>
          <div className={`flex flex-1 flex-col ${stack}`}>
            <div className="flex items-center">
              <div className="min-w-0 flex-1">
                <div
                  className={`rounded-lg border border-accent/60 bg-accent/10 text-center shadow-[0_0_20px_rgba(212,169,100,0.3)] ${
                    large ? 'px-6 py-4' : 'px-4 py-3'
                  }`}
                >
                  <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-accent">Horse</span>
                  <p className={`font-light text-heading ${large ? 'text-[16px]' : 'text-[14px]'}`}>{tree.horse.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PARENTS */}
        <div className="flex flex-col">
          <ColumnLabel>Parents</ColumnLabel>
          <div className={`flex flex-1 flex-col ${stack}`}>
            <NodeWithStub>
              <AncestorCard {...hoverProps(tree.sire)} />
            </NodeWithStub>
            <NodeWithStub>
              <AncestorCard {...hoverProps(tree.dam)} />
            </NodeWithStub>
          </div>
        </div>

        {/* GRANDPARENTS */}
        <div className="flex flex-col">
          <ColumnLabel>Grandparents</ColumnLabel>
          <div className={`flex flex-1 flex-col ${stack}`}>
            <NodeWithStub><AncestorCard {...hoverProps(tree.sireSire)} /></NodeWithStub>
            <NodeWithStub><AncestorCard {...hoverProps(tree.sireDam)} /></NodeWithStub>
            <NodeWithStub><AncestorCard {...hoverProps(tree.damSire)} /></NodeWithStub>
            <NodeWithStub><AncestorCard {...hoverProps(tree.damDam)} /></NodeWithStub>
          </div>
        </div>

        {/* GREAT-GRANDPARENTS */}
        <div className="flex flex-col">
          <ColumnLabel>Great-Grandparents</ColumnLabel>
          <div className={`flex flex-1 flex-col ${large ? 'justify-around gap-1.5' : 'justify-around gap-1'}`}>
            <NodeWithStub><AncestorCard {...hoverProps(tree.sireSireSire)} /></NodeWithStub>
            <NodeWithStub><AncestorCard {...hoverProps(tree.sireSireDam)} /></NodeWithStub>
            <NodeWithStub><AncestorCard {...hoverProps(tree.sireDamSire)} /></NodeWithStub>
            <NodeWithStub><AncestorCard {...hoverProps(tree.sireDamDam)} /></NodeWithStub>
            <NodeWithStub><AncestorCard {...hoverProps(tree.damSireSire)} /></NodeWithStub>
            <NodeWithStub><AncestorCard {...hoverProps(tree.damSireDam)} /></NodeWithStub>
            <NodeWithStub><AncestorCard {...hoverProps(tree.damDamSire)} /></NodeWithStub>
            <NodeWithStub><AncestorCard {...hoverProps(tree.damDamDam)} /></NodeWithStub>
          </div>
        </div>
      </div>
    </div>
  );
}

/** DAM LINE / SIRE LINE sub-tab — the full tail of one line, with partners. */
function LineList({
  entries,
  role,
  highlightName,
  setHighlightName,
}: {
  entries: PedigreeAncestor[];
  role: 'SIRE' | 'DAM';
  highlightName: string | null;
  setHighlightName: (name: string | null) => void;
}) {
  return (
    <div className="space-y-1">
      {entries.map((entry, idx) => {
        const isHighlighted = Boolean(entry.name && highlightName && nameKey(entry.name) === nameKey(highlightName));
        const partnerHighlighted = Boolean(
          entry.partner?.name && entry.partner.name !== '—' && highlightName && nameKey(entry.partner.name) === nameKey(highlightName)
        );
        return (
          <div key={`${entry.name}-${idx}`} className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="w-8 shrink-0 text-right font-mono text-[9px] text-muted-foreground">{idx + 1}</span>
              <div
                role="presentation"
                onMouseEnter={() => setHighlightName(entry.name)}
                onMouseLeave={() => setHighlightName(null)}
                className={`flex min-w-0 flex-1 items-baseline justify-between gap-3 rounded-lg border p-2.5 transition-all duration-200 ${
                  isHighlighted
                    ? 'border-accent bg-accent/10 shadow-[0_0_12px_rgba(212,169,100,0.25)]'
                    : 'border-border bg-card hover:border-accent/50'
                }`}
              >
                <span className="min-w-0">
                  {idx === 0 && (
                    <span className={`mr-1.5 text-[8px] font-mono uppercase tracking-[0.2em] ${roleChipClass(role === 'SIRE' ? 'sire' : 'dam', isHighlighted)}`}>
                      {role}
                    </span>
                  )}
                  <span className={`truncate text-[13px] font-light ${isHighlighted ? 'text-accent' : 'text-heading'}`}>
                    {entry.name}
                  </span>
                  <span className="ml-1.5 font-mono text-[9px] text-muted-foreground">
                    {entry.country ? `[${entry.country}]` : ''}{entry.country && entry.year ? ' ' : ''}{entry.year || ''}
                  </span>
                </span>
                {entry.partner?.name && entry.partner.name !== '—' && (
                  <span
                    role="presentation"
                    onMouseEnter={() => setHighlightName(entry.partner!.name!)}
                    onMouseLeave={() => setHighlightName(null)}
                    className={`shrink-0 text-right font-mono text-[10px] ${partnerHighlighted ? 'text-accent' : 'text-muted-foreground'}`}
                  >
                    × {entry.partner.name}
                  </span>
                )}
              </div>
            </div>
            {idx < entries.length - 1 && <div className="ml-6 h-2 w-px bg-border" aria-hidden="true" />}
          </div>
        );
      })}
    </div>
  );
}

export function PedigreeTab({
  subjectName,
  sireName = '—',
  damName = '—',
  sireLine,
  damLine,
  crossLine,
  sex,
  colour,
  age,
  foaled,
  breedingRecordUrl,
}: PedigreeTabProps) {
  const [activeSubTab, setActiveSubTab] = React.useState<SubTab>('matrix');
  const [highlightName, setHighlightName] = React.useState<string | null>(null);
  const [expanded, setExpanded] = React.useState(false);

  const hasSireLine = Boolean(sireLine && sireLine.length > 0);
  const hasDamLine = Boolean(damLine && damLine.length > 0);

  const tree = React.useMemo(
    () => buildPedigreeTree(sireName, damName, subjectName, sireLine, damLine, crossLine),
    [sireName, damName, subjectName, sireLine, damLine, crossLine]
  );

  // Linebreeding banner — real data only, never fabricated.
  const duplicates = React.useMemo(() => getLinebreedingDuplicates(tree), [tree]);
  const hasLinebreeding = duplicates.size > 0;

  // Broodmare sire = the dam's sire (prod semantics: dam_line[0].partner).
  const broodmareSire = parseNameMeta(damLine?.[0]?.partner?.name);

  // Esc closes the fullscreen pedigree modal.
  React.useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [expanded]);

  if (!hasSireLine && !hasDamLine) {
    return (
      <div className="space-y-4">
        <p className="text-[12px] font-light text-muted-foreground">
          Full pedigree for {subjectName} will be published shortly.
        </p>
      </div>
    );
  }

  const subTabPanels = (large = false) => (
    <>
      {activeSubTab === 'matrix' && (
        <PedigreeMatrix tree={tree} highlightName={highlightName} setHighlightName={setHighlightName} large={large} />
      )}
      {activeSubTab === 'dam-line' && hasDamLine && (
        <LineList entries={damLine!} role="DAM" highlightName={highlightName} setHighlightName={setHighlightName} />
      )}
      {activeSubTab === 'sire-line' && hasSireLine && (
        <LineList entries={sireLine!} role="SIRE" highlightName={highlightName} setHighlightName={setHighlightName} />
      )}
    </>
  );

  const headerRow = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* BROODMARE SIRE chip — prod style, left */}
      <div className="flex items-center gap-3">
        {broodmareSire.name && broodmareSire.name !== '—' ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/5 px-3 py-1">
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-muted-foreground">BROODMARE SIRE</span>
            <span className="text-[11px] font-light text-heading">{broodmareSire.name}</span>
            {broodmareSire.country && (
              <span className="font-mono text-[9px] text-muted-foreground">[{broodmareSire.country}]</span>
            )}
          </span>
        ) : (
          <span />
        )}
      </div>

      {/* Sub-tab pills — prod style, right */}
      <div className="flex items-center gap-2" role="tablist" aria-label="Pedigree sub-tabs">
        {SUB_TABS.map((tab) => {
          const isActive = activeSubTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveSubTab(tab.key)}
              className={`rounded-full px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.2em] transition-all duration-200 ${
                isActive
                  ? 'border border-accent/60 bg-accent/15 text-accent'
                  : 'border border-border text-muted-foreground hover:border-accent/40 hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
        {/* EXPAND — fullscreen escape hatch (tree stays in left 2/3 inline) */}
        <button
          type="button"
          onClick={() => setExpanded(true)}
          aria-label="Expand pedigree full screen"
          className="rounded-full border border-border px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground transition-all duration-200 hover:border-accent/40 hover:text-accent"
        >
          EXPAND ⤢
        </button>
      </div>
    </div>
  );

  const footerStrip = (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-4">
      {sex && (
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Sex: <span className="text-foreground">{sex}</span>
        </span>
      )}
      {colour && (
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Colour: <span className="text-foreground">{colour}</span>
        </span>
      )}
      {age && (
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Age: <span className="text-foreground">{age}</span>
        </span>
      )}
      {foaled && (
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Foaled: <span className="text-foreground">{foaled}</span>
        </span>
      )}
      {breedingRecordUrl && (
        <a
          href={breedingRecordUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-[10px] font-mono uppercase tracking-widest text-accent hover:underline"
        >
          FULL BREEDING RECORD ↗
        </a>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ── Linebreeding banner (from real pedigree_data, 4-gen tree) ───── */}
      {hasLinebreeding && (
        <div className="flex items-start gap-3 rounded-xl border border-accent/40 bg-accent/5 p-4">
          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
          <p className="text-[11px] leading-relaxed font-light text-foreground">
            <span className="font-medium text-accent">Linebreeding detected:</span>{' '}
            {duplicates.size} repeated ancestor{duplicates.size !== 1 ? 's' : ''} in 4
            generations. Hover over names to highlight matching lines.
          </p>
        </div>
      )}

      {/* ── Prod header row: BROODMARE SIRE chip | pill sub-tabs + EXPAND ── */}
      {headerRow}

      {/* ── Sub-tab panel — horizontal cascade, LEFT TWO-THIRDS ONLY ────── */}
      <div className="overflow-x-auto pb-2">{subTabPanels(false)}</div>

      {/* ── Footer strip ─────────────────────────────────────────────────── */}
      {footerStrip}

      {/* ── Fullscreen modal (escape hatch for the 2/3 width constraint) ── */}
      {expanded && (
        <div
          className="fixed inset-0 z-[999] overflow-y-auto bg-black/95 p-6 backdrop-blur-sm md:p-10"
          onClick={() => setExpanded(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${subjectName} pedigree — full screen`}
        >
          <div className="mx-auto max-w-7xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {subjectName} — FULL PEDIGREE
              </p>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="rounded-full border border-border px-4 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground transition-all hover:border-accent/40 hover:text-accent"
                aria-label="Close full screen pedigree"
              >
                CLOSE ✕
              </button>
            </div>
            <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm">
              {headerRow}
              <div className="mt-6 overflow-x-auto">{subTabPanels(true)}</div>
              <div className="mt-6">{footerStrip}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
