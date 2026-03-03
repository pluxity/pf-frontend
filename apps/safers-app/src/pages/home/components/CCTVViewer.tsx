import { useWHEPStream } from "@pf-dev/cctv";
import { useCCTVStreams } from "@/hooks/useCCTVStreams";

/** CCTVCard / CCTVPlaceholder 공통 컨테이너 — grid cell 크기에 영향 주지 않도록 통일 */
const CELL_CLASS =
  "relative bg-gray-900 rounded-lg overflow-hidden h-full min-h-0 border-2 border-gray-300";

function CCTVCard({ streamUrl, name }: { streamUrl: string; name: string }) {
  const { videoRef, status, connect } = useWHEPStream(streamUrl);

  return (
    <div className={CELL_CLASS}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-contain"
      />

      {/* 연결 중 상태 */}
      {status === "connecting" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
        </div>
      )}

      {/* 연결 실패 상태 */}
      {status === "failed" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/95">
          <div className="w-10 h-10 mb-2 bg-error-brand/20 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-error-brand"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-white text-xs font-medium mb-2">연결 실패</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              connect();
            }}
            className="px-3 py-1 text-xs bg-brand rounded hover:bg-brand/80 transition-colors text-white"
          >
            재연결
          </button>
        </div>
      )}

      {/* 하단 오버레이 */}
      <div className="absolute bottom-1 left-1 inline-flex items-center gap-2 px-2 py-1.5 font-bold text-xs bg-black/50 rounded-xl">
        <span className="text-brand">WHEP</span>
        <span className="h-3 w-0.5 bg-white"></span>
        <span className="text-white">{name}</span>
      </div>
    </div>
  );
}

function CCTVPlaceholder({ text }: { text: string }) {
  return (
    <div className={CELL_CLASS}>
      <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
        {text}
      </div>
    </div>
  );
}

export function CCTVViewer({ siteId }: { siteId?: number | null }) {
  const { items, isLoading, isError, error } = useCCTVStreams(siteId ?? undefined);

  return (
    <>
      {[0, 1, 2].map((i) => {
        if (isLoading) return <CCTVPlaceholder key={i} text="로딩 중..." />;
        if (isError) return <CCTVPlaceholder key={i} text={error?.message || "오류 발생"} />;
        const item = items[i];
        if (!item) return <CCTVPlaceholder key={i} text="CCTV 없음" />;
        return <CCTVCard key={item.streamName} streamUrl={item.whepUrl} name={item.displayName} />;
      })}
    </>
  );
}
