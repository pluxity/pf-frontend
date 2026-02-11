import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner } from "@pf-dev/ui";
import { SiteHeader, MapboxViewer } from "./components";
import type { MapboxViewerHandle, MapStyleKey } from "./components";
import { sitesService, type Site } from "@/services";

export function SitePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [site, setSite] = useState<Site | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapStyle, setMapStyle] = useState<MapStyleKey>("day");
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
    </div>
  );
}
