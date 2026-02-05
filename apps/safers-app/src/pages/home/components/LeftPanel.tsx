import { useEffect, useState } from "react";
import { Spinner } from "@pf-dev/ui";
import { SiteStatistics } from "./SiteStatistics";
import { RegionSiteTree } from "./RegionSiteTree";
import { RealtimeEvents } from "./RealtimeEvents";
import {
  dashboardService,
  type SiteStatistics as SiteStatisticsType,
  type Region,
  type Event,
  type Site,
} from "@/services";

export function LeftPanel() {
  const [statistics, setStatistics] = useState<SiteStatisticsType | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, regionsRes, eventsRes] = await Promise.all([
          dashboardService.getStatistics(),
          dashboardService.getRegions(),
          dashboardService.getEvents(),
        ]);
        setStatistics(statsRes.data);
        setRegions(regionsRes.data);
        setEvents(eventsRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSiteSelect = (site: Site) => {
    console.log("Selected site:", site);
  };

  const handleEventClick = (eventId: string) => {
    console.log("Clicked event:", eventId);
  };

  if (isLoading) {
    return (
      <aside className="z-10 flex h-full w-[25rem] flex-shrink-0 items-center justify-center">
        <Spinner size="lg" />
      </aside>
    );
  }

  return (
    <aside className="z-10 flex h-full w-[25rem] flex-shrink-0 flex-col gap-4 p-4">
      {/* 전국 현황 (600px로 지도 위에 삐져나감) */}
      <div className="w-[37.5rem]">{statistics && <SiteStatistics data={statistics} />}</div>

      {/* 지역별 현장 목록 */}
      <div className="h-[29rem] w-[25rem] overflow-hidden rounded-lg backdrop-blur-sm">
        <RegionSiteTree regions={regions} onSiteSelect={handleSiteSelect} />
      </div>

      {/* 실시간 이벤트 */}
      <div className="h-[20rem] w-[25rem]">
        <RealtimeEvents events={events} onEventClick={handleEventClick} />
      </div>
    </aside>
  );
}
