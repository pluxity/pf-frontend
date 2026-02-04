import { DashboardLayout } from "./DashboardLayout";
import { LeftPanel } from "./components/LeftPanel";
import { RightPanel } from "./components/RightPanel";

// 1안: Flex 기반 레이아웃
export function DashboardPage() {
  return (
    <DashboardLayout leftPanel={<LeftPanel />} rightPanel={<RightPanel />}>
      {/* 중앙 지도 영역 */}
    </DashboardLayout>
  );
}

// 2안: GridLayout 기반 레이아웃
export { GridDashboardPage } from "./GridDashboardPage";
