export function RightPanel() {
  return (
    <aside className="z-10 flex h-full w-[43.75rem] flex-shrink-0 flex-col gap-4 p-4">
      {/* 현장 정보 + 날씨 */}
      <div className="rounded-lg border border-neutral-300 bg-white/50 p-4">
        <div className="h-[8rem]">{/* 현장 정보 + 날씨 영역 */}</div>
      </div>

      {/* 환경 데이터 */}
      <div className="rounded-lg border border-neutral-300 bg-white/50 p-4">
        <div className="h-[6rem]">{/* 환경 데이터 영역 */}</div>
      </div>

      {/* 안전 모니터링 */}
      <div className="rounded-lg border border-neutral-300 bg-white/50 p-4">
        <div className="h-[6rem]">{/* 안전 모니터링 영역 */}</div>
      </div>

      {/* CCTV */}
      <div className="flex-1 rounded-lg border border-neutral-300 bg-white/50 p-4">
        {/* CCTV 영역 */}
      </div>
    </aside>
  );
}
