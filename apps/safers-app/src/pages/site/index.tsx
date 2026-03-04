import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner } from "@pf-dev/ui";
import {
  SiteHeader,
  MapboxViewer,
  WorkerListPanel,
  WeatherPanel,
  EventPanel,
  MapToolbar,
  SafetyScorePanel,
} from "./components";
import type { MapboxViewerHandle, MapStyleKey, Attendance } from "./components";
import { sitesService, siteDetailService, type Site } from "@/services";
import { useWeather } from "@/hooks";
import { MOCK_DANGER_ZONES } from "./config";
import { useScenarioTrigger, type ScenarioId } from "./hooks";

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
  const [selectionMode, setSelectionMode] = useState(false);
  const mapViewerRef = useRef<MapboxViewerHandle>(null);

  const siteId = id ? Number(id) : null;

  const {
    scenarioActive,
    selectedWorkerId,
    setSelectedWorkerId,
    workers,
    events,
    initializeEvents,
    triggerScenario,
    resetScenario,
  } = useScenarioTrigger({
    siteId: siteId ?? 0,
    mapViewerRef,
  });

  const workerNames = Object.fromEntries(workers.map((w) => [w.id, w.name]));
  const workerLocations = Object.fromEntries(
    workers.filter((w) => w.floor).map((w) => [w.id, { floor: w.floor! }])
  );

  const attendance: Attendance = {
    working: workers.length,
    standby: 0,
    offDuty: 0,
    absent: 0,
  };

  const handleMapStyleChange = (style: MapStyleKey) => {
    setMapStyle(style);
    mapViewerRef.current?.setStyle(style);
  };

  const handlePanelWorkerClick = (workerId: string) => {
    setSelectedWorkerId(workerId);
    mapViewerRef.current?.selectWorker(workerId);
  };

  const handleMapWorkerSelect = (workerId: string | null) => {
    setSelectedWorkerId(workerId);
  };

  const handleAreaSelect = (featureIds: string[]) => {
    setSelectionMode(false);
    if (featureIds.length > 0) {
      // TODO: 영역 선택 결과 처리
    }
  };

  const handleSelectionCancel = () => {
    setSelectionMode(false);
  };

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
        initializeEvents(siteRes.data.name, siteRes.data.region);
      } catch (err) {
        console.error("현장 데이터 로드 실패:", err);
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
          sitePolygonWKT={site.location}
          workerNames={workerNames}
          workerLocations={workerLocations}
          dangerZones={MOCK_DANGER_ZONES}
          onWorkerSelect={handleMapWorkerSelect}
          selectionMode={selectionMode}
          onAreaSelect={handleAreaSelect}
          onSelectionCancel={handleSelectionCancel}
          onScenarioEnd={resetScenario}
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
        className="absolute left-4 top-[calc(100vh-12rem)] z-40"
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
      <SafetyScorePanel className="absolute right-4 top-[22rem] z-[45] w-[15rem]" />
      <MapToolbar
        selectionMode={selectionMode}
        onToggleSelection={() => setSelectionMode((prev) => !prev)}
        onZoomIn={() => mapViewerRef.current?.zoomIn()}
        onZoomOut={() => mapViewerRef.current?.zoomOut()}
        className="absolute right-4 top-[50vh] translate-y-[-50%] z-40"
      />

      {!scenarioActive && (
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-3">
          <ScenarioButton label="근로자 이상징후 감지" scenario={1} onTrigger={triggerScenario} />
          <ScenarioButton label="SOS 긴급 호출" scenario={2} onTrigger={triggerScenario} />
          <ScenarioButton label="위험구역 접근" scenario={3} onTrigger={triggerScenario} />
        </div>
      )}
    </div>
  );
}
