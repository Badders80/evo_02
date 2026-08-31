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

export function CampaignStatusBadge({
  status,
  className,
}: {
  status: CampaignStatus;
  className?: string;
}) {
  const config = statusConfig[status] ?? statusConfig.draft;
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}