import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "./DashboardLayout";
import { LeftPanel } from "./components/LeftPanel";
import { RightPanel } from "./components/RightPanel";
import { KoreaMap, type POI } from "./components/KoreaMap";
import { sitesService, eventsService, type Site } from "@/services";
import { STATUS_COLORS } from "@/styles/tokens";
import { buildSiteStatusMap } from "./utils";

const DEFAULT_POI_COLOR = STATUS_COLORS.brand;
const WARNING_POI_COLOR = STATUS_COLORS.warning;
const DANGER_POI_COLOR = STATUS_COLORS.danger;

function parseWKTPolygonCentroid(wkt: string): { lng: number; lat: number } | null {
  const match = wkt.match(/POLYGON\s*\(\((.+)\)\)/i);
  if (!match?.[1]) return null;

  const coords = match[1].split(",").map((pair) => {
    const [lng, lat] = pair.trim().split(/\s+/).map(Number);
    return { lng: lng!, lat: lat! };
  });

  if (coords.length === 0) return null;

  const ring =
    coords.length > 1 &&
    coords[0]!.lng === coords[coords.length - 1]!.lng &&
    coords[0]!.lat === coords[coords.length - 1]!.lat
      ? coords.slice(0, -1)
      : coords;

  if (ring.length === 0) return null;

  const sum = ring.reduce((acc, c) => ({ lng: acc.lng + c.lng, lat: acc.lat + c.lat }), {
    lng: 0,
    lat: 0,
  });
  return { lng: sum.lng / ring.length, lat: sum.lat / ring.length };
}

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
  const [pois, setPois] = useState<POI[]>([]);

  useEffect(() => {
    async function fetchData() {
      const [sitesResult, eventsResult] = await Promise.allSettled([
        sitesService.getSites({ size: 1000 }),
        eventsService.getEvents(),
      ]);

      const sites = sitesResult.status === "fulfilled" ? sitesResult.value.data.content : [];
      const events = eventsResult.status === "fulfilled" ? eventsResult.value.data : [];

      const siteStatusMap = buildSiteStatusMap(events);
      const sitePOIs = sites
        .map((site) => siteToPOI(site, siteStatusMap))
        .filter((poi): poi is POI => poi !== null);
      setPois(sitePOIs);
    }
    fetchData();
  }, []);

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
