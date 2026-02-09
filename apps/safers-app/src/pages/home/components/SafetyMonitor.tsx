import { useEffect, useState } from "react";
import { BarChart, Bar, ResponsiveContainer } from "recharts";
import { safetyService, SafetyItem } from "@/services";

const SAFETY_VALUE_COLOR = "#0066ff";

function SafetyChart({ data }: { data: SafetyItem }) {
  const chartData = [
    {
      name: data.name,
      empty: 100 - data.value,
      value: data.value,
    },
  ];

  return (
    <div className="relative flex flex-col items-center gap-2">
      {/* 차트 컨테이너 */}
      <div className="w-9 h-50 rounded-full overflow-hidden relative">
        {/* 백분율 텍스트 */}
        <div
          className={`absolute top-3 left-1/2 -translate-x-1/2 text-xs z-10 ${data.value >= 90 ? "text-white" : "text-gray-600"}`}
        >
          {data.value}%
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Bar
              dataKey="value"
              stackId="a"
              fill={SAFETY_VALUE_COLOR}
              isAnimationActive={false}
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="empty"
              stackId="a"
              fill="#dae4f4"
              isAnimationActive={false}
              radius={[0, 0, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 라벨 */}
      <div className="text-xs text-gray-700 text-center font-bold">{data.name}</div>
    </div>
  );
}

export function SafetyMonitor() {
  const [safetyData, setSafetyData] = useState<SafetyItem[]>([]);

  useEffect(() => {
    safetyService.getSafetyData().then(setSafetyData);
  }, []);

  return (
    <>
      <div className="text-[#B5BBD3] font-semibold text-sm mb-5">안전 모니터링</div>
      <div className="flex items-center justify-evenly">
        {safetyData.map((item) => (
          <SafetyChart key={item.name} data={item} />
        ))}
      </div>
    </>
  );
}
