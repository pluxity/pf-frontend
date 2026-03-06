import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import type { PersonnelByOccupation } from "@/services";

interface PersonnelChartProps {
  data: PersonnelByOccupation[];
  total: number;
}

export function PersonnelChart({ data, total }: PersonnelChartProps) {
  return (
    <div className="flex h-full flex-col">
      <h3 className="px-1 text-sm font-semibold text-neutral-700">인원 현황</h3>

      <div className="flex min-h-0 flex-1 items-center gap-4 pt-2">
        {/* 도넛 차트 */}
        <div className="relative h-full w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="occupation"
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="85%"
                paddingAngle={2}
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* 중앙 총 인원 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-neutral-400">총 인원</span>
            <span className="text-lg font-bold text-neutral-800">{total}</span>
          </div>
        </div>

        {/* 범례 */}
        <div className="flex w-1/2 flex-col gap-1.5">
          {data.map((item) => (
            <div key={item.occupation} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-neutral-600">{item.occupation}</span>
              </div>
              <span className="font-medium text-neutral-800">{item.count}명</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
