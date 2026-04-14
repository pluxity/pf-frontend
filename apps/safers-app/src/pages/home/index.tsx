import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/useIsMobile";
import { DashboardLayout } from "./DashboardLayout";
import { LeftPanel } from "./components/LeftPanel";
import { RightPanel } from "./components/RightPanel";
import { KoreaMap, type POI } from "./components/KoreaMap";
import { MobileHome } from "./components/MobileHome";
import { sitesService, eventsService, type Site } from "@/services";
import { STATUS_COLORS } from "@/styles/tokens";
import { parseWKTPolygonCentroid } from "@/utils/geo";
import { buildSiteStatusMap } from "./utils";

const DEFAULT_POI_COLOR = STATUS_COLORS.brand;
const WARNING_POI_COLOR = STATUS_COLORS.warning;
const DANGER_POI_COLOR = STATUS_COLORS.danger;

function siteToPOI(site: Site, siteStatusMap: Map<number, "warning" | "danger">): POI | null {
  let lng = site.longitude;
  let lat = site.latitude;

  if (lng == null || lat == null) {
    if (!site.location) return null;
    const centroid = parseWKTPolygonCentroid(site.location);
    if (!centroid) return null;
    lng = centroid.lng;
    lat = centroid.lat;
  }

  const status = siteStatusMap.get(site.id);
  const color =
    status === "danger"
      ? DANGER_POI_COLOR
      : status === "warning"
        ? WARNING_POI_COLOR
        : DEFAULT_POI_COLOR;

  return {
    id: String(site.id),
    longitude: lng,
    latitude: lat,
    color,
    size: 1.5,
    data: { name: site.name, region: site.region, status },
  };
}

export function DashboardPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [pois, setPois] = useState<POI[]>([]);

  useEffect(() => {
    if (isMobile) return; // 모바일에서는 대시보드 데이터 불필요
    async function fetchData() {
      const [sitesResult, eventsResult] = await Promise.allSettled([
        sitesService.getSites({ size: 1000 }),
        eventsService.getEvents(),
      ]);

      const sites = sitesResult.status === "fulfilled" ? sitesResult.value.data.content : [];
      const events = eventsResult.status === "fulfilled" ? eventsResult.value.data.content : [];

      const siteStatusMap = buildSiteStatusMap(events);
      const sitePOIs = sites
        .map((site) => siteToPOI(site, siteStatusMap))
        .filter((poi): poi is POI => poi !== null);
      setPois(sitePOIs);
    }
    fetchData();
  }, [isMobile]);

  if (isMobile) {
    return <MobileHome />;
  }

  const handlePOISiteClick = (poi: POI) => {
    navigate(`/site/${poi.id}`);
  };

  const handlePOICctvAIClick = (poi: POI) => {
    navigate(`/cctv-ai/${poi.id}`);
  };

  return (
    <DashboardLayout leftPanel={<LeftPanel />} rightPanel={<RightPanel />}>
      <KoreaMap
        className="w-full h-full"
        pois={pois}
        onPOISiteClick={handlePOISiteClick}
        onPOICctvAIClick={handlePOICctvAIClick}
      />
    </DashboardLayout>
  );
}
