import { HeaderTitle } from "./components/HeaderTitle";
import { HeaderClock } from "./components/HeaderClock";
import { HeaderUserInfo } from "./components/HeaderUserInfo";

interface DashboardLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  children?: React.ReactNode;
}

export function DashboardLayout({ leftPanel, rightPanel, children }: DashboardLayoutProps) {
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
      <main className="relative h-full w-full">
        {/* 중앙 영역 (전체 배경) - 헤더 뒤까지 확장 */}
        <div className="absolute inset-0">{children}</div>

        {/* 좌측 패널 (오버레이) */}
        <div className="absolute left-0 top-[3.75rem] bottom-0 z-10">{leftPanel}</div>

        {/* 우측 패널 (오버레이) */}
        <div className="absolute right-0 top-[3.75rem] bottom-0 z-10">{rightPanel}</div>
      </main>
    </div>
  );
}
