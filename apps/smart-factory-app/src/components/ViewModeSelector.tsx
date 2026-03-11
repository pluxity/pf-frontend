import { useFactoryStore, selectViewMode } from "@/stores/factory.store";
import type { CampusSceneApi, ViewMode } from "@/babylon/types";

interface ViewModeSelectorProps {
  sceneRef: React.RefObject<CampusSceneApi | null>;
}

const VIEW_MODES: { id: ViewMode; label: string; icon: string; color: string }[] = [
  {
    id: "default",
    label: "기본",
    icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
    color: "#B3B3BA",
  },
  {
    id: "night",
    label: "야간",
    icon: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
    color: "#4D7EFF",
  },
  {
    id: "thermal",
    label: "열화상",
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z",
    color: "#FF6B35",
  },
  {
    id: "alert",
    label: "경보",
    icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    color: "#DE4545",
  },
];

export function ViewModeSelector({ sceneRef }: ViewModeSelectorProps) {
  const viewMode = useFactoryStore(selectViewMode);
  const setViewMode = useFactoryStore((s) => s.setViewMode);

  const handleModeChange = (mode: ViewMode) => {
    const api = sceneRef.current;
    if (!api) return;

    api.setViewMode(mode);
    setViewMode(mode);
  };

  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="flex flex-col gap-1 rounded-lg bg-[#1A1A22]/90 backdrop-blur border border-[#2A2A34] p-1.5">
        <div className="px-2 py-1 text-[10px] font-semibold text-[#6A6A7A] tracking-wide">
          뷰 모드
        </div>
        {VIEW_MODES.map((mode) => {
          const isActive = viewMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => handleModeChange(mode.id)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                isActive ? "border" : "text-[#B3B3BA] hover:bg-[#1E1E28] hover:text-white"
              }`}
              style={{
                borderColor: isActive ? mode.color : "transparent",
                backgroundColor: isActive ? `${mode.color}15` : undefined,
                color: isActive ? mode.color : undefined,
              }}
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

        {/* Thermal legend */}
        {viewMode === "thermal" && (
          <div className="mt-1 px-2 pb-1">
            <div className="h-2 rounded-full bg-gradient-to-r from-[#0000CC] via-[#00CC00] via-[#FFCC00] to-[#FF0000]" />
            <div className="flex justify-between mt-0.5 text-[9px] text-[#6A6A7A]">
              <span>냉</span>
              <span>열</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
