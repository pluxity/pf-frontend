import { DraggablePanel } from "./DraggablePanel";

// ─── Mock 데이터 ───

interface SafetyDetail {
  label: string;
  current: number;
  total: number;
  type: "normal" | "inverse";
}

const SAFETY_DETAILS: SafetyDetail[] = [
  { label: "안전모 미착용", current: 1, total: 50, type: "inverse" },
  { label: "출역현황", current: 50, total: 50, type: "normal" },
  { label: "위험구역작업", current: 1, total: 50, type: "inverse" },
  { label: "쓰러짐감지", current: 0, total: 50, type: "inverse" },
  { label: "장비이상감지", current: 2, total: 50, type: "inverse" },
  { label: "개구부열림", current: 3, total: 50, type: "inverse" },
];

function getSafetyRatio(item: SafetyDetail): number {
  if (item.total === 0) return 0;
  return item.type === "inverse"
    ? (item.total - item.current) / item.total
    : item.current / item.total;
}

function computeOverallScore(items: SafetyDetail[]): number {
  if (items.length === 0) return 0;
  const avg = items.reduce((sum, item) => sum + getSafetyRatio(item), 0) / items.length;
  return Math.round(avg * 100);
}

function getScoreColor(score: number): string {
  if (score >= 90) return "#12C308";
  if (score >= 70) return "#FDC200";
  return "#CA0014";
}

function getBarColor(ratio: number, type: "normal" | "inverse"): string {
  if (type === "normal") {
    if (ratio >= 0.9) return "#12C308";
    if (ratio >= 0.6) return "#FDC200";
    return "#CA0014";
  }
  if (ratio >= 0.98) return "#12C308";
  if (ratio >= 0.9) return "#FDC200";
  return "#CA0014";
}

// ─── SVG 반원 게이지 ───

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

function DetailRow({ item }: { item: SafetyDetail }) {
  const ratio = getSafetyRatio(item);
  const percentage = ratio * 100;
  const barColor = getBarColor(ratio, item.type);

  return (
    <div className="flex items-center gap-2">
      <span className="w-[4.5rem] shrink-0 text-[0.6875rem] text-[#343841]">{item.label}</span>
      <div className={`${BAR_HEIGHT} flex-1 overflow-hidden rounded-full bg-[#DDDFE5]`}>
        <div
          className={`${BAR_HEIGHT} rounded-full transition-all duration-500`}
          style={{
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: barColor,
            boxShadow: `0 0 8px ${barColor}90, 0 0 2px ${barColor}`,
          }}
        />
      </div>
      <span className="shrink-0 text-[0.6875rem] tabular-nums">
        <span className="text-[#555]">{item.current}</span>
        <span className="text-[#999]">/{item.total}</span>
      </span>
    </div>
  );
}

// ─── SafetyScorePanel ───

interface SafetyScorePanelProps {
  className?: string;
}

export function SafetyScorePanel({ className }: SafetyScorePanelProps) {
  const score = computeOverallScore(SAFETY_DETAILS);

  return (
    <DraggablePanel title="안전 점수" className={className}>
      {/* 게이지 차트 */}
      <div className="mt-1 flex justify-center">
        <SemiCircleGauge score={score} />
      </div>

      {/* 상세 항목 */}
      <div className="mt-2 flex flex-col gap-2.5 border-t border-black/10 pt-3">
        {SAFETY_DETAILS.map((item) => (
          <DetailRow key={item.label} item={item} />
        ))}
      </div>
    </DraggablePanel>
  );
}
