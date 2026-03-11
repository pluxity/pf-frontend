import { useFactoryStore, selectEquipmentMap, selectPowerReadings } from "@/stores/factory.store";
import { STATUS_COLORS } from "@/config/campus-layout.config";
import { LOAD_COLORS } from "@/config/campus-layout.config";
import type { EquipmentStatus } from "@/babylon/types";

const STATUS_LABELS: Record<EquipmentStatus, string> = {
  running: "가동",
  idle: "대기",
  warning: "경고",
  error: "에러",
  maintenance: "정비",
};

export function CampusHeader() {
  const equipmentMap = useFactoryStore(selectEquipmentMap);
  const readings = useFactoryStore(selectPowerReadings);

  // Count by status
  const counts: Record<string, number> = {};
  for (const eq of equipmentMap.values()) {
    counts[eq.status] = (counts[eq.status] ?? 0) + 1;
  }

  // Total power
  const totalKw = readings.reduce((sum, r) => sum + r.currentKw, 0);
  const totalRatedKw = readings.reduce((sum, r) => sum + r.ratedKw, 0);
  const totalPercent = totalRatedKw > 0 ? (totalKw / totalRatedKw) * 100 : 0;
  const overallLevel =
    totalPercent > 90
      ? "critical"
      : totalPercent > 70
        ? "high"
        : totalPercent > 40
          ? "normal"
          : "low";

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-[#1A1A22] border-b border-[#2A2A34]">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-[#00C48C] animate-pulse" />
        <h1 className="text-base font-semibold text-white tracking-tight">Smart Factory Campus</h1>
      </div>

      <div className="flex items-center gap-5">
        {/* Power summary */}
        <div className="flex items-center gap-2 text-xs">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: LOAD_COLORS[overallLevel] }}
          />
          <span className="text-[#A0A0B0]">전력</span>
          <span className="font-mono text-white">{totalKw.toFixed(0)} kW</span>
          <span className="text-[#6A6A7A]">({totalPercent.toFixed(0)}%)</span>
        </div>

        <div className="w-px h-5 bg-[#2A2A34]" />

        {/* Equipment status counts */}
        {(Object.keys(STATUS_LABELS) as EquipmentStatus[]).map((status) => (
          <div key={status} className="flex items-center gap-1.5 text-xs text-[#A0A0B0]">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[status] }}
            />
            <span>{STATUS_LABELS[status]}</span>
            <span className="font-mono text-white">{counts[status] ?? 0}</span>
          </div>
        ))}
        <div className="ml-2 text-xs text-[#6A6A7A]">
          전체 <span className="text-white font-mono">{equipmentMap.size}</span>대
        </div>
      </div>
    </header>
  );
}
