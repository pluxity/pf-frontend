import { useEffect } from "react";
import { useFactoryStore, selectCameraMode, selectFocusedBuildingId } from "@/stores/factory.store";
import type { CampusSceneApi, CameraMode } from "@/babylon/types";

interface CameraModeSelectorProps {
  sceneRef: React.RefObject<CampusSceneApi | null>;
}

const MODES: { id: CameraMode; label: string; icon: string }[] = [
  {
    id: "orbit",
    label: "조감도",
    icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  },
  {
    id: "interior",
    label: "내부 뷰",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    id: "fps",
    label: "워크스루",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
];

export function CameraModeSelector({ sceneRef }: CameraModeSelectorProps) {
  const cameraMode = useFactoryStore(selectCameraMode);
  const focusedBuildingId = useFactoryStore(selectFocusedBuildingId);
  const setCameraMode = useFactoryStore((s) => s.setCameraMode);

  const handleModeChange = (mode: CameraMode) => {
    const api = sceneRef.current;
    if (!api) return;

    if (mode === "interior" || mode === "fps") {
      if (!focusedBuildingId) return;
      api.setCameraMode(mode, focusedBuildingId);
    } else {
      api.setCameraMode(mode);
    }
    setCameraMode(mode);
  };

  // ESC key: fps → orbit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && cameraMode === "fps") {
        handleModeChange("orbit");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cameraMode, focusedBuildingId, handleModeChange]);

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10">
      <div className="flex gap-1 rounded-lg bg-[#1A1A22]/90 backdrop-blur border border-[#2A2A34] p-1">
        {MODES.map((mode) => {
          const isActive = cameraMode === mode.id;
          const isDisabled = (mode.id === "interior" || mode.id === "fps") && !focusedBuildingId;

          return (
            <button
              key={mode.id}
              onClick={() => handleModeChange(mode.id)}
              disabled={isDisabled}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                isActive
                  ? "bg-[#4D7EFF]/20 text-[#4D7EFF] border border-[#4D7EFF]/40"
                  : isDisabled
                    ? "opacity-30 cursor-not-allowed text-[#6A6A7A]"
                    : "text-[#B3B3BA] hover:bg-[#1E1E28] hover:text-white"
              }`}
              title={
                isDisabled
                  ? "건물을 선택하면 활성화됩니다"
                  : mode.id === "fps"
                    ? "WASD 이동 / ESC 종료"
                    : undefined
              }
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
                <path d={mode.icon} />
              </svg>
              {mode.label}
            </button>
          );
        })}
      </div>

      {/* FPS hint */}
      {cameraMode === "fps" && (
        <div className="mt-1 text-center text-[10px] text-[#6A6A7A]">
          WASD 이동 | 마우스 회전 | ESC 종료
        </div>
      )}
    </div>
  );
}
