/**
 * First-class 6-state campaign lifecycle.
 *
 * Internal keys are canonical. Legacy UI / sheet strings are normalized in.
 */

export type CampaignStatus =
  | "draft"
  | "coming_soon"
  | "coming_soon_details"
  | "listed"
  | "fully_subscribed"
  | "completed";

/** @deprecated UI aliases — prefer CampaignStatus. Kept for migration greps. */
export type CampaignStatusLegacy =
  | "coming-soon"
  | "coming-soon-with-details"
  | "become-an-owner"
  | "fully-subscribed"
  | "term-completed";

export interface StatusInfo {
  label: string;
  badgeClass: string;
  dotClass: string;
  canPurchase: boolean;
  showPrice: boolean;
}

export type CampaignStatusInput = {
  /** First-class field when present (sheet / live ops / static). */
  campaign_status?: string | null;
  listing_status?: string;
  shares_total?: number | string;
  shares_sold?: number | string;
  has_terms_sheet?: boolean;
  /** boolean or sheet string ("true"/"false"/"yes"/"no"/"0"/"1"). */
  marketplace_visible?: boolean | string | null;
};

/** True only when explicitly false/no/0/off. Undefined = not forced hidden. */
export function isMarketplaceHidden(
  value: boolean | string | null | undefined
): boolean {
  if (value === false) return true;
  if (value == null || value === "") return false;
  if (typeof value === "boolean") return !value;
  const s = String(value).trim().toLowerCase();
  return s === "false" || s === "no" || s === "0" || s === "off" || s === "hidden";
}

const CANONICAL = new Set<CampaignStatus>([
  "draft",
  "coming_soon",
  "coming_soon_details",
  "listed",
  "fully_subscribed",
  "completed",
]);

/**
 * Normalize sheet values, old UI keys, and synonyms → canonical CampaignStatus.
 * Returns null if unknown / empty.
 */
export function normalizeCampaignStatus(
  raw: string | null | undefined
): CampaignStatus | null {
  if (raw == null) return null;
  const s = String(raw).trim().toLowerCase().replace(/[\s]+/g, "_");
  if (!s) return null;

  // Already canonical (underscored)
  if (CANONICAL.has(s as CampaignStatus)) return s as CampaignStatus;

  // Hyphenated / legacy UI / sheet synonyms
  const hyphen = s.replace(/_/g, "-");
  switch (hyphen) {
    case "draft":
      return "draft";
    case "coming-soon":
      return "coming_soon";
    case "coming-soon-details":
    case "coming-soon-with-details":
      return "coming_soon_details";
    case "listed":
    case "become-an-owner":
    case "active": // if used as campaign_status
      return "listed";
    case "fully-subscribed":
    case "sold-out":
      return "fully_subscribed";
    case "completed":
    case "term-completed":
    case "retired":
      return "completed";
    default:
      return null;
  }
}

/**
 * Resolve campaign lifecycle status.
 * Prefer first-class `campaign_status` when present; else infer (backward compat).
 */
export function getCampaignStatus(hlt: CampaignStatusInput): CampaignStatus {
  const fromField = normalizeCampaignStatus(hlt.campaign_status ?? undefined);
  if (fromField) return fromField;

  const sharesTotal = Number(hlt.shares_total || 0);
  const sharesSold = Number(hlt.shares_sold || 0);
  const listing = String(hlt.listing_status || "")
    .trim()
    .toLowerCase();

  // Fallback inference (order matters)
  if (listing === "retired") return "completed";
  if (sharesSold >= sharesTotal && sharesTotal > 0) return "fully_subscribed";
  if (listing === "active" && sharesSold < sharesTotal) return "listed";

  // Not on website
  if (isMarketplaceHidden(hlt.marketplace_visible)) return "draft";

  // Coming soon split
  return hlt.has_terms_sheet ? "coming_soon_details" : "coming_soon";
}

/** Website-visible (not draft). */
export function isOnWebsite(status: CampaignStatus): boolean {
  return status !== "draft";
}

/** Purchasable lifecycle state (stock/price/kill-switch checked separately). */
export function canPurchase(status: CampaignStatus): boolean {
  return status === "listed";
}

export const STATUS_INFO: Record<CampaignStatus, StatusInfo> = {
  draft: {
    label: "Draft",
    badgeClass: "bg-zinc-900/60 border-zinc-100/20 text-zinc-400",
    dotClass: "bg-zinc-500",
    canPurchase: false,
    showPrice: false,
  },
  coming_soon: {
    label: "Coming Soon",
    badgeClass: "bg-emerald-500/15 border-emerald-400/30 text-emerald-200",
    dotClass: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
    canPurchase: false,
    showPrice: false,
  },
  coming_soon_details: {
    label: "Coming Soon",
    badgeClass: "bg-emerald-500/15 border-emerald-400/30 text-emerald-200",
    dotClass: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
    canPurchase: false,
    showPrice: true,
  },
  listed: {
    label: "Become An Owner",
    badgeClass: "bg-emerald-500/15 border-emerald-400/30 text-emerald-200",
    dotClass: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
    canPurchase: true,
    showPrice: true,
  },
  fully_subscribed: {
    label: "Fully Subscribed",
    badgeClass: "bg-zinc-900/60 border-zinc-100/40 text-zinc-100",
    dotClass: "bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]",
    canPurchase: false,
    showPrice: false,
  },
  completed: {
    label: "Completed",
    badgeClass: "bg-blue-600/20 border-blue-400/40 text-blue-200",
    dotClass: "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]",
    canPurchase: false,
    showPrice: false,
  },
};
