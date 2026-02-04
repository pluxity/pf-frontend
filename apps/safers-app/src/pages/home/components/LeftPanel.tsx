export function LeftPanel() {
  return (
    <aside className="z-10 flex h-full w-[25rem] flex-shrink-0 flex-col gap-4 p-4">
      {/* 전국 현황 (600px로 지도 위에 삐져나감) */}
      <div className="w-[37.5rem] rounded-lg border border-neutral-300 bg-white/50 p-4">
        <div className="h-[6rem]">{/* 전국 현황 영역 */}</div>
      </div>

      {/* 지역별 현장 목록 */}
      <div className="flex-1 rounded-lg border border-neutral-300 bg-white/50">
        {/* 지역별 현장 목록 영역 */}
      </div>

      {/* 실시간 이벤트 */}
      <div className="h-[12rem] rounded-lg border border-neutral-300 bg-white/50">
        {/* 실시간 이벤트 영역 */}
      </div>
    </aside>
  );
}
