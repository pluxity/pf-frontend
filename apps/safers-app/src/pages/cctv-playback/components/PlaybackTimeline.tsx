import { useRef, useState } from "react";
import type { TimeRange } from "@/services";

interface PlaybackTimelineProps {
  /** 타임라인 총 분 (1440 = 24h, 2880 = 48h) */
  totalMinutes: number;
  /** 현재 선택된 범위 */
  timeRange: TimeRange | null;
  /** 범위 변경 콜백 */
  onChange: (range: TimeRange | null) => void;
  /** 기준 날짜 */
  baseDate: Date;
  /** 48h 모드 여부 */
  includeNextDay: boolean;
}

/** 5분 단위 스냅 */
const SNAP_MINUTES = 5;

function snapToGrid(minutes: number): number {
  return Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES;
}

function formatMinutes(totalMinutes: number, includeNextDay: boolean, baseDate: Date): string {
  const day = Math.floor(totalMinutes / 1440);
  const mins = totalMinutes % 1440;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

  if (includeNextDay && day > 0) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + day);
    return `${d.getMonth() + 1}/${d.getDate()} ${time}`;
  }
  return time;
}

export function PlaybackTimeline({
  totalMinutes,
  timeRange,
  onChange,
  baseDate,
  includeNextDay,
}: PlaybackTimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<
    | { type: "creating"; startX: number; startMinutes: number }
    | { type: "moving-start"; initialMinutes: number }
    | { type: "moving-end"; initialMinutes: number }
    | null
  >(null);
  const [hoverMinutes, setHoverMinutes] = useState<number | null>(null);

  /** 픽셀 → 분 변환 */
  function pxToMinutes(clientX: number): number {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return snapToGrid(Math.round(ratio * totalMinutes));
  }

  /** 분 → % 변환 */
  function minutesToPercent(minutes: number): number {
    return (minutes / totalMinutes) * 100;
  }

  // --- 포인터 이벤트 ---
  function handlePointerDown(e: React.PointerEvent) {
    if (e.button !== 0) return;
    const min = pxToMinutes(e.clientX);

    // 핸들 위에서 시작한 경우는 핸들의 onPointerDown에서 처리
    setDragState({ type: "creating", startX: e.clientX, startMinutes: min });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    const min = pxToMinutes(e.clientX);
    setHoverMinutes(min);

    if (!dragState) return;

    if (dragState.type === "creating") {
      const start = Math.min(dragState.startMinutes, min);
      const end = Math.max(dragState.startMinutes, min);
      if (end - start >= SNAP_MINUTES) {
        onChange({ start, end });
      }
    } else if (dragState.type === "moving-start" && timeRange) {
      const clamped = Math.min(min, timeRange.end - SNAP_MINUTES);
      onChange({ start: Math.max(0, clamped), end: timeRange.end });
    } else if (dragState.type === "moving-end" && timeRange) {
      const clamped = Math.max(min, timeRange.start + SNAP_MINUTES);
      onChange({ start: timeRange.start, end: Math.min(totalMinutes, clamped) });
    }
  }

  function handlePointerUp() {
    setDragState(null);
  }

  // 눈금 생성
  const majorInterval = includeNextDay ? 360 : 240; // 48h: 6h, 24h: 4h
  const ticks: { minutes: number; major: boolean }[] = [];
  for (let m = 0; m <= totalMinutes; m += 60) {
    ticks.push({ minutes: m, major: m % majorInterval === 0 });
  }

  // 선택 범위 텍스트
  const rangeText = timeRange
    ? `${formatMinutes(timeRange.start, includeNextDay, baseDate)} ~ ${formatMinutes(timeRange.end, includeNextDay, baseDate)}`
    : null;

  return (
    <div className="flex flex-col gap-2">
      {/* 날짜 라벨 */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-medium text-white/50">
          {baseDate.getFullYear()}-{String(baseDate.getMonth() + 1).padStart(2, "0")}-
          {String(baseDate.getDate()).padStart(2, "0")}
          {includeNextDay &&
            (() => {
              const next = new Date(baseDate);
              next.setDate(next.getDate() + 1);
              return ` ~ ${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`;
            })()}
        </span>
        {rangeText && <span className="text-xs font-medium text-brand">선택: {rangeText}</span>}
      </div>

      {/* 타임라인 트랙 */}
      <div
        ref={trackRef}
        className="relative h-12 cursor-crosshair select-none rounded-lg bg-[#252833]"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          setHoverMinutes(null);
          if (dragState) handlePointerUp();
        }}
      >
        {/* 눈금선 */}
        {ticks.map((tick) => (
          <div
            key={tick.minutes}
            className="absolute top-0"
            style={{ left: `${minutesToPercent(tick.minutes)}%` }}
          >
            <div
              className={`${tick.major ? "h-full bg-white/10" : "h-1/3 bg-white/5"}`}
              style={{ width: 1 }}
            />
          </div>
        ))}

        {/* 선택된 범위 */}
        {timeRange && (
          <div
            className="absolute top-0 h-full rounded bg-brand/25"
            style={{
              left: `${minutesToPercent(timeRange.start)}%`,
              width: `${minutesToPercent(timeRange.end - timeRange.start)}%`,
            }}
          >
            {/* 범위 내부 색상 */}
            <div className="absolute inset-0 rounded border border-brand/40 bg-brand/10" />

            {/* 왼쪽 핸들 */}
            <div
              className="absolute -left-1 top-0 z-10 h-full w-2 cursor-ew-resize"
              onPointerDown={(e) => {
                e.stopPropagation();
                setDragState({ type: "moving-start", initialMinutes: timeRange.start });
                (e.target as HTMLElement).setPointerCapture(e.pointerId);
              }}
            >
              <div className="absolute left-0.5 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-brand" />
            </div>

            {/* 오른쪽 핸들 */}
            <div
              className="absolute -right-1 top-0 z-10 h-full w-2 cursor-ew-resize"
              onPointerDown={(e) => {
                e.stopPropagation();
                setDragState({ type: "moving-end", initialMinutes: timeRange.end });
                (e.target as HTMLElement).setPointerCapture(e.pointerId);
              }}
            >
              <div className="absolute right-0.5 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-brand" />
            </div>
          </div>
        )}

        {/* 호버 인디케이터 */}
        {hoverMinutes !== null && !dragState && (
          <div
            className="pointer-events-none absolute top-0 h-full"
            style={{ left: `${minutesToPercent(hoverMinutes)}%`, width: 1 }}
          >
            <div className="h-full bg-white/30" style={{ width: 1 }} />
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-[#1A1D27] px-1.5 py-0.5 text-[10px] text-white/60">
              {formatMinutes(hoverMinutes, includeNextDay, baseDate)}
            </div>
          </div>
        )}
      </div>

      {/* 시간 라벨 */}
      <div className="relative h-4">
        {ticks
          .filter((t) => t.major)
          .map((tick) => (
            <span
              key={tick.minutes}
              className="absolute -translate-x-1/2 text-[10px] text-white/30"
              style={{ left: `${minutesToPercent(tick.minutes)}%` }}
            >
              {formatMinutes(tick.minutes, includeNextDay, baseDate)}
            </span>
          ))}
      </div>
    </div>
  );
}
