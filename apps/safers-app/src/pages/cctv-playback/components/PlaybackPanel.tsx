import { useEffect, useRef, useState } from "react";
import { useWHEPStream } from "@pf-dev/cctv";
import type { SafersCCTV, TimeRange } from "@/services";
import { StreamLoadingOverlay, StreamErrorOverlay } from "@/components/cctv";
import { PlaybackTimeline } from "./PlaybackTimeline";

interface PlaybackPanelProps {
  selectedCCTV: SafersCCTV | null;
  totalMinutes: number;
  timeRange: TimeRange | null;
  baseDate: Date;
  includeNextDay: boolean;
  onTimeRangeChange: (range: TimeRange | null) => void;
  playbackWhepUrl: string | null;
  isRequesting: boolean;
  onReplay?: () => void;
}

export function PlaybackPanel({
  selectedCCTV,
  totalMinutes,
  timeRange,
  baseDate,
  includeNextDay,
  onTimeRangeChange,
  playbackWhepUrl,
  isRequesting,
  onReplay,
}: PlaybackPanelProps) {
  return (
    <div className="flex h-full flex-col gap-4">
      {/* 영상 영역 */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-xl border border-[#2A2D3A] bg-black/40">
        {playbackWhepUrl ? (
          <PlaybackStream key={playbackWhepUrl} whepUrl={playbackWhepUrl} onReplay={onReplay} />
        ) : isRequesting ? (
          <div className="flex flex-col items-center gap-3 text-white/40">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <p className="text-sm">녹화영상 요청 중...</p>
          </div>
        ) : selectedCCTV ? (
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

/** WHEP 스트림 재생 — 녹화 종료 시 "재생 완료" 오버레이 표시 */
function PlaybackStream({ whepUrl, onReplay }: { whepUrl: string; onReplay?: () => void }) {
  const { videoRef, status, connect, disconnect } = useWHEPStream(whepUrl);
  const [ended, setEnded] = useState(false);
  const wasConnectedRef = useRef(false);

  // connected → failed/disconnected 전환 시 "재생 완료"로 판단
  // key={whepUrl}로 리마운트되므로 ended는 항상 false로 시작
  useEffect(() => {
    if (status === "connected") {
      wasConnectedRef.current = true;
    } else if (wasConnectedRef.current && (status === "failed" || status === "connecting")) {
      // 서버가 연결을 끊음 → store가 재연결 시도(connecting) 또는 실패(failed)
      // 녹화 재생은 재연결 불필요하므로 즉시 disconnect 후 종료 처리
      disconnect();
      setEnded(true); // eslint-disable-line react-hooks/set-state-in-effect -- WebRTC 외부 상태 구독
      wasConnectedRef.current = false;
    }
  }, [status, disconnect]);

  if (ended) {
    return (
      <div className="flex flex-col items-center gap-4 text-white/60">
        <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm">재생이 완료되었습니다</p>
        {onReplay && (
          <button
            onClick={onReplay}
            className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/80"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            다시보기
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-contain" />
      {status === "connecting" && <StreamLoadingOverlay />}
      {status === "failed" && <StreamErrorOverlay onReconnect={() => connect()} />}
    </>
  );
}
