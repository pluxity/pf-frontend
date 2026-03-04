import type { SafersCCTV, TimeRange } from "@/services";
import { PlaybackTimeline } from "./PlaybackTimeline";

interface PlaybackPanelProps {
  selectedCCTV: SafersCCTV | null;
  totalMinutes: number;
  timeRange: TimeRange | null;
  baseDate: Date;
  includeNextDay: boolean;
  onTimeRangeChange: (range: TimeRange | null) => void;
}

export function PlaybackPanel({
  selectedCCTV,
  totalMinutes,
  timeRange,
  baseDate,
  includeNextDay,
  onTimeRangeChange,
}: PlaybackPanelProps) {
  return (
    <div className="flex h-full flex-col gap-4">
      {/* 영상 영역 */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-xl border border-[#2A2D3A] bg-black/40">
        {selectedCCTV ? (
          <div className="flex flex-col items-center gap-3 text-white/30">
            <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">
              타임라인에서 시간 범위를 선택한 후
              <br />
              <span className="text-brand">재생 요청</span> 버튼을 눌러주세요
            </p>
            <p className="mt-1 text-xs text-white/15">
              {selectedCCTV.name}
              {selectedCCTV.nvrName && ` · ${selectedCCTV.nvrName}`}
              {selectedCCTV.channel != null &&
                ` · CH-${String(selectedCCTV.channel).padStart(2, "0")}`}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-white/20">
            <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">CCTV를 선택하세요</p>
          </div>
        )}
      </div>

      {/* 타임라인 */}
      <div className="shrink-0 rounded-xl border border-[#2A2D3A] bg-[#1A1D27] p-4">
        <PlaybackTimeline
          totalMinutes={totalMinutes}
          timeRange={timeRange}
          onChange={onTimeRangeChange}
          baseDate={baseDate}
          includeNextDay={includeNextDay}
        />
      </div>
    </div>
  );
}
