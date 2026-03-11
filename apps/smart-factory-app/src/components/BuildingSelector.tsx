import { useFactoryStore, selectFocusedBuildingId } from "@/stores/factory.store";
import { BUILDINGS } from "@/config/campus-layout.config";
import type { BuildingId } from "@/babylon/types";

interface BuildingSelectorProps {
  onSelect: (buildingId: BuildingId | null) => void;
}

export function BuildingSelector({ onSelect }: BuildingSelectorProps) {
  const focusedId = useFactoryStore(selectFocusedBuildingId);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#1A1A22]/90 backdrop-blur border border-[#2A2A34]">
      {/* Campus overview button */}
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
          focusedId === null
            ? "bg-[#4D7EFF] text-white"
            : "text-[#A0A0B0] hover:text-white hover:bg-[#2A2A34]"
        }`}
      >
        전체
      </button>

      {/* Building buttons */}
      {BUILDINGS.map((b) => (
        <button
          key={b.id}
          onClick={() => onSelect(b.id)}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors truncate max-w-[100px] ${
            focusedId === b.id
              ? "bg-[#4D7EFF] text-white"
              : "text-[#A0A0B0] hover:text-white hover:bg-[#2A2A34]"
          }`}
          title={b.label}
        >
          {b.label.split("(")[0]?.trim()}
        </button>
      ))}
    </div>
  );
}
