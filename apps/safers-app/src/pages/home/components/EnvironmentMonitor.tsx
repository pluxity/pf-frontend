import { RadialBarChart, RadialBar } from "recharts";
import type { Environment } from "../../../services/types/environments.types";
import { mockEnvironments } from "../../../services/mocks/environments.mock";

export function EnvironmentChart({ data }: { data: Environment }) {
  const endAngle = 90 + (data.percentage / 100) * 360;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* 회색 배경 - 전체 범위 */}
        <RadialBarChart
          width={130}
          height={130}
          cx={65}
          cy={65}
          innerRadius="60%"
          outerRadius="90%"
          barSize={10}
          data={[{ name: data.name, value: 100, fill: "#dae4f4" }]}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar dataKey="value" cornerRadius={10} />
        </RadialBarChart>

        {/* 색상 bar - percentage에 따라 */}
        <RadialBarChart
          width={128}
          height={128}
          cx={65}
          cy={65}
          innerRadius="60%"
          outerRadius="90%"
          barSize={11}
          data={[{ name: data.name, value: data.percentage, fill: data.fill }]}
          startAngle={90}
          endAngle={endAngle}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <RadialBar dataKey="value" cornerRadius={10} />
        </RadialBarChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-sm text-gray-600">
          <div>{data.value}</div>
          <div>{data.unit}</div>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-xs">{data.name}</div>
        <div className="text-sm font-bold" style={{ color: data.fill }}>
          {data.status}
        </div>
      </div>
    </div>
  );
}

export function EnvironmentMonitor({ data = mockEnvironments }: { data?: Environment[] } = {}) {
  return (
    <div>
      <div className="text-[#B5BBD3] font-semibold text-sm mb-2">환경 모니터링</div>
      <div className="flex items-center justify-between">
        {data.map((item) => (
          <EnvironmentChart key={item.name} data={item} />
        ))}
      </div>
    </div>
  );
}
