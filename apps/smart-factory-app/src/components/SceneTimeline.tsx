import { useFactoryStore, selectActiveScenes, selectEnergyAnomalies } from "@/stores/factory.store";
import { SCENE_DEFINITIONS } from "@/config/scene-schedule.config";
import type { BuildingId } from "@/babylon/types";

const HOUR_LABELS = [0, 3, 6, 8, 12, 13, 17, 18, 21, 24];

const BUILDING_LABELS: Record<BuildingId, string> = {
  "main-factory": "본관",
  warehouse: "물류동",
  utility: "유틸리티",
  "quality-lab": "품질동",
};

const BUILDING_IDS: BuildingId[] = ["main-factory", "warehouse", "utility", "quality-lab"];

const SCENE_COLORS: Record<string, string> = {
  normal: "#00C48C",
  warning: "#FFA26B",
  anomaly: "#DE4545",
};

interface SceneTimelineProps {
  simulatedHour: number | null;
}

export function SceneTimeline({ simulatedHour }: SceneTimelineProps) {
  const activeScenes = useFactoryStore(selectActiveScenes);
  const anomalies = useFactoryStore(selectEnergyAnomalies);

  // Get anomaly building IDs
  const anomalyBuildings = new Set(
    anomalies.filter((a) => !a.acknowledged).map((a) => a.buildingId)
  );

  // Get active scene buildings for status
  const sceneStatusMap = new Map<BuildingId, string>();
  for (const scene of activeScenes) {
    sceneStatusMap.set(scene.buildingId, scene.status);
  }

  return (
    <div className="rounded-xl bg-[#1A1A22]/95 backdrop-blur border border-[#2A2A34] shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-[#2A2A34]">
        <h3 className="text-xs font-semibold text-white">24시간 타임라인</h3>
        {simulatedHour !== null && (
          <span className="text-[10px] font-mono text-[#4D7EFF]">
            시뮬레이션: {String(simulatedHour).padStart(2, "0")}:00
          </span>
        )}
      </div>

      <div className="px-4 py-3">
        {/* Hour labels */}
        <div className="relative h-4 mb-1">
          {HOUR_LABELS.map((hour) => (
            <span
              key={hour}
              className="absolute text-[8px] text-[#6A6A7A] font-mono -translate-x-1/2"
              style={{ left: `${(hour / 24) * 100}%` }}
            >
              {String(hour).padStart(2, "0")}
            </span>
          ))}
        </div>

        {/* Building timelines */}
        <div className="space-y-1.5">
          {BUILDING_IDS.map((buildingId) => {
            const buildingScenes = SCENE_DEFINITIONS.filter((s) => s.buildingId === buildingId);
            const status = sceneStatusMap.get(buildingId);
            const hasAnomaly = anomalyBuildings.has(buildingId);

            return (
              <div key={buildingId} className="flex items-center gap-2">
                <span className="text-[9px] text-[#6A6A7A] w-14 shrink-0 text-right">
                  {BUILDING_LABELS[buildingId]}
                </span>
                <div className="relative flex-1 h-3 rounded-sm bg-[#2A2A34] overflow-hidden">
                  {/* Scene time ranges */}
                  {buildingScenes.map((scene) => {
                    if (scene.schedule.type === "always") {
                      return (
                        <div
                          key={scene.id}
                          className="absolute inset-0 opacity-30"
                          style={{ backgroundColor: "#4D7EFF" }}
                        />
                      );
                    }
                    const start = scene.schedule.startHour ?? 0;
                    const end = scene.schedule.endHour ?? 24;

                    // Only show weekday scenes for simplicity
                    if (scene.schedule.days?.includes("sat")) return null;

                    if (start <= end) {
                      return (
                        <div
                          key={scene.id}
                          className="absolute top-0 h-full opacity-40"
                          style={{
                            left: `${(start / 24) * 100}%`,
                            width: `${((end - start) / 24) * 100}%`,
                            backgroundColor:
                              status && hasAnomaly ? SCENE_COLORS.anomaly : "#4D7EFF",
                          }}
                        />
                      );
                    } else {
                      // Overnight range: render two segments
                      return (
                        <div key={scene.id}>
                          <div
                            className="absolute top-0 h-full opacity-40"
                            style={{
                              left: `${(start / 24) * 100}%`,
                              width: `${((24 - start) / 24) * 100}%`,
                              backgroundColor:
                                status && hasAnomaly ? SCENE_COLORS.anomaly : "#4D7EFF",
                            }}
                          />
                          <div
                            className="absolute top-0 h-full opacity-40"
                            style={{
                              left: "0%",
                              width: `${(end / 24) * 100}%`,
                              backgroundColor:
                                status && hasAnomaly ? SCENE_COLORS.anomaly : "#4D7EFF",
                            }}
                          />
                        </div>
                      );
                    }
                  })}

                  {/* Current time marker */}
                  {simulatedHour !== null && (
                    <div
                      className="absolute top-0 h-full w-0.5 z-10"
                      style={{
                        left: `${(simulatedHour / 24) * 100}%`,
                        backgroundColor: "#FFFFFF",
                      }}
                    />
                  )}

                  {/* Anomaly dot */}
                  {hasAnomaly && simulatedHour !== null && (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full animate-pulse z-20"
                      style={{
                        left: `calc(${(simulatedHour / 24) * 100}% - 4px)`,
                        backgroundColor: "#DE4545",
                      }}
                    />
                  )}
                </div>

                {/* Status indicator */}
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    backgroundColor: hasAnomaly
                      ? "#DE4545"
                      : status === "warning"
                        ? "#FFA26B"
                        : status === "normal"
                          ? "#00C48C"
                          : "#3A3A44",
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-[#2A2A34]">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-[#4D7EFF] opacity-40" />
            <span className="text-[8px] text-[#6A6A7A]">감시 구간</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-0.5 h-2 bg-white" />
            <span className="text-[8px] text-[#6A6A7A]">현재 시각</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#DE4545]" />
            <span className="text-[8px] text-[#6A6A7A]">이상 감지</span>
          </div>
        </div>
      </div>
    </div>
  );
}
