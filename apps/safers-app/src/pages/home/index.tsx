import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "./DashboardLayout";
import { LeftPanel } from "./components/LeftPanel";
import { RightPanel } from "./components/RightPanel";
import { KoreaMap, type POI } from "./components/KoreaMap";
import { sitesService, eventsService, type Site, type Event } from "@/services";

const DEFAULT_POI_COLOR = "#4D7EFF";
const WARNING_POI_COLOR = "#F59E0B";
const DANGER_POI_COLOR = "#DE4545";

/** 이벤트 목록에서 사이트별 최고 심각도를 계산 */
function buildSiteStatusMap(events: Event[]): Map<number, "warning" | "danger"> {
  const statusMap = new Map<number, "warning" | "danger">();
  for (const evt of events) {
    const current = statusMap.get(evt.site.id);
    if (evt.level === "danger") {
      statusMap.set(evt.site.id, "danger");
    } else if ((evt.level === "alert" || evt.level === "warning") && current !== "danger") {
      statusMap.set(evt.site.id, "warning");
    }
  }
  return statusMap;
}

// Site를 POI로 변환 (이벤트 상태 반영)
function siteToPOI(site: Site, siteStatusMap: Map<number, "warning" | "danger">): POI | null {
  if (site.latitude == null || site.longitude == null) return null;

  const status = siteStatusMap.get(site.id);
  const color =
    status === "danger"
      ? DANGER_POI_COLOR
      : status === "warning"
        ? WARNING_POI_COLOR
        : DEFAULT_POI_COLOR;

  return {
    id: String(site.id),
    longitude: site.longitude,
    latitude: site.latitude,
    color,
    size: 1.5,
    data: { name: site.name, region: site.region, status },
  };
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [pois, setPois] = useState<POI[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sitesRes, eventsRes] = await Promise.all([
          sitesService.getSites({ size: 1000 }),
          eventsService.getEvents(),
        ]);
        const sites = sitesRes.data.content;
        const siteStatusMap = buildSiteStatusMap(eventsRes.data);
        const sitePOIs = sites
          .map((site) => siteToPOI(site, siteStatusMap))
          .filter((poi): poi is POI => poi !== null);
        setPois(sitePOIs);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    }
    fetchData();
  }, []);

  const handlePOIInfoClick = (poi: POI) => {
    navigate(`/site/${poi.id}`);
  };

  return (
    <DashboardLayout leftPanel={<LeftPanel />} rightPanel={<RightPanel />}>
      <KoreaMap className="w-full h-full" pois={pois} onPOIInfoClick={handlePOIInfoClick} />
    </DashboardLayout>
  );
}
