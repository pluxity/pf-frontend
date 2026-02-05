import { DashboardLayout } from "./DashboardLayout";
import { LeftPanel } from "./components/LeftPanel";
import { RightPanel } from "./components/RightPanel";
import { KoreaMap, type POI } from "./components/KoreaMap";

// 테스트용 POI 데이터 (size: rem 단위 마커 높이)
const testPOIs: POI[] = [
  { id: "poi-1", longitude: 126.978, latitude: 37.566, label: "서울", color: "#4D7EFF", size: 2 },
  { id: "poi-2", longitude: 129.076, latitude: 35.18, label: "부산", color: "#DE4545", size: 2 },
  { id: "poi-3", longitude: 126.705, latitude: 37.456, label: "인천", color: "#00C48C", size: 2 },
  { id: "poi-4", longitude: 127.385, latitude: 36.35, label: "대전", color: "#FFA26B", size: 2 },
  { id: "poi-5", longitude: 126.531, latitude: 33.5, label: "제주", color: "#9B59B6", size: 2 },
];

export function DashboardPage() {
  const handlePOIClick = (poi: POI) => {
    console.log("POI clicked:", poi);
  };

  const handlePOIHover = (poi: POI | null) => {
    if (poi) {
      console.log("POI hover:", poi.label);
    }
  };

  return (
    <DashboardLayout leftPanel={<LeftPanel />} rightPanel={<RightPanel />}>
      <KoreaMap
        className="w-full h-full"
        pois={testPOIs}
        onPOIClick={handlePOIClick}
        onPOIHover={handlePOIHover}
      />
    </DashboardLayout>
  );
}
