"use client";

import { useState } from "react";
import { buildPedigreeTree, getLinebreedingDuplicates } from "@/lib/pedigree-tree";
import type { PedigreeCrossLine, PedigreeNodeData } from "@/lib/pedigree-tree";

interface PedigreeData {
  dam_line?: { name?: string; country?: string; year?: string; partner?: { name?: string; country?: string; year?: string } }[];
  sire_line?: { name?: string; country?: string; year?: string; partner?: { name?: string; country?: string; year?: string } }[];
  cross_line?: PedigreeCrossLine;
}

interface PedigreeTableProps {
  horseName: string;
  sireName: string;
  damName: string;
  damSireName?: string;
  sex: string;
  colour: string;
  age?: number;
  foalingDate?: string;
  breedingUrl?: string | null;
  pedigreeData?: PedigreeData | null;
}

type NodeTier = "subject" | "parent" | "grand" | "great";

function formatFoalingDate(dateStr?: string): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * A single pedigree name cell.
 */
function PedigreeNode({
  data,
  tier,
  isLinebredDuplicate,
  isHighlighted,
  onHover,
}: {
  data: PedigreeNodeData;
  tier: NodeTier;
  isLinebredDuplicate?: boolean;
  isHighlighted?: boolean;
  onHover?: (name: string | null) => void;
}) {
  const isEmpty = !data.name || data.name === "—";
  const normName = data.name ? data.name.toLowerCase().trim() : "";

  const tierStyles: Record<NodeTier, string> = {
    subject: "min-h-[64px] border-accent/40 bg-surface-base shadow-[0_0_24px_rgba(212,169,100,0.1)] px-3.5",
    parent: "min-h-[56px] border-border bg-raised/80 hover:border-steel-border",
    grand: "min-h-[48px] border-border/80 bg-raised/50 hover:border-steel-border",
    great: "min-h-[42px] border-border/60 bg-raised/30 hover:border-steel-border",
  };

  const nameTextStyles: Record<NodeTier, string> = {
    subject: "text-[13px] font-medium text-heading tracking-tight",
    parent: "text-[11.5px] font-medium text-foreground",
    grand: "text-[10.5px] font-normal text-muted-foreground",
    great: "text-[9.5px] font-normal text-muted-steel",
  };

  return (
    <div className="flex h-full min-w-0 flex-col items-center justify-center w-full">
      <div
        onMouseEnter={() => !isEmpty && onHover?.(normName)}
        onMouseLeave={() => onHover?.(null)}
        className={[
          "relative box-border flex w-full flex-col justify-between rounded-lg border px-2.5 py-1.5 transition-all duration-200",
          isEmpty && tier !== "subject" ? "opacity-30 border-dashed border-border" : "",
          tierStyles[tier],
          isHighlighted
            ? "border-accent bg-accent/20 ring-1 ring-accent/60 shadow-[0_0_16px_rgba(212,169,100,0.25)] text-pure-white"
            : isLinebredDuplicate
            ? "border-accent/40 bg-accent/10"
            : "",
        ].join(" ")}
      >
        {/* Top bar: Role badge & Country code */}
        <div className="flex items-center justify-between w-full gap-1 mb-0.5">
          {data.role === "sire" && (
            <span className="text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded bg-accent/15 text-accent border border-accent/30">
              Sire
            </span>
          )}
          {data.role === "dam" && (
            <span className="text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
              Dam
            </span>
          )}
          {data.role === "subject" && (
            <span className="text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded bg-raised text-frost border border-steel-border">
              Horse
            </span>
          )}

          {tier !== "great" && (
            <div className="flex items-center gap-1 ml-auto">
              {data.country && (
                <span className="text-[8.5px] font-mono text-muted-steel font-medium">
                  [{data.country}]
                </span>
              )}
              {data.year && (
                <span className="text-[8.5px] font-mono text-muted-foreground">
                  {data.year}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Horse Name */}
        <span
          className={["block w-full truncate leading-tight text-left", isHighlighted ? "text-pure-white font-medium" : nameTextStyles[tier]].join(" ")}
          title={data.name}
        >
          {data.name}
        </span>

        {/* Country & Year — inline after name for great-grandparents (tightens cell) */}
        {tier === "great" && (data.country || data.year) && (
          <div className="flex items-center gap-1 mt-0.5">
            {data.country && (
              <span className="text-[8px] font-mono text-muted-steel">
                [{data.country}]
              </span>
            )}
            {data.year && (
              <span className="text-[8px] font-mono text-muted-foreground">
                {data.year}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Clean SVG tree connector between generation columns.
 */
function TreeConnector({ splits = 2 }: { splits?: number }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center" aria-hidden>
      <svg className="w-full h-full text-border stroke-current" preserveAspectRatio="none">
        {splits === 2 && (
          <>
            {/* Left center horizontal arm */}
            <line x1="0" y1="50%" x2="50%" y2="50%" strokeWidth="1" />
            {/* Vertical stem */}
            <line x1="50%" y1="25%" x2="50%" y2="75%" strokeWidth="1" />
            {/* Right top horizontal arm */}
            <line x1="50%" y1="25%" x2="100%" y2="25%" strokeWidth="1" />
            {/* Right bottom horizontal arm */}
            <line x1="50%" y1="75%" x2="100%" y2="75%" strokeWidth="1" />
          </>
        )}
      </svg>
    </div>
  );
}

/**
 * 4-Generation Pedigree Bracket Matrix.
 */
function PedigreeChart({
  tree,
  sex,
  colour,
  age,
  formattedFoalingDate,
  onShowFullPedigree,
}: {
  tree: ReturnType<typeof buildPedigreeTree>;
  sex: string;
  colour: string;
  age?: number;
  formattedFoalingDate: string | null;
  onShowFullPedigree: () => void;
}) {
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const linebredDuplicates = getLinebreedingDuplicates(tree);

  const isHighlighted = (name?: string) => {
    if (!name || !hoveredName) return false;
    return name.toLowerCase().trim() === hoveredName;
  };

  const isDuplicate = (name?: string) => {
    if (!name || name === "—") return false;
    return linebredDuplicates.has(name.toLowerCase().trim());
  };

  return (
    <div className="border border-border bg-surface-base backdrop-blur-xl rounded-xl p-4 md:p-6 space-y-4">
      {/* Mobile scroll hint */}
      <div className="md:hidden flex items-center justify-between text-[11px] text-muted-foreground bg-raised border border-border rounded-lg px-3 py-1.5">
        <span>Pedigree Matrix</span>
        <span className="text-accent font-mono text-[10px]">Scroll right →</span>
      </div>

      {/* Metadata bar — TOP */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-light pb-3 border-b border-border">
        <span className="text-muted-foreground">
          Sex: <span className="text-foreground capitalize font-medium">{sex || "—"}</span>
        </span>
        <span className="text-muted-foreground">
          Colour: <span className="text-foreground capitalize font-medium">{colour || "—"}</span>
        </span>
        {age && (
          <span className="text-muted-foreground">
            Age: <span className="text-foreground font-medium">{age} Years</span>
          </span>
        )}
        {formattedFoalingDate && (
          <span className="text-muted-foreground">
            Foaled: <span className="text-foreground font-medium">{formattedFoalingDate}</span>
          </span>
        )}
        <button
          type="button"
          onClick={onShowFullPedigree}
          className="text-accent hover:text-accent-hover hover:underline ml-auto font-mono text-[10.5px] uppercase tracking-wider cursor-pointer transition-colors"
        >
          Full Breeding Record ↗
        </button>
      </div>

      {/* Grid container — 4 generations, compact to fit left column */}
      <div className="overflow-hidden rounded-lg">
        <div className="scale-[0.76] origin-top-left -mb-[24%] -mr-[24%]">
          <div className="w-full py-2">
            {/* Header row labels */}
            <div
              className="grid text-[10px] uppercase tracking-wider font-mono text-muted-foreground mb-2 px-1 text-center"
              style={{
                gridTemplateColumns: "1.4fr 24px 1.2fr 24px 1.2fr 24px 1.2fr",
              }}
            >
              <span>Subject</span>
              <span />
              <span>Parents</span>
              <span />
              <span>Grandparents</span>
              <span />
              <span>Great-Grandparents</span>
            </div>

            <div
              className="grid"
              style={{
                gridTemplateColumns: "1.4fr 24px 1.2fr 24px 1.2fr 24px 1.2fr",
                gridTemplateRows: "repeat(8, minmax(44px, 1fr))",
                rowGap: "4px",
              }}
            >
              {/* Gen 0: Subject — spans all 8 rows */}
              <div className="col-start-1 row-start-1 row-span-8 flex items-center pr-1">
                <PedigreeNode
                  data={tree.horse}
                  tier="subject"
                  onHover={setHoveredName}
                />
              </div>

              {/* Connector 1: Subject → Parents */}
              <div className="col-start-2 row-start-1 row-span-8">
                <TreeConnector splits={2} />
              </div>

              {/* Gen 1: Parents */}
              <div className="col-start-3 row-start-1 row-span-4 flex items-center px-1">
                <PedigreeNode
                  data={tree.sire}
                  tier="parent"
                  isLinebredDuplicate={isDuplicate(tree.sire.name)}
                  isHighlighted={isHighlighted(tree.sire.name)}
                  onHover={setHoveredName}
                />
              </div>
              <div className="col-start-3 row-start-5 row-span-4 flex items-center px-1">
                <PedigreeNode
                  data={tree.dam}
                  tier="parent"
                  isLinebredDuplicate={isDuplicate(tree.dam.name)}
                  isHighlighted={isHighlighted(tree.dam.name)}
                  onHover={setHoveredName}
                />
              </div>

              {/* Connector 2: Parents → Grandparents */}
              <div className="col-start-4 row-start-1 row-span-4">
                <TreeConnector splits={2} />
              </div>
              <div className="col-start-4 row-start-5 row-span-4">
                <TreeConnector splits={2} />
              </div>

              {/* Gen 2: Grandparents */}
              <div className="col-start-5 row-start-1 row-span-2 flex items-center px-1">
                <PedigreeNode
                  data={tree.sireSire}
                  tier="grand"
                  isLinebredDuplicate={isDuplicate(tree.sireSire.name)}
                  isHighlighted={isHighlighted(tree.sireSire.name)}
                  onHover={setHoveredName}
                />
              </div>
              <div className="col-start-5 row-start-3 row-span-2 flex items-center px-1">
                <PedigreeNode
                  data={tree.sireDam}
                  tier="grand"
                  isLinebredDuplicate={isDuplicate(tree.sireDam.name)}
                  isHighlighted={isHighlighted(tree.sireDam.name)}
                  onHover={setHoveredName}
                />
              </div>
              <div className="col-start-5 row-start-5 row-span-2 flex items-center px-1">
                <PedigreeNode
                  data={tree.damSire}
                  tier="grand"
                  isLinebredDuplicate={isDuplicate(tree.damSire.name)}
                  isHighlighted={isHighlighted(tree.damSire.name)}
                  onHover={setHoveredName}
                />
              </div>
              <div className="col-start-5 row-start-7 row-span-2 flex items-center px-1">
                <PedigreeNode
                  data={tree.damDam}
                  tier="grand"
                  isLinebredDuplicate={isDuplicate(tree.damDam.name)}
                  isHighlighted={isHighlighted(tree.damDam.name)}
                  onHover={setHoveredName}
                />
              </div>

              {/* Connector 3: Grandparents → Great-Grandparents */}
              <div className="col-start-6 row-start-1 row-span-2">
                <TreeConnector splits={2} />
              </div>
              <div className="col-start-6 row-start-3 row-span-2">
                <TreeConnector splits={2} />
              </div>
              <div className="col-start-6 row-start-5 row-span-2">
                <TreeConnector splits={2} />
              </div>
              <div className="col-start-6 row-start-7 row-span-2">
                <TreeConnector splits={2} />
              </div>

              {/* Gen 3: Great-Grandparents */}
              <div className="col-start-7 row-start-1 flex items-center pl-1">
                <PedigreeNode data={tree.sireSireSire} tier="great" isLinebredDuplicate={isDuplicate(tree.sireSireSire.name)} isHighlighted={isHighlighted(tree.sireSireSire.name)} onHover={setHoveredName} />
              </div>
              <div className="col-start-7 row-start-2 flex items-center pl-1">
                <PedigreeNode data={tree.sireSireDam} tier="great" isLinebredDuplicate={isDuplicate(tree.sireSireDam.name)} isHighlighted={isHighlighted(tree.sireSireDam.name)} onHover={setHoveredName} />
              </div>
              <div className="col-start-7 row-start-3 flex items-center pl-1">
                <PedigreeNode data={tree.sireDamSire} tier="great" isLinebredDuplicate={isDuplicate(tree.sireDamSire.name)} isHighlighted={isHighlighted(tree.sireDamSire.name)} onHover={setHoveredName} />
              </div>
              <div className="col-start-7 row-start-4 flex items-center pl-1">
                <PedigreeNode data={tree.sireDamDam} tier="great" isLinebredDuplicate={isDuplicate(tree.sireDamDam.name)} isHighlighted={isHighlighted(tree.sireDamDam.name)} onHover={setHoveredName} />
              </div>
              <div className="col-start-7 row-start-5 flex items-center pl-1">
                <PedigreeNode data={tree.damSireSire} tier="great" isLinebredDuplicate={isDuplicate(tree.damSireSire.name)} isHighlighted={isHighlighted(tree.damSireSire.name)} onHover={setHoveredName} />
              </div>
              <div className="col-start-7 row-start-6 flex items-center pl-1">
                <PedigreeNode data={tree.damSireDam} tier="great" isLinebredDuplicate={isDuplicate(tree.damSireDam.name)} isHighlighted={isHighlighted(tree.damSireDam.name)} onHover={setHoveredName} />
              </div>
              <div className="col-start-7 row-start-7 flex items-center pl-1">
                <PedigreeNode data={tree.damDamSire} tier="great" isLinebredDuplicate={isDuplicate(tree.damDamSire.name)} isHighlighted={isHighlighted(tree.damDamSire.name)} onHover={setHoveredName} />
              </div>
              <div className="col-start-7 row-start-8 flex items-center pl-1">
                <PedigreeNode data={tree.damDamDam} tier="great" isLinebredDuplicate={isDuplicate(tree.damDamDam.name)} isHighlighted={isHighlighted(tree.damDamDam.name)} onHover={setHoveredName} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Linebreeding alert — BOTTOM */}
      {linebredDuplicates.size > 0 && (
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-accent/5 border border-accent/20 rounded-lg px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shrink-0" />
          <span>
            Linebreeding detected: <strong className="text-accent font-medium">{linebredDuplicates.size} repeated ancestor{linebredDuplicates.size > 1 ? "s" : ""}</strong> in 4 generations. Hover over names to highlight matching lines.
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Full 4-Generation Pedigree Matrix Modal.
 */
function FullPedigreeModal({
  tree,
  breedingUrl,
  onClose,
}: {
  tree: ReturnType<typeof buildPedigreeTree>;
  breedingUrl: string | null | undefined;
  onClose: () => void;
}) {
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const linebredDuplicates = getLinebreedingDuplicates(tree);

  const isHighlighted = (name?: string) => {
    if (!name || !hoveredName) return false;
    return name.toLowerCase().trim() === hoveredName;
  };

  const isDuplicate = (name?: string) => {
    if (!name || name === "—") return false;
    return linebredDuplicates.has(name.toLowerCase().trim());
  };

  const GRID_COLS = "160px 32px 150px 32px 150px 32px 150px";

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-canvas/80 backdrop-blur-[6px] p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-surface-base border border-border rounded-2xl p-6 shadow-2xl">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-heading text-lg leading-none transition-colors"
          aria-label="Close"
        >
          ✕
        </button>

        <h4 className="text-xs uppercase tracking-wider font-mono text-muted-foreground mb-4">Full Pedigree (4 Generations)</h4>

        {linebredDuplicates.size > 0 && (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-accent/5 border border-accent/20 rounded-lg px-3 py-1.5 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shrink-0" />
            <span>
              Linebreeding detected: <strong className="text-accent font-medium">{linebredDuplicates.size} repeated ancestor{linebredDuplicates.size > 1 ? "s" : ""}</strong> in 4 generations. Hover over names to highlight matching lines.
            </span>
          </div>
        )}

        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-surface-alt">
          <div className="min-w-[760px] py-2">
            {/* Header row */}
            <div
              className="grid text-[10px] uppercase tracking-wider font-mono text-muted-foreground mb-2 px-1 text-center"
              style={{ gridTemplateColumns: GRID_COLS }}
            >
              <span>Subject</span>
              <span />
              <span>Parents</span>
              <span />
              <span>Grandparents</span>
              <span />
              <span>Great-Grandparents</span>
            </div>

            <div
              className="grid"
              style={{
                gridTemplateColumns: GRID_COLS,
                gridTemplateRows: "repeat(8, minmax(50px, 1fr))",
                rowGap: "6px",
              }}
            >
              {/* Gen 0: Subject */}
              <div className="col-start-1 row-start-1 row-span-8 flex items-center pr-1">
                <PedigreeNode data={tree.horse} tier="subject" onHover={setHoveredName} />
              </div>

              {/* Connector 1 */}
              <div className="col-start-2 row-start-1 row-span-8">
                <TreeConnector splits={2} />
              </div>

              {/* Gen 1: Parents */}
              <div className="col-start-3 row-start-1 row-span-4 flex items-center px-1">
                <PedigreeNode data={tree.sire} tier="parent" isLinebredDuplicate={isDuplicate(tree.sire.name)} isHighlighted={isHighlighted(tree.sire.name)} onHover={setHoveredName} />
              </div>
              <div className="col-start-3 row-start-5 row-span-4 flex items-center px-1">
                <PedigreeNode data={tree.dam} tier="parent" isLinebredDuplicate={isDuplicate(tree.dam.name)} isHighlighted={isHighlighted(tree.dam.name)} onHover={setHoveredName} />
              </div>

              {/* Connector 2 */}
              <div className="col-start-4 row-start-1 row-span-4"><TreeConnector splits={2} /></div>
              <div className="col-start-4 row-start-5 row-span-4"><TreeConnector splits={2} /></div>

              {/* Gen 2: Grandparents */}
              <div className="col-start-5 row-start-1 row-span-2 flex items-center px-1">
                <PedigreeNode data={tree.sireSire} tier="grand" isLinebredDuplicate={isDuplicate(tree.sireSire.name)} isHighlighted={isHighlighted(tree.sireSire.name)} onHover={setHoveredName} />
              </div>
              <div className="col-start-5 row-start-3 row-span-2 flex items-center px-1">
                <PedigreeNode data={tree.sireDam} tier="grand" isLinebredDuplicate={isDuplicate(tree.sireDam.name)} isHighlighted={isHighlighted(tree.sireDam.name)} onHover={setHoveredName} />
              </div>
              <div className="col-start-5 row-start-5 row-span-2 flex items-center px-1">
                <PedigreeNode data={tree.damSire} tier="grand" isLinebredDuplicate={isDuplicate(tree.damSire.name)} isHighlighted={isHighlighted(tree.damSire.name)} onHover={setHoveredName} />
              </div>
              <div className="col-start-5 row-start-7 row-span-2 flex items-center px-1">
                <PedigreeNode data={tree.damDam} tier="grand" isLinebredDuplicate={isDuplicate(tree.damDam.name)} isHighlighted={isHighlighted(tree.damDam.name)} onHover={setHoveredName} />
              </div>

              {/* Connector 3 */}
              <div className="col-start-6 row-start-1 row-span-2"><TreeConnector splits={2} /></div>
              <div className="col-start-6 row-start-3 row-span-2"><TreeConnector splits={2} /></div>
              <div className="col-start-6 row-start-5 row-span-2"><TreeConnector splits={2} /></div>
              <div className="col-start-6 row-start-7 row-span-2"><TreeConnector splits={2} /></div>

              {/* Gen 3: Great-Grandparents */}
              <div className="col-start-7 row-start-1 flex items-center pl-1">
                <PedigreeNode data={tree.sireSireSire} tier="great" isLinebredDuplicate={isDuplicate(tree.sireSireSire.name)} isHighlighted={isHighlighted(tree.sireSireSire.name)} onHover={setHoveredName} />
              </div>
              <div className="col-start-7 row-start-2 flex items-center pl-1">
                <PedigreeNode data={tree.sireSireDam} tier="great" isLinebredDuplicate={isDuplicate(tree.sireSireDam.name)} isHighlighted={isHighlighted(tree.sireSireDam.name)} onHover={setHoveredName} />
              </div>
              <div className="col-start-7 row-start-3 flex items-center pl-1">
                <PedigreeNode data={tree.sireDamSire} tier="great" isLinebredDuplicate={isDuplicate(tree.sireDamSire.name)} isHighlighted={isHighlighted(tree.sireDamSire.name)} onHover={setHoveredName} />
              </div>
              <div className="col-start-7 row-start-4 flex items-center pl-1">
                <PedigreeNode data={tree.sireDamDam} tier="great" isLinebredDuplicate={isDuplicate(tree.sireDamDam.name)} isHighlighted={isHighlighted(tree.sireDamDam.name)} onHover={setHoveredName} />
              </div>
              <div className="col-start-7 row-start-5 flex items-center pl-1">
                <PedigreeNode data={tree.damSireSire} tier="great" isLinebredDuplicate={isDuplicate(tree.damSireSire.name)} isHighlighted={isHighlighted(tree.damSireSire.name)} onHover={setHoveredName} />
              </div>
              <div className="col-start-7 row-start-6 flex items-center pl-1">
                <PedigreeNode data={tree.damSireDam} tier="great" isLinebredDuplicate={isDuplicate(tree.damSireDam.name)} isHighlighted={isHighlighted(tree.damSireDam.name)} onHover={setHoveredName} />
              </div>
              <div className="col-start-7 row-start-7 flex items-center pl-1">
                <PedigreeNode data={tree.damDamSire} tier="great" isLinebredDuplicate={isDuplicate(tree.damDamSire.name)} isHighlighted={isHighlighted(tree.damDamSire.name)} onHover={setHoveredName} />
              </div>
              <div className="col-start-7 row-start-8 flex items-center pl-1">
                <PedigreeNode data={tree.damDamDam} tier="great" isLinebredDuplicate={isDuplicate(tree.damDamDam.name)} isHighlighted={isHighlighted(tree.damDamDam.name)} onHover={setHoveredName} />
              </div>
            </div>
          </div>
        </div>

        {/* Modal footer — link to loveracing.nz */}
        {breedingUrl && (
          <div className="mt-4 pt-3 border-t border-border flex justify-end">
            <a
              href={breedingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-hover hover:underline font-mono text-[10.5px] uppercase tracking-wider transition-colors"
            >
              Full Breeding Record ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export function PedigreeTable({
  horseName,
  sireName,
  damName,
  damSireName,
  sex,
  colour,
  age,
  foalingDate,
  breedingUrl,
  pedigreeData,
}: PedigreeTableProps) {
  const formattedFoalingDate = formatFoalingDate(foalingDate);
  const [view, setView] = useState<"tree" | "dam-line" | "sire-line">("tree");
  const [showFullPedigree, setShowFullPedigree] = useState(false);

  const damLine = (pedigreeData?.dam_line || []).slice(0, 8);
  const sireLine = (pedigreeData?.sire_line || []).slice(0, 8);
  const hasFullPedigree = damLine.length > 0 || sireLine.length > 0;

  const tree = buildPedigreeTree(
    sireName,
    damName,
    horseName,
    sireLine as unknown as Parameters<typeof buildPedigreeTree>[3],
    damLine as unknown as Parameters<typeof buildPedigreeTree>[4],
    pedigreeData?.cross_line,
  );

  const horseLabel = `${colour} ${sex}${age ? `, ${age}yo` : ""}`;
  const damLineUrl = breedingUrl ? `${breedingUrl}#bm-dam` : undefined;
  const sireLineUrl = breedingUrl ? `${breedingUrl}#bm-sire` : undefined;

  return (
    <div className="space-y-5">
      {/* Top Bar: Broodmare Sire Card & View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {damSireName ? (
          <div className="inline-flex items-center gap-2.5 text-xs text-foreground bg-raised border border-border rounded-lg px-3.5 py-2">
            <span className="text-accent font-semibold uppercase text-[9.5px] tracking-wider px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
              Broodmare Sire
            </span>
            <span className="text-heading font-medium text-sm">{damSireName}</span>
          </div>
        ) : <div />}

        {hasFullPedigree && (
          <div className="flex gap-1.5 bg-surface-base p-1 border border-border rounded-lg">
            {(["tree", "dam-line", "sire-line"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`text-[10px] uppercase tracking-widest font-mono px-3 py-1.5 rounded-md transition-all ${
                  view === v
                    ? "border border-accent/30 text-accent bg-accent/10 font-medium"
                    : "text-muted-foreground hover:text-frost hover:bg-raised"
                }`}
              >
                {v === "tree" ? "Pedigree Matrix" : v.replace("-", " ")}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Pedigree Tree View */}
      {view === "tree" && (
        <PedigreeChart
          tree={tree}
          sex={sex}
          colour={colour}
          age={age}
          formattedFoalingDate={formattedFoalingDate}
          onShowFullPedigree={() => setShowFullPedigree(true)}
        />
      )}

      {/* Full 4-Gen Pedigree Modal */}
      {showFullPedigree && (
        <FullPedigreeModal
          tree={tree}
          breedingUrl={breedingUrl}
          onClose={() => setShowFullPedigree(false)}
        />
      )}

      {/* Dam Line View */}
      {view === "dam-line" && hasFullPedigree && damLine.length > 0 && (
        <div className="border border-border bg-surface-base backdrop-blur-xl rounded-xl p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <h5 className="text-xs uppercase tracking-wider font-mono text-muted-foreground">Dam Line (Tail Female Timeline)</h5>
            {damLineUrl && (
              <a
                href={damLineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-accent hover:underline uppercase tracking-widest font-mono transition-colors"
              >
                Full Dam Line ↗
              </a>
            )}
          </div>
          <div className="space-y-1">
            {damLine.map((entry, i) => {
              const mareName = entry.name || "—";
              const sireName = entry.partner?.name || "—";
              const meta = [entry.country, entry.year].filter(Boolean).join(" ").trim() || undefined;
              const sireMeta = [entry.partner?.country, entry.partner?.year].filter(Boolean).join(" ").trim() || undefined;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 text-xs font-light py-2.5 px-3 rounded-lg hover:bg-raised/50 transition-colors ${
                    i < damLine.length - 1 ? "border-b border-border/40" : ""
                  }`}
                >
                  <span className="text-muted-steel font-mono w-6 text-right font-medium">{String(i + 1).padStart(2, "0")}.</span>
                  <span className="text-rose-300 font-medium truncate">{mareName}</span>
                  {meta && <span className="text-muted-steel text-[10px] font-mono whitespace-nowrap">[{meta}]</span>}
                  <span className="text-muted-foreground text-[10px] italic">by</span>
                  <span className="text-accent font-medium truncate">{sireName}</span>
                  {sireMeta && <span className="text-muted-steel text-[10px] font-mono whitespace-nowrap">[{sireMeta}]</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sire Line View */}
      {view === "sire-line" && hasFullPedigree && sireLine.length > 0 && (
        <div className="border border-border bg-surface-base backdrop-blur-xl rounded-xl p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <h5 className="text-xs uppercase tracking-wider font-mono text-muted-foreground">Sire Line (Paternal Stallion Line)</h5>
            {sireLineUrl && (
              <a
                href={sireLineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-accent hover:underline uppercase tracking-widest font-mono transition-colors"
              >
                Full Sire Line ↗
              </a>
            )}
          </div>
          <div className="space-y-1">
            {sireLine.map((entry, i) => {
              const sireName = entry.name || "—";
              const damName = entry.partner?.name || "—";
              const meta = [entry.country, entry.year].filter(Boolean).join(" ").trim() || undefined;
              const damMeta = [entry.partner?.country, entry.partner?.year].filter(Boolean).join(" ").trim() || undefined;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 text-xs font-light py-2.5 px-3 rounded-lg hover:bg-raised/50 transition-colors ${
                    i < sireLine.length - 1 ? "border-b border-border/40" : ""
                  }`}
                >
                  <span className="text-muted-steel font-mono w-6 text-right font-medium">{String(i + 1).padStart(2, "0")}.</span>
                  <span className="text-accent font-medium truncate">{sireName}</span>
                  {meta && <span className="text-muted-steel text-[10px] font-mono whitespace-nowrap">[{meta}]</span>}
                  <span className="text-muted-foreground text-[10px] italic">from</span>
                  <span className="text-rose-300 font-medium truncate">{damName}</span>
                  {damMeta && <span className="text-muted-steel text-[10px] font-mono whitespace-nowrap">[{damMeta}]</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
