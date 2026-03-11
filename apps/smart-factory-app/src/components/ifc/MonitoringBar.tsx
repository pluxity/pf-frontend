import {
  useIFCViewerStore,
  selectBillboardsVisible,
  selectHeatmapActive,
  selectPipeFlowVisible,
} from "@/stores/ifc-viewer.store";
import type { IFCSceneApi } from "@/babylon/loaders/create-ifc-scene";

interface MonitoringBarProps {
  sceneApi: IFCSceneApi | null;
}

export function MonitoringBar({ sceneApi }: MonitoringBarProps) {
  const billboardsVisible = useIFCViewerStore(selectBillboardsVisible);
  const heatmapActive = useIFCViewerStore(selectHeatmapActive);
  const pipeFlowVisible = useIFCViewerStore(selectPipeFlowVisible);
  const { setBillboardsVisible, setHeatmapActive, setPipeFlowVisible } = useIFCViewerStore();

  function toggleBillboards() {
    const next = !billboardsVisible;
    setBillboardsVisible(next);
    sceneApi?.setSensorBillboardsVisible(next);
  }

  function toggleHeatmap() {
    const next = !heatmapActive;
    setHeatmapActive(next);
    if (!next) {
      sceneApi?.clearHeatmap();
    }
  }

  function togglePipeFlow() {
    const next = !pipeFlowVisible;
    setPipeFlowVisible(next);
    sceneApi?.setPipeFlowVisible(next);
  }

  const buttons = [
    { label: "센서", active: billboardsVisible, onClick: toggleBillboards },
    { label: "히트맵", active: heatmapActive, onClick: toggleHeatmap },
    { label: "배관흐름", active: pipeFlowVisible, onClick: togglePipeFlow },
  ];

  return (
    <div className="flex items-center gap-1.5 bg-[#1A1D27]/95 rounded-lg border border-[#2D3140] px-2 py-1.5">
      {buttons.map(({ label, active, onClick }) => (
        <button
          key={label}
          onClick={onClick}
          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
            active
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              : "bg-[#2D3140] text-gray-400 hover:text-white border border-transparent"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
