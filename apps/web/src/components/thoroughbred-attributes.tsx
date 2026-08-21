import { Sparkles, CheckCircle2 } from 'lucide-react';

interface DynamicHighlightPillsProps {
  tags?: string[];
  highlights?: string[];
  title?: string;
  // Legacy compatibility props
  attributes?: Record<string, string>;
  horseName?: string;
}

export function DynamicHighlightPills({
  tags,
  highlights,
  title = 'Campaign & Bloodstock Highlights',
  attributes,
}: DynamicHighlightPillsProps) {
  const displayTags = tags || (attributes ? Object.values(attributes) : []);
  const displayHighlights = highlights || [];

  if ((!displayTags || displayTags.length === 0) && displayHighlights.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4a964]">
            Bloodstock Profile
          </span>
          <h3 className="text-xl font-medium tracking-tight text-foreground mt-0.5">
            {title}
          </h3>
        </div>
        <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-[#d4a964]" />
          <span>{displayHighlights.length || displayTags.length} Highlights</span>
        </span>
      </div>

      {/* Natural Bullet Points */}
      {displayHighlights.length > 0 && (
        <div className="space-y-3">
          {displayHighlights.map((hl, idx) => {
            const [boldPrefix, ...rest] = hl.includes(': ') ? hl.split(': ') : ['', hl];
            return (
              <div key={idx} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#d4a964]/10 text-[#d4a964]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d4a964]" />
                </div>
                <div>
                  {boldPrefix ? (
                    <strong className="text-foreground font-medium mr-1.5">{boldPrefix}:</strong>
                  ) : null}
                  <span>{rest.join(': ')}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Compact Tag Pills */}
      {displayTags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
          {displayTags.map((tag) => (
            <div
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-mono text-foreground hover:border-[#d4a964]/50 transition-colors"
            >
              <span className="h-1 w-1 rounded-full bg-[#d4a964]" />
              <span>{tag}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Re-export as ThoroughbredAttributes for backward compatibility
export const ThoroughbredAttributes = DynamicHighlightPills;
