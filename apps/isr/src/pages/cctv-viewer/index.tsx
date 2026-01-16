import { useState, useCallback, useRef, useEffect } from "react";
import { CCTVPlayer, useWHEPInit } from "@pf-dev/cctv";
import type { StreamProtocol, StreamStatus, HLSStreamStatus } from "@pf-dev/cctv";
import {
  Play,
  Pause,
  Maximize,
  Minimize,
  Camera,
  AlertCircle,
  Loader2,
  Volume2,
  VolumeX,
  Settings,
} from "lucide-react";

interface DetectedObject {
  id: string;
  label: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  color?: string;
}

interface CCTVCamera {
  id: string;
  name: string;
  streamUrl: string;
  protocol: StreamProtocol;
}

const SAMPLE_CAMERAS: CCTVCamera[] = [
  {
    id: "cctv-1",
    name: "CCTV 1 - 정문",
    streamUrl:
      import.meta.env.VITE_CCTV_STREAM_URL ||
      "http://localhost:8888/stream/cctv1/channel/0/hls/live/index.m3u8",
    protocol: "hls",
  },
  {
    id: "cctv-2",
    name: "CCTV 2 - 후문",
    streamUrl:
      import.meta.env.VITE_CCTV_STREAM_URL_2 ||
      "http://localhost:8888/stream/cctv2/channel/0/hls/live/index.m3u8",
    protocol: "hls",
  },
];

const LABEL_COLORS: Record<string, string> = {
  person: "#00ff00",
  animal: "#ffff00",
  vehicle: "#ff0000",
  unknown: "#ffffff",
};

function DetectionOverlay({ objects }: { objects: DetectedObject[] }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {objects.map((obj) => {
        const color = obj.color || LABEL_COLORS[obj.label] || LABEL_COLORS.unknown;
        return (
          <div
            key={obj.id}
            className="absolute border-2"
            style={{
              left: `${obj.bbox.x}%`,
              top: `${obj.bbox.y}%`,
              width: `${obj.bbox.width}%`,
              height: `${obj.bbox.height}%`,
              borderColor: color,
            }}
          >
            <div
              className="absolute -top-6 left-0 px-1.5 py-0.5 text-xs font-medium text-white whitespace-nowrap"
              style={{ backgroundColor: color }}
            >
              {obj.label} {(obj.confidence * 100).toFixed(0)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ControlBar({
  isPlaying,
  isMuted,
  isFullscreen,
  onPlayPause,
  onMuteToggle,
  onFullscreenToggle,
}: {
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  onPlayPause: () => void;
  onMuteToggle: () => void;
  onFullscreenToggle: () => void;
}) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <button
          onClick={onPlayPause}
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
          onClick={onMuteToggle}
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
      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-white/20 rounded-full transition-colors" title="설정">
          <Settings className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={onFullscreenToggle}
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
    </div>
  );
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

function CameraSelector({
  cameras,
  selectedCamera,
  onSelect,
}: {
  cameras: CCTVCamera[];
  selectedCamera: CCTVCamera;
  onSelect: (camera: CCTVCamera) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Camera className="w-4 h-4 text-slate-400" />
      <select
        value={selectedCamera.id}
        onChange={(e) => {
          const camera = cameras.find((c) => c.id === e.target.value);
          if (camera) onSelect(camera);
        }}
        className="bg-slate-700 text-white text-sm px-3 py-1.5 rounded border border-slate-600 focus:outline-none focus:border-blue-500"
      >
        {cameras.map((camera) => (
          <option key={camera.id} value={camera.id}>
            {camera.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CCTVViewerPage() {
  const [selectedCamera, setSelectedCamera] = useState<CCTVCamera>(SAMPLE_CAMERAS[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useWHEPInit({
    baseUrl: import.meta.env.VITE_WHEP_BASE_URL || "http://localhost:8889",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const mockObjects: DetectedObject[] = [
        {
          id: "obj-1",
          label: "person",
          confidence: 0.95,
          bbox: {
            x: 20 + Math.random() * 5,
            y: 30 + Math.random() * 5,
            width: 15,
            height: 35,
          },
        },
        {
          id: "obj-2",
          label: "vehicle",
          confidence: 0.87,
          bbox: {
            x: 55 + Math.random() * 3,
            y: 50 + Math.random() * 3,
            width: 25,
            height: 20,
          },
        },
      ];
      setDetectedObjects(mockObjects);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleMuteToggle = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

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

  return (
    <div className="h-screen w-screen bg-slate-900 flex flex-col">
      <header className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 shrink-0">
        <h1 className="text-lg font-semibold text-white">CCTV 모니터링</h1>
        <CameraSelector
          cameras={SAMPLE_CAMERAS}
          selectedCamera={selectedCamera}
          onSelect={setSelectedCamera}
        />
      </header>

      <main className="flex-1 p-4 overflow-hidden">
        <div
          ref={containerRef}
          className="relative w-full h-full bg-black rounded-lg overflow-hidden"
        >
          <CCTVPlayer
            key={selectedCamera.id}
            streamUrl={selectedCamera.streamUrl}
            protocol={selectedCamera.protocol}
            autoConnect={isPlaying}
          >
            {({ videoRef, status, error }) => (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-contain"
                  autoPlay
                  playsInline
                  muted={isMuted}
                />

                <DetectionOverlay objects={detectedObjects} />

                <StatusIndicator status={status} />

                {error && (
                  <div className="absolute top-4 left-4 bg-red-500/80 text-white text-xs px-2 py-1 rounded">
                    {error}
                  </div>
                )}

                <div className="absolute top-4 right-4 bg-slate-800/80 text-white text-xs px-2 py-1 rounded">
                  {selectedCamera.name}
                </div>

                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs text-white font-medium">LIVE</span>
                </div>

                <ControlBar
                  isPlaying={isPlaying}
                  isMuted={isMuted}
                  isFullscreen={isFullscreen}
                  onPlayPause={handlePlayPause}
                  onMuteToggle={handleMuteToggle}
                  onFullscreenToggle={handleFullscreenToggle}
                />
              </>
            )}
          </CCTVPlayer>
        </div>
      </main>

      <footer className="h-10 bg-slate-800 border-t border-slate-700 flex items-center justify-between px-4 text-xs text-slate-400 shrink-0">
        <span>탐지된 객체: {detectedObjects.length}개</span>
        <span>프로토콜: {selectedCamera.protocol.toUpperCase()}</span>
      </footer>
    </div>
  );
}
