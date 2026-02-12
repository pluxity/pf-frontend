import BuildingIcon from "@/assets/icons/building.svg";

interface StatItemProps {
  count: number;
  label: string;
  variant: "total" | "normal" | "warning" | "danger";
}

const variantStyles = {
  total: {
    bg: "bg-white",
    label: "text-neutral-700",
  },
  normal: {
    bg: "bg-white",
    label: "text-emerald-500",
  },
  warning: {
    bg: "bg-white",
    label: "text-amber-500",
  },
  danger: {
    bg: "bg-red-50",
    label: "text-red-500",
  },
};

function StatItem({ count, label, variant }: StatItemProps) {
  const styles = variantStyles[variant];
  const isTotal = variant === "total";

  return (
    <div
      className={`flex flex-col justify-between rounded-xl px-5 py-4 ${styles.bg} ${
        isTotal ? "h-[9.6875rem] w-[9.375rem]" : "h-[7.1875rem] w-[8.75rem]"
      }`}
    >
      <span className="text-4xl font-bold text-gray-700">{count}</span>
      <div>
        {isTotal && <img src={BuildingIcon} alt="" className="size-7" />}
        <span className={`text-xl font-medium ${styles.label}`}>{label}</span>
      </div>
    </div>
  );
}

interface SiteStatisticsProps {
  totalSites: number;
  normalSites: number;
  warningSites: number;
  dangerSites: number;
}

export function SiteStatistics({
  totalSites,
  normalSites,
  warningSites,
  dangerSites,
}: SiteStatisticsProps) {
  return (
    <div className="flex gap-2">
      <StatItem count={totalSites} label="전국" variant="total" />
      <StatItem count={normalSites} label="정상" variant="normal" />
      <StatItem count={warningSites} label="주의" variant="warning" />
      <StatItem count={dangerSites} label="위험" variant="danger" />
    </div>
  );
}
