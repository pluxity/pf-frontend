import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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

  const handlePOIInfoClick = (poi: POI) => {
    navigate(`/site/${poi.id}`);
  };

  return (
    <DashboardLayout leftPanel={<LeftPanel />} rightPanel={<RightPanel />}>
      <KoreaMap className="w-full h-full" pois={pois} onPOIInfoClick={handlePOIInfoClick} />
    </DashboardLayout>
  );
}
