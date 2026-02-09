interface SiteDetailLayoutProps {
  header: React.ReactNode;
  leftPanel: React.ReactNode;
  rightTopPanel: React.ReactNode;
  rightMiddlePanel: React.ReactNode;
  rightBottomPanel: React.ReactNode;
  children?: React.ReactNode;
}

export function SiteDetailLayout({
  header,
  leftPanel,
  rightTopPanel,
  rightMiddlePanel,
  rightBottomPanel,
  children,
}: SiteDetailLayoutProps) {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* 배경: 전체화면 지도/3D */}
      <div className="absolute inset-0">{children}</div>

      {/* 헤더: 최상단 오버레이 */}
      <header className="absolute inset-x-0 top-0 z-50 h-[3.75rem]">{header}</header>

      {/* 좌측 패널 */}
      <aside className="absolute bottom-[1.25rem] left-[1.25rem] top-[5rem] z-10 w-[21.5625rem]">
        {leftPanel}
      </aside>

      {/* 우측 패널 영역 */}
      <div className="absolute right-[1.25rem] top-[5rem] z-10 flex flex-col gap-[1.25rem]">
        <div className="h-[15.625rem] w-[28.75rem]">{rightTopPanel}</div>
        <div className="h-[21.25rem] w-[18.75rem] self-end">{rightMiddlePanel}</div>
        <div className="h-[19.375rem] w-[18.75rem] self-end">{rightBottomPanel}</div>
      </div>
    </div>
  );
}
