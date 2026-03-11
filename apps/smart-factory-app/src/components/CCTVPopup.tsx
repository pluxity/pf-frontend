import { useRef, useState, useEffect } from "react";
import type { CCTVPopup as CCTVPopupData } from "@/stores/cctv.store";

interface CCTVPopupProps {
  popup: CCTVPopupData;
  index: number;
  onClose: (id: string) => void;
}

type StreamStatus = "connecting" | "live" | "failed";

export function CCTVPopup({ popup, index, onClose }: CCTVPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 120 + index * 30, y: 80 + index * 30 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [streamStatus, setStreamStatus] = useState<StreamStatus>("connecting");

  // Simulate WHEP connection attempt
  // In production, this would use @pf-dev/cctv's useWHEPStream
  useEffect(() => {
    const timer = setTimeout(() => {
      // Since we don't have a real media server, mark as failed after timeout
      setStreamStatus("failed");
    }, 3000);

    return () => clearTimeout(timer);
  }, [popup.streamUrl]);

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-nodrag]")) return;
    setIsDragging(true);
    dragOffsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragOffsetRef.current.x,
      y: e.clientY - dragOffsetRef.current.y,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const statusColor =
    streamStatus === "live" ? "#00C48C" : streamStatus === "connecting" ? "#FFA26B" : "#DE4545";
  const statusLabel =
    streamStatus === "live" ? "LIVE" : streamStatus === "connecting" ? "연결 중" : "연결 실패";

  return (
    <div
      ref={popupRef}
      className="fixed z-50 rounded-lg bg-[#1A1A22] border border-[#2A2A34] shadow-2xl overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        width: 320,
        cursor: isDragging ? "grabbing" : "default",
      }}
    >
      {/* Header (drag handle) */}
      <div
        className="flex items-center justify-between px-3 py-2 bg-[#1E1E28] cursor-grab select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="flex items-center gap-2 min-w-0">
          {/* Status dot */}
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${streamStatus === "connecting" ? "animate-pulse" : ""}`}
            style={{ backgroundColor: statusColor }}
          />
          <span className="text-[10px] font-medium text-white truncate">{popup.label}</span>
          <span
            className="text-[8px] font-mono px-1 py-0.5 rounded shrink-0"
            style={{ color: statusColor, backgroundColor: `${statusColor}20` }}
          >
            {statusLabel}
          </span>
        </div>
        <button
          data-nodrag
          onClick={() => onClose(popup.id)}
          className="text-[#6A6A7A] hover:text-white transition-colors ml-2 shrink-0"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Video area */}
      <div className="relative w-full aspect-video bg-black">
        {streamStatus === "connecting" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-[#4D7EFF] border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] text-[#6A6A7A]">WHEP 연결 중...</span>
            </div>
          </div>
        )}

        {streamStatus === "failed" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-center px-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6A6A7A"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
                <line x1="2" y1="3" x2="22" y2="17" />
              </svg>
              <span className="text-[10px] text-[#6A6A7A]">CCTV 미연결 — 데모 모드</span>
              <span className="text-[8px] text-[#4A4A54]">미디어 서버에 스트림이 없습니다</span>
            </div>
          </div>
        )}

        {streamStatus === "live" && (
          <video autoPlay playsInline muted className="w-full h-full object-cover" />
        )}
      </div>

      {/* Trigger reason */}
      {popup.triggeredBy && (
        <div className="px-3 py-1.5 border-t border-[#2A2A34] bg-[#DE454510]">
          <div className="flex items-center gap-1.5">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#DE4545"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span className="text-[9px] text-[#DE4545]">{popup.triggeredBy}</span>
          </div>
        </div>
      )}
    </div>
  );
}
