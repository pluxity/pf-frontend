import { useFactoryStore, selectSelectedEquipment } from "@/stores/factory.store";
import { STATUS_COLORS } from "@/config/campus-layout.config";
import { BUILDINGS } from "@/config/campus-layout.config";
import type { EquipmentStatus } from "@/babylon/types";

const STATUS_LABELS: Record<EquipmentStatus, string> = {
  running: "가동 중",
  idle: "대기 중",
  warning: "경고",
  error: "에러 발생",
  maintenance: "정비 중",
};

const TYPE_LABELS: Record<string, string> = {
  cnc: "CNC 머신",
  press: "프레스",
  "robot-arm": "로봇 팔",
  assembly: "조립대",
  inspector: "검사기",
};

export function EquipmentPanel() {
  const equipment = useFactoryStore(selectSelectedEquipment);
  const setSelectedId = useFactoryStore((s) => s.setSelectedId);

  if (!equipment) return null;

  const statusColor = STATUS_COLORS[equipment.status] ?? "#B3B3BA";
  const statusLabel = STATUS_LABELS[equipment.status as EquipmentStatus] ?? equipment.status;
  const typeLabel = TYPE_LABELS[equipment.type] ?? equipment.type;
  const buildingLabel = BUILDINGS.find((b) => b.id === equipment.buildingId)?.label ?? "-";

  return (
    <div className="absolute top-4 right-4 w-72 rounded-xl bg-[#1A1A22]/95 backdrop-blur border border-[#2A2A34] shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A34]">
        <h2 className="text-sm font-semibold text-white">{equipment.label}</h2>
        <button
          onClick={() => setSelectedId(null)}
          className="w-6 h-6 flex items-center justify-center rounded text-[#6A6A7A] hover:text-white hover:bg-[#2A2A34] transition-colors"
        >
          &times;
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-3">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#6A6A7A]">상태</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor }} />
            <span className="text-sm text-white" style={{ color: statusColor }}>
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Type */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#6A6A7A]">유형</span>
          <span className="text-sm text-[#A0A0B0]">{typeLabel}</span>
        </div>

        {/* Building */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#6A6A7A]">건물</span>
          <span className="text-xs text-[#A0A0B0] truncate max-w-[150px]">{buildingLabel}</span>
        </div>

        {/* Rated Power */}
        {equipment.ratedPowerKw !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6A6A7A]">정격 전력</span>
            <span className="text-sm font-mono text-[#A0A0B0]">{equipment.ratedPowerKw} kW</span>
          </div>
        )}

        {/* ID */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#6A6A7A]">ID</span>
          <span className="text-xs font-mono text-[#6A6A7A]">{equipment.id}</span>
        </div>
      </div>
    </div>
  );
}
