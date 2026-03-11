import { LOAD_COLORS } from "@/config/campus-layout.config";
import type { LoadLevel } from "@/babylon/types";

interface PowerBarProps {
  label: string;
  currentKw: number;
  ratedKw: number;
  loadPercent: number;
  level: LoadLevel;
}

export function PowerBar({ label, currentKw, ratedKw, loadPercent, level }: PowerBarProps) {
  const color = LOAD_COLORS[level];
  const widthPercent = Math.min(100, loadPercent);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#A0A0B0] truncate mr-2">{label}</span>
        <span className="font-mono text-white whitespace-nowrap">
          {currentKw.toFixed(1)}
          <span className="text-[#6A6A7A]">/{ratedKw}</span> kW
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[#2A2A34] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${widthPercent}%`, backgroundColor: color }}
        />
      </div>
      <div className="flex justify-end">
        <span className="text-[10px] font-mono" style={{ color }}>
          {loadPercent.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
