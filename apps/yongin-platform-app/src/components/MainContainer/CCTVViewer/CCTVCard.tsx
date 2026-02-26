import { useWHEPStream } from "@pf-dev/cctv";
import { useCctvBookmarkStore } from "@/stores/cctvBookmark.store";

const BOOKMARK_COLORS = {
  active: "#FACC15",
  inactive: {
    fill: "none",
    stroke: "#ffffff",
  },
} as const;

interface CCTVCardProps {
  streamUrl: string;
  streamName: string;
  name: string;
  onClick?: () => void;
  showBookmark?: boolean;
  onMaxBookmarkReached?: () => void;
}

/**
 * CCTV 단일 카드 컴포넌트
 */
export function CCTVCard({
  streamUrl,
  streamName,
  name,
  onClick,
  showBookmark = false,
  onMaxBookmarkReached,
}: CCTVCardProps) {
  const { videoRef, status, error, connect } = useWHEPStream(streamUrl);
  const isBookmarked = useCctvBookmarkStore((s) => s.isBookmarked(streamName));
  const add = useCctvBookmarkStore((s) => s.add);
  const remove = useCctvBookmarkStore((s) => s.remove);

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBookmarked) {
      await remove(streamName);
    } else {
      const success = await add(streamName);
      if (!success) {
        onMaxBookmarkReached?.();
      }
    }
  };

  return (
    <div
      className="relative bg-gray-900 rounded-lg overflow-hidden cursor-pointer h-full min-h-0 group"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />

      {status === "connecting" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
        </div>
      )}

      {status === "failed" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/95 text-white">
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
          <p className="text-white font-medium mb-1 text-sm">연결 실패</p>
          {error && <p className="text-gray-400 text-xs mb-3">{error}</p>}
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

      {/* 즐겨찾기 버튼 */}
      {showBookmark && (
        <button
          onClick={handleToggleBookmark}
          className="absolute top-1.5 right-1.5 w-7 h-7 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 transition-colors opacity-0 group-hover:opacity-100 z-10"
          aria-label={isBookmarked ? "즐겨찾기 해제" : "즐겨찾기 등록"}
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill={isBookmarked ? BOOKMARK_COLORS.active : BOOKMARK_COLORS.inactive.fill}
            stroke={isBookmarked ? BOOKMARK_COLORS.active : BOOKMARK_COLORS.inactive.stroke}
            strokeWidth={2}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      )}

      {/* 하단 오버레이 */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2 py-1.5 bg-gradient-to-t from-black/80 to-transparent">
        <span className="text-white text-xs font-medium">{name}</span>
      </div>
    </div>
  );
}
