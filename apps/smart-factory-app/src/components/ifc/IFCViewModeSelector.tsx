import { useIFCViewerStore, selectViewMode } from "@/stores/ifc-viewer.store";
import type { IFCSceneApi } from "@/babylon/loaders/create-ifc-scene";
import type { ViewMode } from "@/babylon/types";

interface IFCViewModeSelectorProps {
  sceneApi: IFCSceneApi | null;
}

const MODES: Array<{ key: ViewMode; label: string; color: string }> = [
  { key: "default", label: "기본", color: "#6B7280" },
  { key: "night", label: "야간", color: "#3B82F6" },
  { key: "thermal", label: "열화상", color: "#EF4444" },
  { key: "alert", label: "경보", color: "#F59E0B" },
];

export function IFCViewModeSelector({ sceneApi }: IFCViewModeSelectorProps) {
  const currentMode = useIFCViewerStore(selectViewMode);
  const { setViewMode } = useIFCViewerStore();

  function handleChange(mode: ViewMode) {
    setViewMode(mode);
    sceneApi?.setViewMode(mode);
  }

  return (
    <div className="flex items-center gap-1 bg-[#1A1D27]/95 rounded-lg border border-[#2D3140] px-2 py-1.5">
      {MODES.map(({ key, label, color }) => (
        <button
          key={key}
          onClick={() => handleChange(key)}
          className="px-2 py-1 rounded text-xs font-medium transition-colors"
          style={{
            backgroundColor: currentMode === key ? `${color}30` : "transparent",
            color: currentMode === key ? color : "#9CA3AF",
            borderWidth: 1,
            borderColor: currentMode === key ? `${color}60` : "transparent",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
