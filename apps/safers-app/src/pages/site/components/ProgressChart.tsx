import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@pf-dev/ui";
import type { ProgressDataPoint, ProgressPeriod } from "@/services";

const PERIOD_TABS: { value: ProgressPeriod; label: string }[] = [
  { value: "daily", label: "일" },
  { value: "weekly", label: "주" },
  { value: "monthly", label: "월" },
];

interface ProgressChartProps {
  data: Record<ProgressPeriod, ProgressDataPoint[]>;
}

export function ProgressChart({ data }: ProgressChartProps) {
  const [period, setPeriod] = useState<ProgressPeriod>("daily");
  const chartData = data[period];

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 + 탭 */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-neutral-700">기성률</h3>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as ProgressPeriod)}>
          <TabsList variant="filled" className="border-none">
            {PERIOD_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                variant="filled"
                className="px-3 py-1 text-xs text-neutral-400 data-[state=active]:bg-neutral-100 data-[state=active]:text-neutral-900"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* 차트 */}
      <div className="min-h-0 flex-1 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradPlan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4D7EFF" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#4D7EFF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00C48C" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#00C48C" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#999" />
            <YAxis
              tick={{ fontSize: 11 }}
              stroke="#999"
              domain={[0, 100]}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              formatter={(value) => [`${value}%`]}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area
              type="monotone"
              dataKey="plan"
              name="계획"
              stroke="#4D7EFF"
              fill="url(#gradPlan)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="actual"
              name="실적"
              stroke="#00C48C"
              fill="url(#gradActual)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
