import { useEffect, useState } from "react";
import { safetyService } from "@/services";
import type { SafetyItem } from "@/services/types/safety.types";
import { createDefaultSafetyData } from "@/services/types/safety.types";

interface SafetyStatusProps {
  siteId?: number | null;
}

const POSITIVE_KEYS = new Set(["WORKER_ATTENDANCE"]);

const shimmerStyle = {
  background: "linear-gradient(90deg, #E8EAF0 25%, #F5F6FA 50%, #E8EAF0 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s ease-in-out infinite",
} as const;

function getBarColor(item: SafetyItem): string {
  if (POSITIVE_KEYS.has(item.key)) return "#00C48C";
  if (item.count === 0) return "#00C48C";
  if (item.count <= 3) return "#FFA26B";
  return "#DE4545";
}

function SafetyChartSkeleton({ name }: { name: string }) {
  return (
    <div className="relative flex flex-col items-center gap-2">
      <div className="relative w-8 h-50 rounded-full overflow-hidden" style={shimmerStyle} />
      <div className="text-xs text-gray-400 text-center font-bold leading-tight max-w-[4.5rem]">
        {name}
      </div>
    </div>
  );
}

function SafetyChart({ data }: { data: SafetyItem }) {
  const isPositive = POSITIVE_KEYS.has(data.key);
  const maxCount = isPositive ? 100 : 20;
  const percentage = Math.min((data.count / maxCount) * 100, 100);
  const barColor = getBarColor(data);

  return (
    <div className="relative flex flex-col items-center gap-2">
      <div className="relative w-8 h-50 rounded-full overflow-hidden bg-[#E8EAF0]">
        <div
          className={`absolute top-3 left-1/2 -translate-x-1/2 text-xs z-10 font-semibold ${
            percentage >= 80 ? "text-white" : "text-gray-600"
          }`}
        >
          {data.count}
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-500"
          style={{
            height: `${Math.max(percentage, 3)}%`,
            backgroundColor: barColor,
            boxShadow: `0 0 8px ${barColor}60`,
          }}
          role="progressbar"
          aria-valuenow={data.count}
          aria-valuemin={0}
          aria-valuemax={maxCount}
        />
      </div>
      <div className="text-xs text-gray-700 text-center font-bold leading-tight max-w-[4.5rem]">
        {data.name}
      </div>
    </div>
  );
}

const DEFAULT_ITEMS = createDefaultSafetyData();

function useSafetyData(siteId: number | null | undefined) {
  const [state, setState] = useState<{ data: SafetyItem[]; loading: boolean }>({
    data: DEFAULT_ITEMS,
    loading: true,
  });

  useEffect(() => {
    if (siteId == null) return;

    let stale = false;
    safetyService.getSafetyData(siteId).then((data) => {
      if (!stale) setState({ data, loading: false });
    });
    return () => {
      stale = true;
    };
  }, [siteId]);

  return state;
}

export function SafetyStatus({ siteId }: SafetyStatusProps) {
  const { data: safetyData, loading: isLoading } = useSafetyData(siteId);

  return (
    <>
      {/* shimmer keyframes */}
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div className="text-neutral-300 font-semibold text-sm mb-5">안전 모니터링</div>
      <div className="flex items-start justify-evenly">
        {isLoading
          ? DEFAULT_ITEMS.map((item) => <SafetyChartSkeleton key={item.key} name={item.name} />)
          : safetyData.map((item) => <SafetyChart key={item.key} data={item} />)}
      </div>
    </>
  );
}
