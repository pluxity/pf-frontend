import { useIFCViewerStore, selectDemoActive } from "@/stores/ifc-viewer.store";

interface DemoControlsProps {
  onStart: () => void;
  onStop: () => void;
}

export function DemoControls({ onStart, onStop }: DemoControlsProps) {
  const demoActive = useIFCViewerStore(selectDemoActive);

  return (
    <button
      onClick={demoActive ? onStop : onStart}
      className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
        demoActive
          ? "bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30"
          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
      }`}
    >
      {demoActive ? "Demo 중지" : "Demo 시작"}
    </button>
  );
}
