import { useRef } from "react";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import type { SafetyScoreData, SafetyStatus } from "@/services";
import { useContainerSize } from "@/hooks";
import { GlassPanel } from "./GlassPanel";

// ─── 상수 ───
const STATUS_COLOR: Record<SafetyStatus, string> = {
  safe: "#11C208",
  warning: "#F86700",
  danger: "#CA0014",
};

const GAUGE_ASPECT_RATIO = 0.75;

// ─── Gauge Chart (recharts RadialBarChart) ───
function GaugeChart({ score, width }: { score: number; width: number }) {
  const data = [{ name: "score", value: score, fill: "#11C208" }];
  const chartHeight = Math.round(width * GAUGE_ASPECT_RATIO);

  if (width <= 0) return null;

  return (
    <div className="relative flex justify-center">
      <RadialBarChart
        width={width}
        height={chartHeight}
        cx="50%"
        cy="50%"
        innerRadius="60%"
        outerRadius="100%"
        startAngle={225}
        endAngle={-45}
        data={data}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
        <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "#BBBFCF" }} />
      </RadialBarChart>

      {/* 중앙 텍스트 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-[#333]">{score}</span>
        <span className="text-[0.6875rem] text-[#55596C]">안전 점수 리포트</span>
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
      <span className="shrink-0 text-[0.6875rem] tabular-nums">
        <span className="text-[#555]">{current}</span>
        <span className="text-[#999]">/{total}</span>
      </span>
    </div>
  );
}

// ─── SafetyScorePanel ───
interface SafetyScorePanelProps {
  data?: SafetyScoreData;
}

export function SafetyScorePanel({ data }: SafetyScorePanelProps) {
  const gaugeRef = useRef<HTMLDivElement>(null);
  const { width: gaugeWidth } = useContainerSize(gaugeRef);

  if (!data) {
    return (
      <GlassPanel>
        <p className="text-sm font-bold text-neutral-800">안전율 데이터</p>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel className="flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-[#333]">안전율 데이터</p>
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

      {/* 게이지 차트 */}
      <div ref={gaugeRef} className="flex-shrink-0">
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
    </GlassPanel>
  );
}
