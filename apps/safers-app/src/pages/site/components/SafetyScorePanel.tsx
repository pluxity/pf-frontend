import { useRef } from "react";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import type { SafetyScoreData, SafetyStatus } from "@/services";
import { useContainerSize } from "@/hooks";
import { DraggablePanel } from "./DraggablePanel";

// ─── 상수 ───
const STATUS_COLOR: Record<SafetyStatus, string> = {
  safe: "#11C208",
  warning: "#F86700",
  danger: "#CA0014",
};

const GAUGE_ASPECT_RATIO = 0.38;

// ─── Gauge Chart (recharts RadialBarChart) ───
function GaugeChart({ score, width }: { score: number; width: number }) {
  const data = [{ name: "score", value: score, fill: "#11C208" }];
  const chartHeight = Math.round(width * GAUGE_ASPECT_RATIO);

  if (width <= 0) return null;

  return (
    <div className="relative flex justify-center">
      <div className="overflow-hidden" style={{ height: chartHeight }}>
        <RadialBarChart
          width={width}
          height={chartHeight * 2}
          innerRadius="70%"
          outerRadius="100%"
          startAngle={180}
          endAngle={0}
          data={data}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "#BBBFCF" }} />
        </RadialBarChart>
      </div>

      {/* 중앙 텍스트 */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
        <span className="text-xs text-[#55596C]">안전 점수</span>
        <span className="text-2xl font-bold text-[#333]">{score}</span>
      </div>
    </div>
  );
}

// ─── Category Row ───
function CategoryRow({
  name,
  current,
  total,
  status,
}: {
  name: string;
  current: number;
  total: number;
  status: SafetyStatus;
}) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="flex items-center gap-2">
      {/* 상태 dot */}
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: STATUS_COLOR[status] }}
      />

      {/* 카테고리명 */}
      <span className="w-[4.5rem] shrink-0 text-[0.6875rem] text-[#343841]">{name}</span>

      {/* 프로그레스 바 */}
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#999]">
        <div
          className="h-full rounded-full bg-[#55596C]"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* 값 */}
      <span className="shrink-0 text-sm tabular-nums">
        <span className="text-[#555]">{current}</span>
        <span className="text-[#999]">/{total}</span>
      </span>
    </div>
  );
}

// ─── SafetyScorePanel ───
interface SafetyScorePanelProps {
  data?: SafetyScoreData;
  className?: string;
}

export function SafetyScorePanel({ data, className }: SafetyScorePanelProps) {
  const gaugeRef = useRef<HTMLDivElement>(null);
  const { width: gaugeWidth } = useContainerSize(gaugeRef);

  if (!data) {
    return (
      <DraggablePanel title="안전율 데이터" className={className}>
        <p className="mt-2 text-xs text-[#999]">안전율 데이터 없음</p>
      </DraggablePanel>
    );
  }

  return (
    <DraggablePanel title="안전율 데이터" className={className}>
      {/* 게이지 차트 */}
      <div ref={gaugeRef} className="mt-2 flex-shrink-0">
        <GaugeChart score={data.score} width={gaugeWidth} />
      </div>

      {/* 카테고리 목록 */}
      <div className="mt-auto flex flex-col gap-3">
        {data.categories.map((cat) => (
          <CategoryRow
            key={cat.id}
            name={cat.name}
            current={cat.current}
            total={cat.total}
            status={cat.status}
          />
        ))}
      </div>
    </DraggablePanel>
  );
}
