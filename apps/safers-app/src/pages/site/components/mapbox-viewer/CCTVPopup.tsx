import { useEffect } from "react";
import { useWHEPStream } from "@pf-dev/cctv";

interface CCTVPopupProps {
  featureId: string;
  streamUrl: string;
  onClose: () => void;
}

export function CCTVPopup({ featureId, streamUrl, onClose }: CCTVPopupProps) {
  const { videoRef, status, error, connect, disconnect } = useWHEPStream(streamUrl);

  // 언마운트 시 스트림 정리
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return (
    <div className="flex flex-col items-center">
      {/* 카드 */}
      <div className="pointer-events-auto relative w-[20rem] overflow-hidden rounded-lg bg-black/80 text-sm text-white shadow-lg backdrop-blur-sm">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-2.5">
          <span className="font-semibold">{featureId.toUpperCase()}</span>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            &times;
          </button>
        </div>

        {/* 비디오 영역 */}
        <div className="relative aspect-video w-full bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-contain"
          />

          {/* 연결 중 스피너 */}
          {status === "connecting" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </div>
          )}

          {/* 연결 실패 */}
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
        <div className="flex items-center gap-1.5 px-4 py-2 text-xs text-white/70">
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

      {/* 커넥터 라인 */}
      <div className="h-8 w-[0.125rem] bg-[#00C48C]/90" />

      {/* 앵커 도트 */}
      <div className="h-2.5 w-2.5 rounded-full border border-[#00C48C] bg-[#00C48C]" />
    </div>
  );
}
