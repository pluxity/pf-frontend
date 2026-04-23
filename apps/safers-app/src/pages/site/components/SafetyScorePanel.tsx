import { useEffect, useState } from "react";
import { DraggablePanel } from "./DraggablePanel";
import { STATUS_COLORS } from "@/styles/tokens";
import { safetyService } from "@/services";
import type { SafetyItem } from "@/services/types/safety.types";
import { createDefaultSafetyData } from "@/services/types/safety.types";

// ─── SVG 반원 게이지 ───

function getScoreColor(score: number): string {
  if (score >= 90) return STATUS_COLORS.successAlt;
  if (score >= 70) return STATUS_COLORS.warningAlt;
  return STATUS_COLORS.dangerDetection;
}

function SemiCircleGauge({ score }: { score: number }) {
  const size = 160;
  const strokeWidth = 16;
  const cy = size / 2;
  const r = (size - strokeWidth) / 2;

  const circumference = Math.PI * r;
  const ratio = Math.min(score, 100) / 100;
  const dashOffset = circumference * (1 - ratio);
  const color = getScoreColor(score);

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size / 2 + 12} viewBox={`0 0 ${size} ${size / 2 + 12}`}>
        <defs>
          <filter id="gauge-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 배경 arc */}
        <path
          d={`M ${strokeWidth / 2} ${cy} A ${r} ${r} 0 0 1 ${size - strokeWidth / 2} ${cy}`}
          fill="none"
          stroke="#BBBFCF"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* 값 arc */}
        <path
          d={`M ${strokeWidth / 2} ${cy} A ${r} ${r} 0 0 1 ${size - strokeWidth / 2} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          filter="url(#gauge-glow)"
          className="transition-all duration-700"
        />
      </svg>

      {/* 중앙 점수 */}
      <div className="absolute inset-x-0 bottom-1 flex flex-col items-center">
        <span className="text-4xl font-bold" style={{ color }}>
          {score}
        </span>
        <span className="text-[0.625rem] text-[#777]">점</span>
      </div>
    </div>
  );
}

// ─── 프로그레스 바 행 ───

const BAR_HEIGHT = "h-2";

/** 위험 이벤트 카운트에 따른 바 색상 */
function getBarColorByCount(count: number): string {
  if (count === 0) return STATUS_COLORS.successAlt;
  if (count <= 3) return STATUS_COLORS.warningAlt;
  return STATUS_COLORS.dangerDetection;
}

/** 근로자 출근은 높을수록 좋은 항목 */
const POSITIVE_KEYS = new Set(["WORKER_ATTENDANCE"]);

function DetailRow({ item }: { item: SafetyItem }) {
  const isPositive = POSITIVE_KEYS.has(item.key);
  const barColor = isPositive ? STATUS_COLORS.successAlt : getBarColorByCount(item.count);
  const maxCount = isPositive ? 100 : 20;
  const percentage = Math.min((item.count / maxCount) * 100, 100);

  return (
    <div className="flex items-center gap-2">
      <span className="w-[5.5rem] shrink-0 text-[0.6875rem] text-[#343841]">{item.name}</span>
      <div className={`${BAR_HEIGHT} flex-1 overflow-hidden rounded-full bg-[#DDDFE5]`}>
        <div
          className={`${BAR_HEIGHT} rounded-full transition-all duration-500`}
          style={{
            width: `${Math.max(percentage, 2)}%`,
            backgroundColor: barColor,
            boxShadow: `0 0 8px ${barColor}90, 0 0 2px ${barColor}`,
          }}
        />
      </div>
      <span className="shrink-0 text-[0.6875rem] tabular-nums text-[#555] w-6 text-right">
        {item.count}
      </span>
    </div>
  );
}

// ─── SafetyScorePanel ───

interface SafetyScorePanelProps {
  siteId?: number | null;
  className?: string;
}

/** 이벤트 카운트 기반 안전 점수 계산 (이벤트가 적을수록 높은 점수) */
function computeScore(items: SafetyItem[]): number {
  const totalEvents = items.reduce((sum, item) => sum + item.count, 0);
  // 이벤트 0건 = 100점, 50건 이상 = 0점 (선형)
  return Math.max(0, Math.round(100 - (totalEvents / 50) * 100));
}

const shimmerStyle = {
  background: "linear-gradient(90deg, #DDDFE5 25%, #EEEFF3 50%, #DDDFE5 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s ease-in-out infinite",
} as const;

function DetailRowSkeleton({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-[5.5rem] shrink-0 text-[0.6875rem] text-[#999]">{name}</span>
      <div className={`${BAR_HEIGHT} flex-1 overflow-hidden rounded-full`} style={shimmerStyle} />
      <span className="shrink-0 text-[0.6875rem] tabular-nums text-[#999] w-6 text-right">-</span>
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

export function SafetyScorePanel({ siteId, className }: SafetyScorePanelProps) {
  const { data: safetyData, loading: isLoading } = useSafetyData(siteId);
  const score = isLoading ? 0 : computeScore(safetyData);

  return (
    <DraggablePanel title="안전 점수" className={className}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      {/* 게이지 차트 */}
      <div className="mt-1 flex justify-center">
        {isLoading ? (
          <div className="w-40 h-[92px] rounded-full" style={shimmerStyle} />
        ) : (
          <SemiCircleGauge score={score} />
        )}
      </div>

      {/* 상세 항목 */}
      <div className="mt-2 flex flex-col gap-2.5 border-t border-black/10 pt-3">
        {isLoading
          ? DEFAULT_ITEMS.map((item) => <DetailRowSkeleton key={item.key} name={item.name} />)
          : safetyData.map((item) => <DetailRow key={item.key} item={item} />)}
      </div>
    </DraggablePanel>
  );
}
