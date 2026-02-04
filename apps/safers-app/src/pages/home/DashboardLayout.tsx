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
      <main className="flex h-full w-full pt-[3.75rem]">
        {/* 좌측 패널 */}
        {leftPanel}

        {/* 중앙 영역 */}
        <div className="relative flex-1">{children}</div>

        {/* 우측 패널 */}
        {rightPanel}
      </main>
    </div>
  );
}
