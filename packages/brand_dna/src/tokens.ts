/**
 * Canonical Design Tokens for Evolution Stables (@evo/brand_dna)
 * Source of Truth: /evo_00/doc/DESIGN_SYSTEM_AND_TOKENS.md
 */

export const BRAND_COLORS = {
  // Evolution Brand Accent (3-5% visual weight rule)
  gold: {
    DEFAULT: '#d4a964', // Evolution Champagne Gold (OG Hex SSOT)
    hover: '#c39853',
    foreground: 'hsl(210 0% 98%)',
  },
  // Dark elevation hierarchy (locked in evo_00 DESIGN_SYSTEM_AND_TOKENS.md)
  elevation: {
    base: 'hsl(0 0% 4%)',       // #0a0a0a - Main viewport canvas
    l1: 'hsl(0 0% 7%)',         // #121212 - Sidebar & secondary panels
    l2: 'hsl(0 0% 10%)',        // #1a1a1a - Cards & content modules
    l3: 'hsl(0 0% 13%)',        // #212121 - Inset containers & hovers
    l4: 'hsl(0 0% 15%)',        // #262626 - Active tabs & selected items
    codeblock: 'hsl(0 0% 7%)',  // #121212 - Code & formula blocks
  },
  // Borders & Dividers
  border: {
    muted: 'hsl(0 0% 19%)',     // #303030 - Subtle structural hairline borders
    subtle: 'hsl(216 4% 22%)',  // #36393e - Card & panel dividers
    bold: 'hsl(222 19% 86%)',   // High-contrast focus borders
  },
  // Typography & Foreground
  foreground: {
    DEFAULT: 'hsl(210 40% 98%)', // #f8fafc - Primary ultra-crisp text
    muted: 'hsl(0 0% 60%)',      // #999999 - Subtitles & metadata
    subtle: 'hsl(216 4% 51%)',   // Secondary muted text
  },
  // Status Indicators (Racing / Settlements / Spelling)
  status: {
    active: '#10b981',   // Emerald green (Racing / Settled)
    pending: '#f59e0b',  // Amber (Funding / Carry-Forward)
    closed: '#64748b',   // Slate (Spelling / Closed)
  },
} as const;

export const BRAND_RADII = {
  sm: '0.125rem', // 2px
  md: '0.375rem', // 6px
  lg: '0.5rem',   // 8px
  xl: '0.75rem',  // 12px
  pill: '9999px',
} as const;

export const BRAND_FONTS = {
  sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
} as const;

export const BRAND_RULES = {
  GOLD_MAX_VIEWPORT_PERCENTAGE: 0.05,
  GOLD_MIN_VIEWPORT_PERCENTAGE: 0.03,
  IS_DARK_THEME_ONLY: true,
} as const;
