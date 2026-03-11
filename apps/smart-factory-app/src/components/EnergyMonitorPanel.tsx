import { useFactoryStore, selectActiveScenes, selectEnergyAnomalies } from "@/stores/factory.store";
import { useCCTVPopupStore } from "@/stores/cctv.store";
import { getCameraById, getWHEPUrl } from "@/config/cctv.config";
import type { CampusSceneApi, BuildingId } from "@/babylon/types";

const STATUS_COLORS: Record<string, string> = {
  normal: "#00C48C",
  warning: "#FFA26B",
  anomaly: "#DE4545",
};

const STATUS_LABELS: Record<string, string> = {
  normal: "정상",
  warning: "경고",
  anomaly: "이상",
};

interface EnergyMonitorPanelProps {
  sceneRef: React.RefObject<CampusSceneApi | null>;
}

export function EnergyMonitorPanel({ sceneRef }: EnergyMonitorPanelProps) {
  const activeScenes = useFactoryStore(selectActiveScenes);
  const anomalies = useFactoryStore(selectEnergyAnomalies);
  const openPopup = useCCTVPopupStore((s) => s.openPopup);
  const setFocusedBuildingId = useFactoryStore((s) => s.setFocusedBuildingId);

  const handleFocusBuilding = (buildingId: BuildingId) => {
    setFocusedBuildingId(buildingId);
    sceneRef.current?.focusBuilding(buildingId);
  };

  const handleOpenCCTV = (cctvIds: string[], triggeredBy?: string) => {
    for (const cctvId of cctvIds) {
      const camera = getCameraById(cctvId);
      if (!camera) continue;
      openPopup({
        id: camera.id,
        label: camera.label,
        streamUrl: getWHEPUrl(camera.streamName),
        triggeredBy,
      });
    }
  };

  if (activeScenes.length === 0) {
    return (
      <div className="w-72 rounded-xl bg-[#1A1A22]/95 backdrop-blur border border-[#2A2A34] shadow-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#2A2A34]">
          <div className="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4D7EFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12h4l3 8 4-16 3 8h4" />
            </svg>
            <h2 className="text-sm font-semibold text-white">에너지 모니터</h2>
          </div>
        </div>
        <div className="px-4 py-6 text-center">
          <p className="text-xs text-[#6A6A7A]">씬 평가 대기 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 rounded-xl bg-[#1A1A22]/95 backdrop-blur border border-[#2A2A34] shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#2A2A34]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4D7EFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12h4l3 8 4-16 3 8h4" />
            </svg>
            <h2 className="text-sm font-semibold text-white">에너지 모니터</h2>
          </div>
          <span className="text-[10px] text-[#6A6A7A]">{activeScenes.length}개 씬 감시 중</span>
        </div>
      </div>

      {/* Scene status cards */}
      <div className="px-3 py-2 space-y-2 max-h-64 overflow-y-auto">
        {activeScenes.map((scene) => {
          const statusColor = STATUS_COLORS[scene.status] ?? "#6A6A7A";
          const statusLabel = STATUS_LABELS[scene.status] ?? "알 수 없음";
          const expectedBar = Math.min(
            100,
            (scene.expectedMaxKw / Math.max(scene.expectedMaxKw, scene.actualKw)) * 100
          );
          const actualBar = Math.min(
            100,
            (scene.actualKw / Math.max(scene.expectedMaxKw, scene.actualKw)) * 100
          );

          return (
            <div
              key={scene.sceneId}
              className="p-2.5 rounded-lg border transition-colors"
              style={{
                borderColor: scene.status === "anomaly" ? "#DE4545" : "#2A2A34",
                backgroundColor: scene.status === "anomaly" ? "#DE454510" : "transparent",
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-white">{scene.label}</span>
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                  style={{ color: statusColor, backgroundColor: `${statusColor}20` }}
                >
                  {statusLabel}
                </span>
              </div>

              {/* Expected power bar */}
              <div className="mb-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[9px] text-[#6A6A7A]">기대</span>
                  <span className="text-[9px] font-mono text-[#6A6A7A]">
                    {scene.expectedMaxKw}kW
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[#2A2A34] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${expectedBar}%`, backgroundColor: "#4D7EFF" }}
                  />
                </div>
              </div>

              {/* Actual power bar */}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[9px] text-[#6A6A7A]">실측</span>
                  <span className="text-[9px] font-mono" style={{ color: statusColor }}>
                    {scene.actualKw}kW
                    {scene.excessKw > 0 && (
                      <span className="text-[#DE4545]"> (+{scene.excessKw})</span>
                    )}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[#2A2A34] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${actualBar}%`,
                      backgroundColor: statusColor,
                    }}
                  />
                </div>
              </div>

              {/* Action buttons for anomaly */}
              {scene.status === "anomaly" && (
                <div className="flex gap-1.5 mt-2">
                  <button
                    className="flex-1 text-[10px] px-2 py-1 rounded bg-[#2A2A34] hover:bg-[#3A3A44] text-[#B3B3BA] transition-colors"
                    onClick={() => handleFocusBuilding(scene.buildingId)}
                  >
                    건물 포커스
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Anomaly list */}
      {anomalies.length > 0 && (
        <div className="border-t border-[#2A2A34]">
          <div className="px-4 py-2">
            <h3 className="text-[10px] font-semibold text-[#DE4545] uppercase tracking-wider">
              이상 감지 ({anomalies.filter((a) => !a.acknowledged).length})
            </h3>
          </div>
          <div className="px-3 pb-2 space-y-1.5 max-h-40 overflow-y-auto">
            {anomalies
              .filter((a) => !a.acknowledged)
              .map((anomaly) => (
                <div
                  key={anomaly.id}
                  className="p-2 rounded-lg bg-[#DE454510] border border-[#DE454530]"
                >
                  <div className="text-[10px] font-medium text-[#DE4545] mb-1">{anomaly.label}</div>
                  <div className="text-[9px] text-[#B3B3BA] mb-1.5">
                    기대 {anomaly.expectedMaxKw}kW → 실측 {anomaly.actualKw}kW (
                    {Math.round((anomaly.actualKw / anomaly.expectedMaxKw) * 100)}%)
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      className="text-[9px] px-2 py-0.5 rounded bg-[#4D7EFF]/20 hover:bg-[#4D7EFF]/30 text-[#4D7EFF] transition-colors"
                      onClick={() => handleOpenCCTV(anomaly.cctvIds, anomaly.label)}
                    >
                      CCTV 확인
                    </button>
                    <button
                      className="text-[9px] px-2 py-0.5 rounded bg-[#2A2A34] hover:bg-[#3A3A44] text-[#B3B3BA] transition-colors"
                      onClick={() => useFactoryStore.getState().acknowledgeAnomaly(anomaly.id)}
                    >
                      확인
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
