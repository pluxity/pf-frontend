import { useState } from "react";
import type { MapboxViewerHandle } from "../components";
import type { SiteEvent, SiteRegion } from "@/services";
import {
  INITIAL_WORKERS,
  SCENARIO_EMERGENCIES,
  SCENARIO_CAMERAS,
  SCENARIO3,
  WORKER1_PATROL_PATH,
  WORKER1_PATROL_DURATION,
  COLOR_SUCCESS,
  COLOR_DANGER,
  DEFAULT_FLY_DURATION,
  nextEventId,
} from "../config";

export type ScenarioId = 1 | 2 | 3;

interface UseScenarioTriggerOptions {
  siteId: number;
  mapViewerRef: React.RefObject<MapboxViewerHandle | null>;
}

export function useScenarioTrigger({ siteId, mapViewerRef }: UseScenarioTriggerOptions) {
  const [scenarioActive, setScenarioActive] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [workers, setWorkers] = useState(INITIAL_WORKERS);
  const [events, setEvents] = useState<SiteEvent[]>([]);

  function initializeEvents(siteName: string, region: SiteRegion) {
    const d = new Date();
    const todayAt = (hour: number, minute: number) => {
      d.setHours(hour, minute, 0, 0);
      return d.toISOString();
    };

    setEvents([
      {
        id: "init-1",
        level: "alert",
        code: "ENV-02",
        message: "미세먼지(PM10) 나쁨 단계",
        site: { id: siteId, name: siteName, region },
        createdAt: todayAt(8, 12),
      },
      {
        id: "init-2",
        level: "warning",
        code: "ENV-01",
        message: "소음 기준치 초과 (88dB)",
        site: { id: siteId, name: siteName, region },
        createdAt: todayAt(9, 5),
      },
    ]);
  }

  function triggerScenario(scenario: ScenarioId) {
    if (scenario === 3) {
      setScenarioActive(true);

      mapViewerRef.current?.stopPatrol(SCENARIO3.workerId);
      mapViewerRef.current?.selectFeature(SCENARIO3.workerId);
      mapViewerRef.current?.flyTo(SCENARIO3.camera);

      setTimeout(() => {
        mapViewerRef.current?.moveFeatureTo(
          SCENARIO3.workerId,
          SCENARIO3.dangerZoneEntry,
          SCENARIO3.moveDurationMs,
          () => {
            const dangerEvent: SiteEvent = {
              id: nextEventId(),
              level: "danger",
              code: "F-2",
              message: "작업자 위험구역 진입",
              site: { id: siteId, name: "개봉5구역", region: "SEOUL" },
              createdAt: new Date().toISOString(),
              emergency: SCENARIO3.emergency,
            };
            setEvents((prev) => [...prev, dangerEvent]);

            const { workerId } = SCENARIO3.emergency;
            setWorkers((prev) =>
              prev.map((w) =>
                w.id === workerId ? { ...w, status: "abnormal" as const, info: "위험구역 진입" } : w
              )
            );
            setSelectedWorkerId(workerId);

            mapViewerRef.current?.showCCTVFOV(SCENARIO3.cctvId, true);
            mapViewerRef.current?.setFOVColor(SCENARIO3.cctvId, COLOR_DANGER);

            mapViewerRef.current?.triggerEmergency(SCENARIO3.emergency, {
              skipModelSwap: true,
              skipSelect: true,
              skipFlyTo: true,
              message: "위험구역 접근 감지",
              bannerLabel: SCENARIO3.workerId,
            });

            mapViewerRef.current?.selectFeature(SCENARIO3.cctvId, COLOR_DANGER);
          }
        );
      }, DEFAULT_FLY_DURATION);
      return;
    }

    const emergency = SCENARIO_EMERGENCIES[scenario];

    const dangerEvent: SiteEvent = {
      id: nextEventId(),
      level: "danger",
      code: `E-${scenario}`,
      message: "작업자 이상징후 감지",
      site: { id: siteId, name: "개봉5구역", region: "SEOUL" },
      createdAt: new Date().toISOString(),
      emergency,
    };
    setEvents((prev) => [...prev, dangerEvent]);

    const { workerId, vitals } = emergency;
    setWorkers((prev) =>
      prev.map((w) =>
        w.id === workerId
          ? {
              ...w,
              status: "abnormal" as const,
              info: `${vitals.temperature}°C / ${vitals.heartRate}bpm`,
            }
          : w
      )
    );
    setSelectedWorkerId(workerId);
    setScenarioActive(true);

    mapViewerRef.current?.triggerEmergency(emergency, {
      camera: SCENARIO_CAMERAS[scenario],
      occlusionMode: "clip",
    });
  }

  function resetScenario() {
    setScenarioActive(false);
    setWorkers(INITIAL_WORKERS);
    setSelectedWorkerId(null);
    mapViewerRef.current?.setFOVColor(SCENARIO3.cctvId, COLOR_SUCCESS);
    mapViewerRef.current?.swapFeatureAsset("worker-1", "worker-walk");
    mapViewerRef.current?.startPatrol("worker-1", WORKER1_PATROL_PATH, WORKER1_PATROL_DURATION);
  }

  return {
    scenarioActive,
    selectedWorkerId,
    setSelectedWorkerId,
    workers,
    events,
    initializeEvents,
    triggerScenario,
    resetScenario,
  };
}
