import { GridLayout, Widget } from "@pf-dev/ui";
import type { GridTemplate } from "@pf-dev/ui";
import { HeaderTitle } from "./components/HeaderTitle";
import { HeaderClock } from "./components/HeaderClock";
import { HeaderUserInfo } from "./components/HeaderUserInfo";

// 24x12 그리드 템플릿 (FHD 기준 ~80px x ~85px per cell)
// 좌측: columns 1-6 (480px)
// 중앙(지도): columns 7-16 (800px) - 비워둠
// 우측: columns 17-24 (640px)
const dashboardTemplate: GridTemplate = {
  id: "dashboard-grid",
  name: "대시보드 그리드",
  columns: 24,
  rows: 12,
  cells: [
    // 좌측 패널 위젯들
    { id: "site-status", colStart: 1, colSpan: 8, rowStart: 1, rowSpan: 7 }, // 전국현황 (지도 영역으로 overflow)
    { id: "site-list", colStart: 1, colSpan: 6, rowStart: 8, rowSpan: 3 }, // 현장목록
    { id: "realtime-events", colStart: 1, colSpan: 6, rowStart: 11, rowSpan: 2 }, // 실시간 이벤트

    // 우측 패널 위젯들
    { id: "site-info", colStart: 17, colSpan: 8, rowStart: 1, rowSpan: 3 }, // 현장 정보 + 날씨
    { id: "env-data", colStart: 17, colSpan: 8, rowStart: 4, rowSpan: 2 }, // 환경 데이터
    { id: "safety-monitor", colStart: 17, colSpan: 8, rowStart: 6, rowSpan: 2 }, // 안전 모니터링
    { id: "cctv", colStart: 17, colSpan: 8, rowStart: 8, rowSpan: 5 }, // CCTV
  ],
};

interface DashboardLayoutGridProps {
  children?: React.ReactNode;
}

export function DashboardLayoutGrid({ children }: DashboardLayoutGridProps) {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-100">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-50 h-[3.75rem] bg-transparent">
        {/* 타이틀 - 정중앙 고정 */}
        <div className="absolute left-1/2 top-0 w-[30.625rem] -translate-x-1/2">
          <HeaderTitle logo="HOBAN" title="SUMMIT" subtitle="통합관제 플랫폼" />
        </div>

        {/* 좌우 요소 */}
        <div className="flex h-full items-center justify-between px-4">
          <HeaderClock />
          <HeaderUserInfo />
        </div>
      </header>

      {/* Main */}
      <main className="relative h-full w-full pt-[3.75rem]">
        {/* 지도 영역 - 뒤에 배치 */}
        <div className="absolute inset-0 z-0">{children}</div>

        {/* GridLayout - 투명 배경, 위젯만 클릭 가능 */}
        <GridLayout
          template={dashboardTemplate}
          gap={16}
          className="relative z-10 h-full w-full p-4 pointer-events-none"
        >
          {/* 좌측 위젯들 */}
          <Widget
            id="site-status"
            className="pointer-events-auto rounded-lg border border-neutral-300 bg-white/50 backdrop-blur-sm"
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold text-neutral-700">전국 현황</h3>
            </div>
          </Widget>

          <Widget
            id="site-list"
            className="pointer-events-auto rounded-lg border border-neutral-300 bg-white/50 backdrop-blur-sm"
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold text-neutral-700">현장 목록</h3>
            </div>
          </Widget>

          <Widget
            id="realtime-events"
            className="pointer-events-auto rounded-lg border border-neutral-300 bg-white/50 backdrop-blur-sm"
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold text-neutral-700">실시간 이벤트</h3>
            </div>
          </Widget>

          {/* 우측 위젯들 */}
          <Widget
            id="site-info"
            className="pointer-events-auto rounded-lg border border-neutral-300 bg-white/50 backdrop-blur-sm"
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold text-neutral-700">현장 정보 + 날씨</h3>
            </div>
          </Widget>

          <Widget
            id="env-data"
            className="pointer-events-auto rounded-lg border border-neutral-300 bg-white/50 backdrop-blur-sm"
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold text-neutral-700">환경 데이터</h3>
            </div>
          </Widget>

          <Widget
            id="safety-monitor"
            className="pointer-events-auto rounded-lg border border-neutral-300 bg-white/50 backdrop-blur-sm"
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold text-neutral-700">안전 모니터링</h3>
            </div>
          </Widget>

          <Widget
            id="cctv"
            className="pointer-events-auto rounded-lg border border-neutral-300 bg-white/50 backdrop-blur-sm"
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold text-neutral-700">CCTV</h3>
            </div>
          </Widget>
        </GridLayout>
      </main>
    </div>
  );
}
