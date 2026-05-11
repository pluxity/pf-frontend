import { useEffect, useRef, useState } from "react";
import { useWHEPStream } from "@pf-dev/cctv";
import { useCCTVPopupStore, useFeatureDataStore, selectCCTVNames } from "@/stores";

interface CCTVPopupCardProps {
  featureId: string;
  streamUrl: string;
  onHeaderPointerDown?: (e: React.PointerEvent) => void;
}

export function CCTVPopupCard({ featureId, streamUrl, onHeaderPointerDown }: CCTVPopupCardProps) {
  const closePopup = useCCTVPopupStore((s) => s.closePopup);
  const cctvNames = useFeatureDataStore(selectCCTVNames);
  const displayName = cctvNames.get(featureId) ?? featureId;
  const { videoRef, status, error, connect, disconnect } = useWHEPStream(streamUrl);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === cardRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      cardRef.current?.requestFullscreen().catch(() => {
        // Fullscreen API 미지원 또는 사용자 차단 — 무시
      });
    }
  }

  return (
    <div
      ref={cardRef}
      className={`pointer-events-auto relative overflow-hidden rounded-lg bg-black/80 text-sm text-white shadow-lg backdrop-blur-sm ${
        isFullscreen ? "flex h-full w-full flex-col" : "w-full"
      }`}
    >
      {/* 헤더 (드래그 핸들) */}
      <div
        className={`flex items-center justify-between px-3 py-2 ${
          isFullscreen ? "" : "cursor-grab active:cursor-grabbing"
        }`}
        onPointerDown={isFullscreen ? undefined : onHeaderPointerDown}
      >
        <span className="select-none font-semibold">{displayName}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "전체화면 종료" : "전체화면"}
            title={isFullscreen ? "전체화면 종료" : "전체화면"}
            className="text-white/60 transition-colors hover:text-white"
          >
            {isFullscreen ? (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 9V4m0 5H4m11-5v5m0 0h5M9 15v5m0-5H4m11 5v-5m0 0h5"
                />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                />
              </svg>
            )}
          </button>
          <button
            onClick={() => closePopup(featureId)}
            aria-label="닫기"
            className="text-white/60 transition-colors hover:text-white"
          >
            &times;
          </button>
        </div>
      </div>

      {/* 비디오 영역 */}
      <div className={`relative w-full bg-black ${isFullscreen ? "flex-1" : "aspect-video"}`}>
        <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-contain" />

        {status === "connecting" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
        )}

        {status === "failed" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60">
            <span className="text-xs text-white/70">{error ?? "연결 실패"}</span>
            <button
              onClick={connect}
              className="rounded bg-white/20 px-3 py-1 text-xs text-white hover:bg-white/30"
            >
              재연결
            </button>
          </div>
        )}
      </div>

      {/* 상태 표시 */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/70">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            status === "connected"
              ? "bg-[#00C48C]"
              : status === "connecting"
                ? "animate-pulse bg-[#FFA26B]"
                : status === "failed"
                  ? "bg-[#DE4545]"
                  : "bg-white/40"
          }`}
        />
        <span>
          {status === "connected"
            ? "연결됨"
            : status === "connecting"
              ? "연결 중..."
              : status === "failed"
                ? "연결 실패"
                : "대기"}
        </span>
      </div>
    </div>
  );
}
