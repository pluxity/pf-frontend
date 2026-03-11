import { useIFCViewerStore, selectMepAlarms } from "@/stores/ifc-viewer.store";
import type { IFCSceneApi } from "@/babylon/loaders/create-ifc-scene";

interface AlarmPanelProps {
  sceneApi: IFCSceneApi | null;
}

export function AlarmPanel({ sceneApi }: AlarmPanelProps) {
  const alarms = useIFCViewerStore(selectMepAlarms);
  const { clearMepAlarms } = useIFCViewerStore();

  function handleClearAll() {
    clearMepAlarms();
    sceneApi?.clearAllMepAlarms();
  }

  if (alarms.length === 0) return null;

  const criticalCount = alarms.filter((a) => a.level === "critical").length;
  const warningCount = alarms.filter((a) => a.level === "warning").length;

  return (
    <div className="absolute bottom-4 right-4 bg-[#1A1D27]/95 rounded-lg border border-[#2D3140] shadow-lg px-3 py-2">
      <div className="flex items-center gap-3">
        {criticalCount > 0 && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-xs font-medium">{criticalCount} Critical</span>
          </div>
        )}
        {warningCount > 0 && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-amber-400 text-xs font-medium">{warningCount} Warning</span>
          </div>
        )}
        <button
          onClick={handleClearAll}
          className="text-[10px] text-gray-500 hover:text-gray-300 ml-2"
        >
          모두 해제
        </button>
      </div>
    </div>
  );
}
