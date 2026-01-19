import { useState, useEffect, useCallback, useRef } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalTitle } from "@pf-dev/ui";
import { CCTVPlayer, useWHEPInit } from "@pf-dev/cctv";
import type { StreamStatus, HLSStreamStatus } from "@pf-dev/cctv";
import {
  Camera,
  AlertCircle,
  Loader2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
} from "lucide-react";
import { cctvService } from "../../services";
import type { CCTVStream } from "../../services/types";

interface CCTVModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCCTVName?: string;
}

// 상태 변경 감지 컴포넌트
function StatusWatcher({
  status,
  onStatusChange,
}: {
  status: StreamStatus | HLSStreamStatus;
  onStatusChange: (status: StreamStatus | HLSStreamStatus) => void;
}) {
  const prevStatusRef = useRef<StreamStatus | HLSStreamStatus | null>(null);

  useEffect(() => {
    if (prevStatusRef.current !== null && prevStatusRef.current !== status) {
      onStatusChange(status);
    }
    prevStatusRef.current = status;
  }, [status, onStatusChange]);

  return null;
}

function StatusIndicator({ status }: { status: StreamStatus | HLSStreamStatus }) {
  if (status === "idle") return null;

  if (status === "connecting" || status === "loading" || status === "buffering") {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
          <span className="text-sm text-white">
            {status === "connecting" && "연결 중..."}
            {status === "loading" && "로딩 중..."}
            {status === "buffering" && "버퍼링..."}
          </span>
        </div>
      </div>
    );
  }

  if (status === "failed" || status === "error") {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
        <div className="flex flex-col items-center gap-2 text-red-400">
          <AlertCircle className="w-8 h-8" />
          <span className="text-sm">연결 실패</span>
        </div>
      </div>
    );
  }

  return null;
}

export function CCTVModal({ open, onOpenChange, initialCCTVName }: CCTVModalProps) {
  const [cctvList, setCCTVList] = useState<CCTVStream[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCCTV, setSelectedCCTV] = useState<CCTVStream | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { initialize } = useWHEPInit();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const fetchCCTVList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await cctvService.fetchList();
      // ready 상태와 관계없이 모든 카메라 표시
      setCCTVList(response.items);

      if (initialCCTVName) {
        const target = response.items.find((item) => item.name === initialCCTVName);
        if (target) {
          setSelectedCCTV(target);
        }
      } else if (response.items.length > 0 && response.items[0]) {
        // 첫 번째 카메라 선택
        setSelectedCCTV(response.items[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "CCTV 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [initialCCTVName]);

  // 목록 상태(readers)만 새로고침 - 선택 상태 유지
  const refreshCCTVStatus = useCallback(async () => {
    try {
      const response = await cctvService.fetchList();
      setCCTVList(response.items);
      // 선택된 CCTV의 상태도 업데이트
      if (selectedCCTV) {
        const updated = response.items.find((item) => item.name === selectedCCTV.name);
        if (updated) {
          setSelectedCCTV(updated);
        }
      }
    } catch (err) {
      console.error("Failed to refresh CCTV status:", err);
    }
  }, [selectedCCTV]);

  useEffect(() => {
    if (open) {
      fetchCCTVList();
    }
  }, [open, fetchCCTVList]);

  const handleFullscreenToggle = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const streamUrl = selectedCCTV ? cctvService.getStreamUrl(selectedCCTV.name, "whep") : "";

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-4xl bg-slate-900 border-slate-700">
        <ModalHeader className="border-b border-slate-700">
          <ModalTitle className="text-white flex items-center gap-2">
            <Camera className="w-5 h-5" />
            CCTV 영상
          </ModalTitle>
        </ModalHeader>
        <ModalBody className="p-0">
          <div className="flex h-[500px]">
            {/* CCTV 목록 사이드바 */}
            <div className="w-48 border-r border-slate-700 overflow-y-auto bg-slate-800">
              <div className="p-2">
                <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider px-2 py-1">
                  카메라 목록
                </h3>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                  </div>
                ) : error ? (
                  <div className="text-xs text-red-400 px-2 py-4">{error}</div>
                ) : cctvList.length === 0 ? (
                  <div className="text-xs text-slate-400 px-2 py-4">
                    사용 가능한 카메라가 없습니다.
                  </div>
                ) : (
                  <div className="space-y-1 mt-2">
                    {cctvList.map((cctv) => (
                      <button
                        key={cctv.name}
                        onClick={() => setSelectedCCTV(cctv)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedCCTV?.name === cctv.name
                            ? "bg-blue-600 text-white"
                            : "text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              cctv.readers.length > 0 ? "bg-green-500" : "bg-yellow-500"
                            }`}
                          />
                          <span className="truncate">{cctv.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 영상 플레이어 영역 */}
            <div className="flex-1 relative bg-black" ref={containerRef}>
              {selectedCCTV ? (
                <CCTVPlayer
                  key={selectedCCTV.name}
                  streamUrl={streamUrl}
                  protocol="whep"
                  autoConnect={isPlaying}
                >
                  {({ videoRef, status, error: streamError }) => (
                    <>
                      <StatusWatcher
                        status={status}
                        onStatusChange={(newStatus) => {
                          if (newStatus === "connected" || newStatus === "idle") {
                            refreshCCTVStatus();
                          }
                        }}
                      />
                      <video
                        ref={videoRef}
                        className="w-full h-full object-contain"
                        autoPlay
                        playsInline
                        muted={isMuted}
                      />

                      <StatusIndicator status={status} />

                      {streamError && (
                        <div className="absolute top-4 left-4 bg-red-500/80 text-white text-xs px-2 py-1 rounded">
                          {streamError}
                        </div>
                      )}

                      {/* LIVE 표시 */}
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-xs text-white font-medium">LIVE</span>
                      </div>

                      {/* 카메라 이름 */}
                      <div className="absolute top-4 right-4 bg-slate-800/80 text-white text-xs px-2 py-1 rounded">
                        {selectedCCTV.name}
                      </div>

                      {/* 컨트롤 바 */}
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setIsPlaying((prev) => !prev)}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            title={isPlaying ? "일시정지" : "재생"}
                          >
                            {isPlaying ? (
                              <Pause className="w-5 h-5 text-white" />
                            ) : (
                              <Play className="w-5 h-5 text-white" />
                            )}
                          </button>
                          <button
                            onClick={() => setIsMuted((prev) => !prev)}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            title={isMuted ? "음소거 해제" : "음소거"}
                          >
                            {isMuted ? (
                              <VolumeX className="w-5 h-5 text-white" />
                            ) : (
                              <Volume2 className="w-5 h-5 text-white" />
                            )}
                          </button>
                        </div>
                        <button
                          onClick={handleFullscreenToggle}
                          className="p-2 hover:bg-white/20 rounded-full transition-colors"
                          title={isFullscreen ? "전체화면 종료" : "전체화면"}
                        >
                          {isFullscreen ? (
                            <Minimize className="w-5 h-5 text-white" />
                          ) : (
                            <Maximize className="w-5 h-5 text-white" />
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </CCTVPlayer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <div className="text-center">
                    <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">카메라를 선택해주세요</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
