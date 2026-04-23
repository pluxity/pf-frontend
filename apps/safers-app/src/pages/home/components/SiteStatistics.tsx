import BuildingIcon from "@/assets/icons/building.svg";
import { useSitesStore, selectStatusFilter, type StatusFilter } from "@/stores";

interface StatItemProps {
  count: number;
  label: string;
  variant: "total" | "normal" | "warning" | "danger";
  active?: boolean;
  onClick?: () => void;
}

const variantStyles = {
  total: {
    bg: "bg-white",
    activeBg: "bg-blue-50",
    label: "text-neutral-700",
    ring: "ring-2 ring-primary-500",
  },
  normal: {
    bg: "bg-white",
    activeBg: "bg-emerald-50",
    label: "text-emerald-500",
    ring: "ring-2 ring-emerald-400",
  },
  warning: {
    bg: "bg-white",
    activeBg: "bg-amber-50",
    label: "text-amber-500",
    ring: "ring-2 ring-amber-400",
  },
  danger: {
    bg: "bg-red-50",
    activeBg: "bg-red-100",
    label: "text-red-500",
    ring: "ring-2 ring-red-400",
  },
};

function StatItem({ count, label, variant, active, onClick }: StatItemProps) {
  const styles = variantStyles[variant];
  const isTotal = variant === "total";
  const bg = active ? styles.activeBg : styles.bg;
  const ring = active ? styles.ring : "";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col justify-between rounded-xl px-5 py-4 text-left transition-all duration-200 cursor-pointer hover:scale-105 ${bg} ${ring} ${
        isTotal ? "h-[9.6875rem] w-[9.375rem]" : "h-[7.1875rem] w-[8.75rem]"
      }`}
    >
      <span className="text-4xl font-bold text-gray-700">{count}</span>
      <div>
        {isTotal && <img src={BuildingIcon} alt="" className="size-7" />}
        <span className={`text-xl font-medium ${styles.label}`}>{label}</span>
      </div>
    </button>
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
  const statusFilter = useSitesStore(selectStatusFilter);
  const setFilter = useSitesStore((s) => s.setStatusFilter);

  const handleClick = (filter: StatusFilter) => () => setFilter(filter);

  return (
    <div className="flex gap-2">
      <StatItem
        count={totalSites}
        label="전체"
        variant="total"
        active={statusFilter === null}
        onClick={() => setFilter(null)}
      />
      <StatItem
        count={normalSites}
        label="정상"
        variant="normal"
        active={statusFilter === "normal"}
        onClick={handleClick("normal")}
      />
      <StatItem
        count={warningSites}
        label="주의"
        variant="warning"
        active={statusFilter === "warning"}
        onClick={handleClick("warning")}
      />
      <StatItem
        count={dangerSites}
        label="위험"
        variant="danger"
        active={statusFilter === "danger"}
        onClick={handleClick("danger")}
      />
    </div>
  );
}
