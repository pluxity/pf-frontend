import { useEffect, useState } from "react";
import { DashboardLayout } from "./DashboardLayout";
import { LeftPanel } from "./components/LeftPanel";
import { RightPanel } from "./components/RightPanel";
import { KoreaMap, type POI } from "./components/KoreaMap";
import { sitesService, type Site, type SiteStatus } from "@/services";

// 상태별 색상
const STATUS_COLORS: Record<SiteStatus, string> = {
  normal: "#00C48C", // 녹색
  warning: "#FFCC00", // 노란색
  danger: "#DE4545", // 빨강
};

// Site를 POI로 변환
function siteToPOI(site: Site): POI | null {
  if (site.latitude == null || site.longitude == null) return null;

  return {
    id: site.id,
    longitude: site.longitude,
    latitude: site.latitude,
    color: STATUS_COLORS[site.status],
    size: 1.5,
    data: { name: site.name, status: site.status, regionId: site.regionId },
  };
}

export function DashboardPage() {
  const [pois, setPois] = useState<POI[]>([]);

  useEffect(() => {
    async function fetchSites() {
      try {
        const res = await sitesService.getSites();
        const sitePOIs = res.data.map(siteToPOI).filter((poi): poi is POI => poi !== null);
        setPois(sitePOIs);
      } catch (error) {
        console.error("Failed to fetch sites:", error);
      }
    }
    fetchSites();
  }, []);

  const handlePOIClick = (poi: POI) => {
    console.log("Site clicked:", poi.data);
  };

  const handlePOIHover = (poi: POI | null) => {
    if (poi) {
      console.log("Site hover:", poi.data?.name);
    }
  };

  return (
    <DashboardLayout leftPanel={<LeftPanel />} rightPanel={<RightPanel />}>
      <KoreaMap
        className="w-full h-full"
        pois={pois}
        onPOIClick={handlePOIClick}
        onPOIHover={handlePOIHover}
      />
    </DashboardLayout>
  );
}
