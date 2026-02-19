import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner } from "@pf-dev/ui";
import {
  SiteHeader,
  MapboxViewer,
  WorkerListPanel,
  WeatherPanel,
  EventPanel,
  MapToolbar,
} from "./components";
import type { MapboxViewerHandle, MapStyleKey, Attendance } from "./components";
import { sitesService, siteDetailService, type Site, type SiteEvent } from "@/services";
import { useWeather } from "@/hooks";
import { INITIAL_WORKERS, SCENARIO_EMERGENCIES, SCENARIO3, nextEventId } from "./mocks";
import { COLOR_SUCCESS, COLOR_DANGER } from "./components/mapbox-viewer/constants";

type ScenarioId = 1 | 2 | 3;

function ScenarioButton({
  label,
  scenario,
  onTrigger,
}: {
  label: string;
  scenario: ScenarioId;
  onTrigger: (scenario: ScenarioId) => void;
}) {
  return (
    <button
      onClick={() => onTrigger(scenario)}
      className="rounded-lg bg-[#DE4545] px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-colors hover:bg-[#c53030] disabled:opacity-60"
    >
      {label}
    </button>
  );
}

export function SitePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [site, setSite] = useState<Site | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapStyle, setMapStyle] = useState<MapStyleKey>("day");
  const [scenarioActive, setScenarioActive] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [workers, setWorkers] = useState(INITIAL_WORKERS);
  const [events, setEvents] = useState<SiteEvent[]>([]);
  const mapViewerRef = useRef<MapboxViewerHandle>(null);

  const workerNames = useMemo(
    () => Object.fromEntries(workers.map((w) => [w.id, w.name])),
    [workers]
  );

  const attendance: Attendance = useMemo(
    () => ({
      working: workers.length,
      standby: 0,
      offDuty: 0,
      absent: 0,
    }),
    [workers.length]
  );

  const handleMapStyleChange = useCallback((style: MapStyleKey) => {
    setMapStyle(style);
    mapViewerRef.current?.setStyle(style);
  }, []);

  const handlePanelWorkerClick = useCallback((workerId: string) => {
    setSelectedWorkerId(workerId);
    mapViewerRef.current?.selectWorker(workerId);
  }, []);

  const handleMapWorkerSelect = useCallback((workerId: string | null) => {
    setSelectedWorkerId(workerId);
  }, []);

  const handleAreaSelect = useCallback((featureIds: string[]) => {
    setSelectionMode(false);
    if (featureIds.length > 0) {
      // Highlight handled by MapboxViewer internally
    }
  }, []);

  const handleSelectionCancel = useCallback(() => {
    setSelectionMode(false);
  }, []);

  const handleScenarioTrigger = useCallback(
    (scenario: ScenarioId) => {
      if (scenario === 3) {
        setScenarioActive(true);

        // 작업 중 → 걷기 모델로 전환 후 경로 이동
        mapViewerRef.current?.swapFeatureAsset(SCENARIO3.workerId, "worker-walk");
        mapViewerRef.current?.selectFeature(SCENARIO3.workerId);
        mapViewerRef.current?.moveFeatureAlongPath(
          SCENARIO3.workerId,
          SCENARIO3.path,
          SCENARIO3.moveDurationMs,
          () => {
            const dangerEvent: SiteEvent = {
              id: nextEventId(),
              level: "danger",
              code: "F-2",
              message: "작업자 위험구역 진입",
              site: { id: Number(id) || 0, name: "개봉5구역", region: "SEOUL" },
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

            mapViewerRef.current?.flyTo(SCENARIO3.camera);

            mapViewerRef.current?.triggerEmergency(SCENARIO3.emergency, {
              skipModelSwap: true,
              skipSelect: true,
              skipFlyTo: true,
              message: "위험구역 침입 탐지",
              bannerLabel: SCENARIO3.cctvId,
            });

            mapViewerRef.current?.selectFeature(SCENARIO3.cctvId, COLOR_DANGER);
          }
        );
        return;
      }

      const emergency = SCENARIO_EMERGENCIES[scenario];

      const dangerEvent: SiteEvent = {
        id: nextEventId(),
        level: "danger",
        code: `E-${scenario}`,
        message: "작업자 이상징후 감지",
        site: { id: Number(id) || 0, name: "개봉5구역", region: "SEOUL" },
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

      mapViewerRef.current?.triggerEmergency(emergency);
    },
    [id]
  );

  const siteId = id ? Number(id) : null;
  const { currentWeather } = useWeather({ siteId });

  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }

    const numericId = Number(id);

    async function fetchData() {
      try {
        const [siteRes] = await Promise.all([
          sitesService.getSite(numericId),
          siteDetailService.getSiteDetail(numericId),
        ]);
        setSite(siteRes.data);
      } catch (error) {
        console.error("Failed to fetch site detail:", error);
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id, navigate]);

  if (isLoading || !site) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-100">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <div className="absolute inset-0">
        <MapboxViewer
          ref={mapViewerRef}
          workerNames={workerNames}
          onWorkerSelect={handleMapWorkerSelect}
          selectionMode={selectionMode}
          onAreaSelect={handleAreaSelect}
          onSelectionCancel={handleSelectionCancel}
          onScenarioEnd={() => {
            setScenarioActive(false);
            setWorkers(INITIAL_WORKERS);
            setSelectedWorkerId(null);
            mapViewerRef.current?.setFOVColor(SCENARIO3.cctvId, COLOR_SUCCESS);
          }}
        />
      </div>

      <header className="absolute inset-x-0 top-0 z-50 h-[3.75rem]">
        <SiteHeader
          siteName={site.name}
          mapStyle={mapStyle}
          onMapStyleChange={handleMapStyleChange}
        />
      </header>

      {/* 좌측 패널 */}
      <EventPanel events={events} className="absolute left-4 top-[4.75rem] z-40 w-[18.75rem]" />
      <WorkerListPanel
        className="absolute left-4 top-[40vh] z-40"
        attendance={attendance}
        workers={workers}
        selectedWorkerId={selectedWorkerId}
        onWorkerClick={handlePanelWorkerClick}
      />

      {/* 우측 패널 */}
      <WeatherPanel
        currentWeather={currentWeather}
        className="absolute right-4 top-[4.75rem] z-40 w-[15rem]"
      />
      <MapToolbar
        selectionMode={selectionMode}
        onToggleSelection={() => setSelectionMode((prev) => !prev)}
        onZoomIn={() => mapViewerRef.current?.zoomIn()}
        onZoomOut={() => mapViewerRef.current?.zoomOut()}
        className="absolute right-4 top-[50vh] translate-y-[-50%] z-40"
      />

      {!scenarioActive && (
        <div className="absolute inset-x-0 bottom-6 z-50 flex justify-center gap-3">
          <ScenarioButton
            label="근로자 이상징후 감지"
            scenario={1}
            onTrigger={handleScenarioTrigger}
          />
          <ScenarioButton label="SOS 긴급 호출" scenario={2} onTrigger={handleScenarioTrigger} />
          <ScenarioButton label="위험구역 접근" scenario={3} onTrigger={handleScenarioTrigger} />
        </div>
      )}
    </div>
  );
}
