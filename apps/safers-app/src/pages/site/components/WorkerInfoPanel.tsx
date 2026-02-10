import { useState, useRef } from "react";
import { PieChart, Pie, Cell, Sector } from "recharts";
import type { PersonnelByOccupation } from "@/services";
import { useContainerSize } from "@/hooks";
import { GlassPanel } from "./GlassPanel";

// ─── Active Shape (hover 시 확대) ───
interface ActiveShapeProps {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
}

function ActiveShape(props: ActiveShapeProps) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius - 2}
      outerRadius={outerRadius + 6}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
}

// ─── WorkerInfoPanel ───
interface WorkerInfoPanelProps {
  personnel?: PersonnelByOccupation[];
  totalPersonnel?: number;
}

export function WorkerInfoPanel({ personnel, totalPersonnel }: WorkerInfoPanelProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const chartRef = useRef<HTMLDivElement>(null);
  const { width, height } = useContainerSize(chartRef);

  if (!personnel || !totalPersonnel) {
    return (
      <GlassPanel>
        <p className="text-sm font-bold text-neutral-800">작업자 현황 정보</p>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel className="flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-[#333]">작업자 현황 정보</p>
        <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
          <path
            d="M1 1L5 5L1 9"
            stroke="#333"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* 도넛 차트 + 중앙 범례 */}
      <div ref={chartRef} className="relative flex flex-1 items-center justify-center">
        {width > 0 && height > 0 && (
          <PieChart width={Math.min(width, height)} height={Math.min(width, height)}>
            <Pie
              data={personnel}
              dataKey="count"
              nameKey="occupation"
              cx="50%"
              cy="50%"
              innerRadius="52%"
              outerRadius="88%"
              paddingAngle={2}
              stroke="none"
              activeIndex={activeIndex}
              activeShape={ActiveShape}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
            >
              {personnel.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.color}
                  style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                  opacity={activeIndex === undefined || activeIndex === index ? 1 : 0.5}
                />
              ))}
            </Pie>
          </PieChart>
        )}

        {/* 중앙 범례 (도넛 안쪽) */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col gap-1.5">
            {personnel.map((entry, index) => (
              <div
                key={index}
                className="flex items-center gap-1.5 transition-opacity duration-200"
                style={{
                  opacity: activeIndex === undefined || activeIndex === index ? 1 : 0.4,
                }}
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full border-[1.5px]"
                  style={{ borderColor: entry.color }}
                />
                <span className="w-12 text-[0.625rem] leading-tight text-[#555]">
                  {entry.occupation}
                </span>
                <span className="text-[0.625rem] font-bold leading-tight text-[#333]">
                  {entry.count}명
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
