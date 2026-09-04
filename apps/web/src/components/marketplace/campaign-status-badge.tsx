import { Badge } from "@/components/ui/badge";
import { type CampaignStatus } from "@/lib/campaign-status";

const statusConfig: Record<
  CampaignStatus,
  { variant: "default" | "accent" | "success" | "outline" | "warning"; label: string }
> = {
  draft: { variant: "outline", label: "Draft" },
  coming_soon: { variant: "success", label: "Coming Soon" },
  coming_soon_details: { variant: "success", label: "Coming Soon" },
  listed: { variant: "success", label: "Become An Owner" },
  fully_subscribed: { variant: "warning", label: "Fully Subscribed" },
  completed: { variant: "warning", label: "Completed" },
};

// F18: per canonical style guide, all status pills should use the status-active token
// (the right-rail statusChip), not the brighter success token. Override the rendered
// classes per variant so marketplace hero badge matches right-rail status chip styling.
const variantClassOverride: Record<string, string> = {
  success: "border-status-active/40 bg-status-active/10 text-status-active",
  warning: "border-status-pending/40 bg-status-pending/10 text-status-pending",
};

export function CampaignStatusBadge({
  status,
  className,
}: {
  status: CampaignStatus;
  className?: string;
}) {
  const config = statusConfig[status] ?? statusConfig.draft;
  const variantClass = variantClassOverride[config.variant] ?? "";
  return (
    <Badge variant={config.variant} className={`${variantClass} ${className ?? ""}`.trim()}>
      {config.label}
    </Badge>
  );
}