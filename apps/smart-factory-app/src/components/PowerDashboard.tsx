import {
  useFactoryStore,
  selectPowerReadings,
  selectFocusedBuildingId,
} from "@/stores/factory.store";
import { PANELS } from "@/config/electrical.config";
import { LOAD_COLORS } from "@/config/campus-layout.config";
import { PowerBar } from "./PowerBar";

export function PowerDashboard() {
  const readings = useFactoryStore(selectPowerReadings);
  const focusedBuilding = useFactoryStore(selectFocusedBuildingId);

  if (readings.length === 0) return null;

  // Filter panels based on focused building
  const relevantPanels = focusedBuilding
    ? PANELS.filter((p) => p.buildingId === focusedBuilding)
    : PANELS;

  // Total power
  const totalKw = readings.reduce((sum, r) => sum + r.currentKw, 0);
  const totalRatedKw = readings.reduce((sum, r) => sum + r.ratedKw, 0);
  const totalPercent = totalRatedKw > 0 ? (totalKw / totalRatedKw) * 100 : 0;

  // Determine overall level
  const overallLevel =
    totalPercent > 90
      ? "critical"
      : totalPercent > 70
        ? "high"
        : totalPercent > 40
          ? "normal"
          : "low";

  return (
    <div className="absolute top-4 left-4 w-64 rounded-xl bg-[#1A1A22]/95 backdrop-blur border border-[#2A2A34] shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#2A2A34]">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">
            {focusedBuilding ? "빌딩 전력" : "캠퍼스 전력"}
          </h2>
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: LOAD_COLORS[overallLevel] }}
            />
            <span className="text-xs font-mono text-white">{totalKw.toFixed(0)} kW</span>
          </div>
        </div>
        <div className="mt-1.5 h-2 rounded-full bg-[#2A2A34] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, totalPercent)}%`,
              backgroundColor: LOAD_COLORS[overallLevel],
            }}
          />
        </div>
        <div className="mt-1 text-right text-[10px] font-mono text-[#6A6A7A]">
          {totalKw.toFixed(0)} / {totalRatedKw.toFixed(0)} kW ({totalPercent.toFixed(1)}%)
        </div>
      </div>

      {/* Panel list */}
      <div className="px-4 py-3 space-y-3 max-h-80 overflow-y-auto">
        {relevantPanels.map((panel) => {
          const reading = readings.find((r) => r.panelId === panel.id);
          if (!reading) return null;

          return (
            <PowerBar
              key={panel.id}
              label={panel.label}
              currentKw={reading.currentKw}
              ratedKw={reading.ratedKw}
              loadPercent={reading.loadPercent}
              level={reading.level}
            />
          );
        })}
      </div>
    </div>
  );
}
