import { useWHEPStream } from "@pf-dev/cctv";

interface CCTVCardProps {
  streamUrl: string;
  name: string;
  onClick?: () => void;
}

/**
 * CCTV 단일 카드 컴포넌트
 */
export function CCTVCard({ streamUrl, name, onClick }: CCTVCardProps) {
  const { videoRef, status, error, connect } = useWHEPStream(streamUrl);

  return (
    <div
      className="relative bg-gray-900 rounded-lg overflow-hidden cursor-pointer h-full group"
      onClick={onClick}
    >
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />

      {status === "connecting" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
        </div>
      )}

      {status === "failed" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/95 text-white">
          {/* 경고 아이콘 */}
          <div className="w-12 h-12 mb-3 bg-brand/20 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-brand"
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

          {/* 에러 메시지 */}
          <p className="text-white font-medium mb-1 text-sm">연결 실패</p>
          {error && <p className="text-gray-400 text-xs mb-3">{error}</p>}

          {/* 재연결 버튼 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              connect();
            }}
            className="px-4 py-1.5 text-xs bg-brand rounded hover:bg-brand/80 transition-colors"
          >
            재연결
          </button>
        </div>
      )}

      {/* 하단 오버레이 */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2 py-1.5 bg-gradient-to-t from-black/80 to-transparent">
        {/* WebRTC 뱃지 */}
        <span className="bg-purple-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
          WebRTC
        </span>

        {/* CCTV 이름 */}
        <span className="text-white text-xs font-medium">{name}</span>
      </div>
    </div>
  );
}
