import { useEffect } from "react";
import {
  Weather,
  Attendance,
  ProcessStatus,
  MainContent,
  Management,
  Goal,
  Announcement,
} from "@/components/widgets";
import { useDashboardStore, selectPage, selectIsPlaying } from "@/stores/dashboard.store";

const INTERVAL_MS = 5000;

export function HomePage() {
  const page = useDashboardStore(selectPage);
  const isPlaying = useDashboardStore(selectIsPlaying);
  const next = useDashboardStore((select) => select.next);

  useEffect(() => {
    if (!isPlaying) return;

    const timerId = setInterval(next, INTERVAL_MS);
    return () => clearInterval(timerId);
  }, [isPlaying, next]);

  return (
    <div className="grid grid-cols-[5fr_14fr_5fr] gap-4 p-4 h-[calc(100vh-var(--header-height)-var(--footer-height))]">
      <div className="relative min-h-0">
        <div
          className={`absolute inset-0 grid grid-rows-3 gap-4 transition-opacity duration-500 ${page === 0 ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <Weather id="weather" />
          <Attendance id="attendance" />
          <ProcessStatus id="processStatus" />
        </div>
        <div
          className={`absolute inset-0 grid grid-rows-3 gap-4 transition-opacity duration-500 ${page === 1 ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          {/* TODO: 왼쪽 페이지 2 위젯 3개 */}
        </div>
      </div>

      <MainContent id="mainContent" />

      <div className="relative min-h-0">
        <div
          className={`absolute inset-0 grid grid-rows-3 gap-4 transition-opacity duration-500 ${page === 0 ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <Management id="management" />
          <Goal id="goal" />
          <Announcement id="announcement" />
        </div>
        <div
          className={`absolute inset-0 grid grid-rows-3 gap-4 transition-opacity duration-500 ${page === 1 ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          {/* TODO: 오른쪽 페이지 2 위젯 3개 */}
        </div>
      </div>
    </div>
  );
}
