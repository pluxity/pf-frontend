import {
  useFactoryStore,
  selectCablesVisible,
  selectFlowVisible,
  selectBillboardsVisible,
} from "@/stores/factory.store";
import { CCTVControl } from "./CCTVControl";

interface MepControlsProps {
  onToggleCables: (visible: boolean) => void;
  onToggleFlow: (visible: boolean) => void;
  onToggleBillboards: (visible: boolean) => void;
}

export function MepControls({
  onToggleCables,
  onToggleFlow,
  onToggleBillboards,
}: MepControlsProps) {
  const cablesVisible = useFactoryStore(selectCablesVisible);
  const flowVisible = useFactoryStore(selectFlowVisible);
  const billboardsVisible = useFactoryStore(selectBillboardsVisible);
  const setCablesVisible = useFactoryStore((s) => s.setCablesVisible);
  const setFlowVisible = useFactoryStore((s) => s.setFlowVisible);
  const setBillboardsVisible = useFactoryStore((s) => s.setBillboardsVisible);

  const handleToggleCables = () => {
    const next = !cablesVisible;
    setCablesVisible(next);
    onToggleCables(next);
  };

  const handleToggleFlow = () => {
    const next = !flowVisible;
    setFlowVisible(next);
    onToggleFlow(next);
  };

  const handleToggleBillboards = () => {
    const next = !billboardsVisible;
    setBillboardsVisible(next);
    onToggleBillboards(next);
  };

  return (
    <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1A1A22]/90 backdrop-blur border border-[#2A2A34]">
      <button
        onClick={handleToggleCables}
        className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
          cablesVisible
            ? "bg-[#4D7EFF]/20 text-[#4D7EFF] border border-[#4D7EFF]/30"
            : "text-[#6A6A7A] hover:text-white hover:bg-[#2A2A34] border border-transparent"
        }`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2v6m0 8v6M2 12h6m8 0h6" />
        </svg>
        전력 케이블
      </button>

      <button
        onClick={handleToggleFlow}
        className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
          flowVisible
            ? "bg-[#00C48C]/20 text-[#00C48C] border border-[#00C48C]/30"
            : "text-[#6A6A7A] hover:text-white hover:bg-[#2A2A34] border border-transparent"
        }`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
        전력 흐름
      </button>

      <button
        onClick={handleToggleBillboards}
        className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
          billboardsVisible
            ? "bg-[#FFA26B]/20 text-[#FFA26B] border border-[#FFA26B]/30"
            : "text-[#6A6A7A] hover:text-white hover:bg-[#2A2A34] border border-transparent"
        }`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 6h16M4 12h16M4 18h7" />
        </svg>
        라벨
      </button>

      {/* Separator */}
      <div className="w-px h-5 bg-[#2A2A34]" />

      <CCTVControl />
    </div>
  );
}
