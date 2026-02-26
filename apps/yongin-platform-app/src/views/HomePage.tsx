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
import { useDashboardStore, selectPage, selectIsPlaying } from "@/stores/dashboard.store";
import { useSystemSettings } from "@/hooks";

export function HomePage() {
  const page = useDashboardStore(selectPage);
  const isPlaying = useDashboardStore(selectIsPlaying);
  const next = useDashboardStore((select) => select.next);

  const { systemSettings } = useSystemSettings();

  useEffect(() => {
    if (!isPlaying) return;
    const timerId = setInterval(next, (systemSettings?.rollingIntervalSeconds ?? 10) * 1000);
    return () => clearInterval(timerId);
  }, [isPlaying, next, systemSettings?.rollingIntervalSeconds]);

  return (
    <div className="grid grid-cols-[20rem_1fr_20rem] gap-4 px-4 py-2 h-full">
      <div className="relative min-h-0">
        <div
          className={`absolute inset-0 grid grid-rows-3 gap-4 transition-opacity ${page === 0 ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <Weather id="weather" />
          <Attendance id="attendance" />
          <ProcessStatus id="processStatus" />
        </div>
        <div
          className={`absolute inset-0 grid grid-rows-3 gap-4 transition-opacity  ${page === 1 ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <BookmarkCctv id="bookmarkCctv" />
          <SafetyManagement id="safetyManagement" />
          <SafetyEquipment id="safetyEquipment" />
        </div>
      </div>

      <MainContent id="mainContent" />

      <div className="relative min-h-0">
        <div
          className={`absolute inset-0 grid grid-rows-3 gap-4 transition-opacity ${page === 0 ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <KeyManagement id="keyManagement" />
          <Goal id="goal" />
          <Announcement id="announcement" />
        </div>
        <div
          className={`absolute inset-0 grid grid-rows-3 gap-4 transition-opacity ${page === 1 ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <IoT1 id="iot1" />
          <IoT2 id="iot2" />
          <IoT3 id="iot3" />
        </div>
      </div>
    </div>
  );
}
