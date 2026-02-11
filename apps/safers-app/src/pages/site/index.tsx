import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner } from "@pf-dev/ui";
import { SiteHeader, MapboxViewer } from "./components";
import type { MapboxViewerHandle, MapStyleKey, ScenarioId } from "./components";
import { sitesService, type Site } from "@/services";

function ScenarioButton({
  label,
  scenario,
  onTrigger,
}: {
  label: string;
  scenario: ScenarioId;
  onTrigger: (scenario: ScenarioId) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await onTrigger(scenario);
        setLoading(false);
      }}
      className="rounded-lg bg-[#DE4545] px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-colors hover:bg-[#c53030] disabled:opacity-60"
    >
      {loading ? "로딩..." : label}
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
  const mapViewerRef = useRef<MapboxViewerHandle>(null);

  const handleMapStyleChange = useCallback((style: MapStyleKey) => {
    setMapStyle(style);
    mapViewerRef.current?.setStyle(style);
  }, []);

  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }

    async function fetchData() {
      try {
        const siteRes = await sitesService.getSite(id!);
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
      {/* 배경: 전체화면 지도 */}
      <div className="absolute inset-0">
        <MapboxViewer ref={mapViewerRef} />
      </div>

      {/* 헤더 */}
      <header className="absolute inset-x-0 top-0 z-50 h-[3.75rem]">
        <SiteHeader
          siteName={site.name}
          mapStyle={mapStyle}
          onMapStyleChange={handleMapStyleChange}
        />
      </header>

      {/* 시나리오 버튼 */}
      {scenarioActive ? (
        <button
          onClick={() => {
            mapViewerRef.current?.resetEmergency();
            setScenarioActive(false);
          }}
          className="absolute bottom-6 right-6 z-50 rounded-lg bg-[#1E293B] px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-colors hover:bg-[#334155]"
        >
          시나리오 종료
        </button>
      ) : (
        <div className="absolute bottom-6 right-6 z-50 flex gap-3">
          <ScenarioButton
            label="시나리오 1"
            scenario={1}
            onTrigger={async (s) => {
              await mapViewerRef.current?.triggerEmergency(s);
              setScenarioActive(true);
            }}
          />
          <ScenarioButton
            label="시나리오 2"
            scenario={2}
            onTrigger={async (s) => {
              await mapViewerRef.current?.triggerEmergency(s);
              setScenarioActive(true);
            }}
          />
        </div>
      )}
    </div>
  );
}
