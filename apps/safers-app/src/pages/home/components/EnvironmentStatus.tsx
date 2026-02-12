import { useRef } from "react";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import type { Environment } from "../../../services/types/environments.types";
import { useContainerSize } from "@/hooks";

function EnvironmentChart({ data, size }: { data: Environment; size: number }) {
  if (size <= 0) return null;

  const barSize = Math.max(4, Math.round(size * 0.1));

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <RadialBarChart
          width={size}
          height={size}
          innerRadius="60%"
          outerRadius="90%"
          barSize={barSize}
          data={[{ name: data.name, value: data.percentage, fill: data.fill }]}
          startAngle={90}
          endAngle={450}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "#dae4f4" }} />
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

export function EnvironmentStatus({ data }: { data: Environment[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width } = useContainerSize(containerRef);

  const chartSize = Math.floor(width / data.length);

  return (
    <div>
      <div className="text-neutral-300 font-semibold text-sm mb-2">환경 모니터링</div>
      <div ref={containerRef} className="flex items-center justify-between">
        {data.map((item) => (
          <EnvironmentChart key={item.name} data={item} size={chartSize} />
        ))}
      </div>
    </div>
  );
}
