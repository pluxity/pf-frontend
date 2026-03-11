import type { ModelTier } from "@/babylon/types";

interface TierBadgeProps {
  tier: ModelTier;
}

const TIER_CONFIG: Record<ModelTier, { label: string; description: string; color: string }> = {
  0: {
    label: "Tier 0",
    description: "Raw GLB",
    color: "bg-neutral-600",
  },
  1: {
    label: "Tier 1",
    description: "PF Naming",
    color: "bg-blue-600",
  },
  2: {
    label: "Tier 2",
    description: "Full Meta",
    color: "bg-emerald-600",
  },
};

export function TierBadge({ tier }: TierBadgeProps) {
  const config = TIER_CONFIG[tier];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${config.color}`}
      title={config.description}
    >
      {config.label}
      <span className="hidden text-white/70 sm:inline">- {config.description}</span>
    </span>
  );
}
