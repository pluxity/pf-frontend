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
  IoT1,
  IoT2,
  IoT3,
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
    <div className="grid grid-cols-[20rem_1fr_20rem] gap-5 px-5 pt-5 pb-[0.9375rem] h-full">
      <div className="relative min-h-0">
        <div
          className={`absolute inset-0 grid grid-rows-[repeat(3,18.75rem)] content-center gap-5 transition-opacity ${page === 0 ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <Weather id="weather" />
          <Attendance id="attendance" />
          <ProcessStatus id="processStatus" />
        </div>
        <div
          className={`absolute inset-0 grid grid-rows-[repeat(3,18.75rem)] content-center gap-5 transition-opacity  ${page === 1 ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <BookmarkCctv id="bookmarkCctv" />
          <SafetyManagement id="safetyManagement" />
          <SafetyEquipment id="safetyEquipment" />
        </div>
      </div>

      <MainContent id="mainContent" />

      <div className="relative min-h-0">
        <div
          className={`absolute inset-0 grid grid-rows-[repeat(3,18.75rem)] content-center gap-5 transition-opacity ${page === 0 ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <KeyManagement id="keyManagement" />
          <Goal id="goal" />
          <Announcement id="announcement" />
        </div>
        <div
          className={`absolute inset-0 grid grid-rows-[repeat(3,18.75rem)] content-center gap-5 transition-opacity ${page === 1 ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <IoT1 id="iot1" />
          <IoT2 id="iot2" />
          <IoT3 id="iot3" />
        </div>
      </div>
    </div>
  );
}
