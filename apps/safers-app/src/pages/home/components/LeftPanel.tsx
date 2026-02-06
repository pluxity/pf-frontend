import { useEffect, useState } from "react";
import { Spinner } from "@pf-dev/ui";
import { SiteStatistics } from "./SiteStatistics";
import { RegionSiteTree } from "./RegionSiteTree";
import { RealtimeEvents } from "./RealtimeEvents";
import {
  eventsService,
  sitesService,
  type SiteStatistics as SiteStatisticsType,
  type Region,
  type Event,
  type Site,
} from "@/services";
import { useSitesStore, selectSelectedSiteId, selectSelectSiteAction } from "@/stores";

/** 대시보드 좌측 패널 - 현황, 지역 목록, 실시간 이벤트 표시 */
export function LeftPanel() {
  const [statistics, setStatistics] = useState<SiteStatisticsType | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const selectedSiteId = useSitesStore(selectSelectedSiteId);
  const selectSiteAction = useSitesStore(selectSelectSiteAction);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, regionsRes, eventsRes] = await Promise.all([
          sitesService.getStatistics(),
          sitesService.getRegions(),
          eventsService.getEvents(),
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
    if (selectedSiteId === site.id) {
      selectSiteAction(null);
    } else {
      selectSiteAction(site.id);
    }
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
      <div className="w-[37.5rem]">{statistics && <SiteStatistics data={statistics} />}</div>

      <div className="h-[29rem] w-[25rem] overflow-hidden rounded-lg backdrop-blur-sm">
        <RegionSiteTree
          regions={regions}
          onSiteSelect={handleSiteSelect}
          selectedSiteId={selectedSiteId ?? undefined}
        />
      </div>

      <div className="h-[20rem] w-[25rem]">
        <RealtimeEvents events={events} onEventClick={handleEventClick} />
      </div>
    </aside>
  );
}
