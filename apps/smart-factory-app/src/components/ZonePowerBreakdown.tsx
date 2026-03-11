import { useFactoryStore, selectActiveScenes } from "@/stores/factory.store";
import type { BuildingId } from "@/babylon/types";

const BUILDING_LABELS: Record<BuildingId, string> = {
  "main-factory": "본관",
  warehouse: "물류동",
  utility: "유틸리티동",
  "quality-lab": "품질동",
};

interface ZonePowerBreakdownProps {
  buildingId: BuildingId;
}

export function ZonePowerBreakdown({ buildingId }: ZonePowerBreakdownProps) {
  const activeScenes = useFactoryStore(selectActiveScenes);
  const scene = activeScenes.find((s) => s.buildingId === buildingId);

  if (!scene) return null;

  const barMax = Math.max(scene.expectedMaxKw, scene.actualKw);
  const expectedWidth = barMax > 0 ? (scene.expectedMaxKw / barMax) * 100 : 0;
  const actualWidth = barMax > 0 ? (scene.actualKw / barMax) * 100 : 0;

  const statusColor =
    scene.status === "anomaly" ? "#DE4545" : scene.status === "warning" ? "#FFA26B" : "#00C48C";

  return (
    <div className="p-3 rounded-lg bg-[#1A1A22]/90 border border-[#2A2A34]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-white">
          {BUILDING_LABELS[buildingId]} — {scene.label}
        </span>
        <span
          className="text-[10px] font-medium px-1.5 py-0.5 rounded"
          style={{ color: statusColor, backgroundColor: `${statusColor}20` }}
        >
          {scene.status === "anomaly" ? "이상" : scene.status === "warning" ? "경고" : "정상"}
        </span>
      </div>

      {/* Expected vs Actual comparison bars */}
      <div className="space-y-1.5">
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[9px] text-[#6A6A7A]">기대 전력</span>
            <span className="text-[9px] font-mono text-[#4D7EFF]">{scene.expectedMaxKw}kW</span>
          </div>
          <div className="h-2 rounded-full bg-[#2A2A34] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${expectedWidth}%`, backgroundColor: "#4D7EFF" }}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[9px] text-[#6A6A7A]">실측 전력</span>
            <span className="text-[9px] font-mono" style={{ color: statusColor }}>
              {scene.actualKw}kW
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#2A2A34] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${actualWidth}%`, backgroundColor: statusColor }}
            />
          </div>
        </div>
      </div>

      {/* Excess info */}
      {scene.excessKw > 0 && (
        <div className="mt-2 pt-2 border-t border-[#2A2A34] flex items-center justify-between">
          <span className="text-[9px] text-[#DE4545]">
            초과: +{scene.excessKw}kW ({scene.excessPercent}%)
          </span>
        </div>
      )}
    </div>
  );
}
