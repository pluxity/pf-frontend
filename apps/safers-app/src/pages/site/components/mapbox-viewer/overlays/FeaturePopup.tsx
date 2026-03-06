import { cn } from "@pf-dev/ui";
import type { WorkerVitals, WorkerLocation } from "../types";

interface FeaturePopupProps {
  featureId: string;
  workerName?: string;
  position: { lng: number; lat: number; altitude: number };
  vitals: WorkerVitals | null;
  location?: WorkerLocation | null;
  abnormal?: boolean;
  abnormalLabel?: string;
  onClose: () => void;
}

function isAbnormalVitals(vitals: WorkerVitals) {
  return vitals.temperature >= 37.5 || vitals.heartRate >= 100;
}

export function FeaturePopup({
  featureId,
  workerName,
  position,
  vitals,
  location,
  abnormal,
  abnormalLabel,
  onClose,
}: FeaturePopupProps) {
  // 외부에서 명시적으로 abnormal을 전달하면 우선, 아니면 vitals 기준 판단
  const isAbnormal = abnormal ?? (vitals ? isAbnormalVitals(vitals) : false);
  const badgeText = abnormalLabel ?? (isAbnormal ? "이상징후" : null);

  return (
    <div className="flex flex-col items-center">
      {/* 카드 */}
      <div className="pointer-events-auto relative min-w-[12.5rem] rounded-lg bg-black/80 px-4 py-3 text-sm text-white shadow-lg backdrop-blur-sm">
        <button
          onClick={onClose}
          className="absolute right-2 top-1.5 text-white/60 hover:text-white"
        >
          &times;
        </button>

        <div className="mb-2 flex items-center gap-2 pr-4">
          <span className="font-semibold">{workerName ?? featureId}</span>
          {badgeText && (
            <span className="rounded bg-[#DE4545]/20 px-1.5 py-0.5 text-xs font-medium text-[#DE4545]">
              {badgeText}
            </span>
          )}
        </div>

        <div className="space-y-1 text-xs text-white/80">
          {/* 위치 */}
          <div className="flex justify-between gap-4">
            <span className="text-white/50">위치</span>
            <span>
              {position.lat.toFixed(4)}&deg;N, {position.lng.toFixed(4)}&deg;E
            </span>
          </div>

          {/* 위치유형 */}
          {location && (
            <div className="flex justify-between gap-4">
              <span className="text-white/50">위치유형</span>
              <span className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "rounded px-1 py-0.5 text-[10px] font-medium",
                    location.locationType === "indoor"
                      ? "bg-[#5E81F4]/20 text-[#5E81F4]"
                      : "bg-[#00C48C]/20 text-[#00C48C]"
                  )}
                >
                  {location.locationType === "indoor" ? "실내" : "실외"}
                </span>
                <span>{location.floor}</span>
              </span>
            </div>
          )}

          {vitals && (
            <>
              {/* 체온 */}
              <div className="flex justify-between gap-4">
                <span className="text-white/50">체온</span>
                <span className={vitals.temperature >= 37.5 ? "font-semibold text-[#DE4545]" : ""}>
                  {vitals.temperature.toFixed(1)}&deg;C
                </span>
              </div>

              {/* 심박수 */}
              <div className="flex justify-between gap-4">
                <span className="text-white/50">심박수</span>
                <span className={vitals.heartRate >= 100 ? "font-semibold text-[#DE4545]" : ""}>
                  {vitals.heartRate} bpm
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 커넥터 라인 */}
      <div className={`h-8 w-[0.125rem] ${badgeText ? "bg-[#DE4545]/90" : "bg-[#00C48C]/90"}`} />

      {/* 앵커 도트 */}
      <div
        className={`h-2.5 w-2.5 rounded-full border ${badgeText ? "border-[#DE4545] bg-[#DE4545]" : "border-[#00C48C] bg-[#00C48C]"}`}
      />
    </div>
  );
}
