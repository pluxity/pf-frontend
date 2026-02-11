import { useEffect, useState } from "react";
import { safetyService, SafetyItem } from "@/services";

function SafetyChart({ data }: { data: SafetyItem }) {
  return (
    <div className="relative flex flex-col items-center gap-2">
      <div className="relative w-8 h-50 rounded-full overflow-hidden bg-primary-100">
        <div
          className={`absolute top-3 left-1/2 -translate-x-1/2 text-xs z-10 font-semibold ${data.value >= 90 ? "text-white" : "text-gray-600"}`}
        >
          {data.value}%
        </div>

        {/* Progress 바 */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-primary-500 rounded-full transition-all"
          style={{ height: `${data.value}%` }}
          role="progressbar"
          aria-valuenow={data.value}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div className="text-xs text-gray-700 text-center font-bold">{data.name}</div>
    </div>
  );
}

export function SafetyStatus() {
  const [safetyData, setSafetyData] = useState<SafetyItem[]>([]);

  useEffect(() => {
    safetyService.getSafetyData().then(setSafetyData);
  }, []);

  return (
    <>
      <div className="text-neutral-300 font-semibold text-sm mb-5">안전 모니터링</div>
      <div className="flex items-center justify-evenly">
        {safetyData.map((item) => (
          <SafetyChart key={item.name} data={item} />
        ))}
      </div>
    </>
  );
}
