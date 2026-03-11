import { STATUS_COLORS } from "@/config/factory-layout.config";
import type { EquipmentStatus } from "@/babylon/types";

const STATUSES: { key: EquipmentStatus; label: string }[] = [
  { key: "running", label: "가동" },
  { key: "idle", label: "대기" },
  { key: "warning", label: "경고" },
  { key: "error", label: "에러" },
  { key: "maintenance", label: "정비" },
];

export function StatusLegend() {
  return (
    <div className="absolute bottom-4 left-4 flex gap-3 px-4 py-2.5 rounded-lg bg-[#1A1A22]/90 backdrop-blur border border-[#2A2A34]">
      {STATUSES.map((s) => (
        <div key={s.key} className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-sm"
            style={{ backgroundColor: STATUS_COLORS[s.key] }}
          />
          <span className="text-[11px] text-[#A0A0B0]">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
