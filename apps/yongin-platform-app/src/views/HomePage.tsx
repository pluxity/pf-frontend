import { useEffect } from "react";
import {
  Weather,
  Attendance,
  ProcessStatus,
  MainContent,
  KeyManagement,
  Goal,
  Announcement,
  BookmarkCctv,
  SafetyManagement,
  SafetyEquipment,
  IoTWidget,
} from "@/components/widgets";
import { PageSkeleton } from "@/components/PageSkeleton";
import { useDashboardStore, selectPage, selectIsPlaying } from "@/stores/dashboard.store";
import { useSystemSettings } from "@/hooks";

export function HomePage() {
  const page = useDashboardStore(selectPage);
  const isPlaying = useDashboardStore(selectIsPlaying);
  const next = useDashboardStore((select) => select.next);

  const { systemSettings, isLoading } = useSystemSettings();
  const interval = systemSettings?.rollingIntervalSeconds ?? 10;

  useEffect(() => {
    if (!isPlaying || interval <= 0) return;
    const timerId = setInterval(next, interval * 1000);
    return () => clearInterval(timerId);
  }, [isPlaying, next, interval, page]);

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="grid grid-cols-[23.3em_1fr_23.3rem] gap-4 px-5 pt-2 pb-[0.9375rem] h-full">
      <div className="relative min-h-0">
        <div
          className={`absolute inset-0 grid grid-rows-3 gap-5 transition-opacity ${page === 0 ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <Weather id="weather" />
          <Attendance id="attendance" />
          <ProcessStatus id="processStatus" />
        </div>
        <div
          className={`absolute inset-0 grid grid-rows-3 gap-5 transition-opacity  ${page === 1 ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <BookmarkCctv id="bookmarkCctv" />
          <SafetyManagement id="safetyManagement" />
          <SafetyEquipment id="safetyEquipment" />
        </div>
      </div>

      <MainContent id="mainContent" />

      <div className="relative min-h-0">
        <div
          className={`absolute inset-0 grid grid-rows-3 gap-5 transition-opacity ${page === 0 ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <KeyManagement id="keyManagement" />
          <Goal id="goal" />
          <Announcement id="announcement" />
        </div>
        <div
          className={`absolute inset-0 grid grid-rows-3 gap-5 transition-opacity ${page === 1 ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <IoTWidget id="iot1" />
          <IoTWidget id="iot2" />
          <IoTWidget id="iot3" />
        </div>
      </div>
    </div>
  );
}
