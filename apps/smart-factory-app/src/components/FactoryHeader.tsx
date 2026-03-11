import { useFactoryStore, selectEquipmentMap } from "@/stores/factory.store";
import { STATUS_COLORS } from "@/config/factory-layout.config";
import type { EquipmentStatus } from "@/babylon/types";

const STATUS_LABELS: Record<EquipmentStatus, string> = {
  running: "가동",
  idle: "대기",
  warning: "경고",
  error: "에러",
  maintenance: "정비",
};

export function FactoryHeader() {
  const equipmentMap = useFactoryStore(selectEquipmentMap);

  // Count by status
  const counts: Record<string, number> = {};
  for (const eq of equipmentMap.values()) {
    counts[eq.status] = (counts[eq.status] ?? 0) + 1;
  }

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-[#1A1A22] border-b border-[#2A2A34]">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-[#00C48C] animate-pulse" />
        <h1 className="text-base font-semibold text-white tracking-tight">Smart Factory Monitor</h1>
      </div>

      <div className="flex items-center gap-4">
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
