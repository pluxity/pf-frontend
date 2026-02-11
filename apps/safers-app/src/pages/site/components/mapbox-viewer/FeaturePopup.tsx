import type { WorkerVitals } from "./types";

interface FeaturePopupProps {
  featureId: string;
  position: { lng: number; lat: number; altitude: number };
  vitals: WorkerVitals | null;
  onClose: () => void;
}

/** 체온 37.5 이상 또는 심박수 100 이상이면 이상징후 */
function isAbnormal(vitals: WorkerVitals) {
  return vitals.temperature >= 37.5 || vitals.heartRate >= 100;
}

export function FeaturePopup({ featureId, position, vitals, onClose }: FeaturePopupProps) {
  const abnormal = vitals ? isAbnormal(vitals) : false;

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
          <span className="font-semibold">{featureId}</span>
          {abnormal && (
            <span className="rounded bg-[#DE4545]/20 px-1.5 py-0.5 text-xs font-medium text-[#DE4545]">
              이상징후
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
      <div className={`h-8 w-[0.125rem] ${abnormal ? "bg-[#DE4545]/90" : "bg-[#00C48C]/90"}`} />

      {/* 앵커 도트 */}
      <div
        className={`h-2.5 w-2.5 rounded-full border ${abnormal ? "border-[#DE4545] bg-[#DE4545]" : "border-[#00C48C] bg-[#00C48C]"}`}
      />
    </div>
  );
}
