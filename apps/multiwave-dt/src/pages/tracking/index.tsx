import { Header } from "@/components/layout";
import {
  OverviewPanel,
  EventLog,
  EventSnapshotPanel,
  VideoSearchButton,
} from "@/components/sidebar";

export function TrackingPage() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-900">
      {/* 지도 영역 - Placeholder */}
      <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-slate-800">
        <div className="text-slate-500 text-sm">지도 영역 (추후 구현)</div>
      </div>

      {/* 헤더 */}
      <Header />

      {/* 좌측 사이드바 */}
      <div className="absolute left-4 top-[4.5rem] bottom-4 w-96 z-30 flex flex-col gap-3">
        {/* 1. 종합상황 패널 */}
        <div className="h-44">
          <OverviewPanel />
        </div>

        {/* 2. 이벤트 로그 패널 */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <EventLog />
        </div>

        {/* 3. 이벤트 스냅샷 패널 */}
        <div className="h-72">
          <EventSnapshotPanel />
        </div>

        {/* 4. 영상기록 검색 버튼 */}
        <div>
          <VideoSearchButton />
        </div>
      </div>
    </div>
  );
}
