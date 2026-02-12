import { useEffect, useState } from "react";
import { Spinner } from "@pf-dev/ui";
import { SiteStatistics } from "./SiteStatistics";
import { RegionSiteTree } from "./RegionSiteTree";
import { RealtimeEvents } from "./RealtimeEvents";
import {
  eventsService,
  sitesService,
  type RegionGroup,
  type Event,
  type Site,
  REGION_DISPLAY_NAMES,
  type SiteRegion,
} from "@/services";
import { useSitesStore, selectSelectedSiteId, selectSelectSiteAction } from "@/stores";

/** 대시보드 좌측 패널 - 현황, 지역 목록, 실시간 이벤트 표시 */
export function LeftPanel() {
  const [totalSites, setTotalSites] = useState(0);
  const [siteStatusCounts, setSiteStatusCounts] = useState({ normal: 0, warning: 0, danger: 0 });
  const [regionGroups, setRegionGroups] = useState<RegionGroup[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const selectedSiteId = useSitesStore(selectSelectedSiteId);
  const selectSiteAction = useSitesStore(selectSelectSiteAction);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sitesRes, regionsRes, eventsRes] = await Promise.all([
          sitesService.getSites({ size: 1000 }),
          sitesService.getRegions(),
          eventsService.getEvents(),
        ]);

        const sites = sitesRes.data.content;
        setTotalSites(sitesRes.data.totalElements);

        // 최초 로드 시 id가 가장 낮은 사이트 자동 선택
        const currentSelected = useSitesStore.getState().selectedSiteId;
        if (currentSelected == null && sites.length > 0) {
          const minSite = sites.reduce((min, s) => (s.id < min.id ? s : min), sites[0]!);
          useSitesStore.getState().selectSite(minSite.id);
        }

        // 지역 목록으로 사이트 그룹핑
        const regions = regionsRes.data;
        const groups: RegionGroup[] = regions.map((r) => ({
          region: r.name,
          displayName: r.displayName || REGION_DISPLAY_NAMES[r.name as SiteRegion] || r.name,
          sites: sites.filter((s) => s.region === r.name),
        }));
        setRegionGroups(groups);

        const allEvents = eventsRes.data;
        setEvents(allEvents);

        // 이벤트 기반 현장 상태 집계
        const siteStatuses = new Map<number, "normal" | "warning" | "danger">();
        for (const site of sites) {
          siteStatuses.set(site.id, "normal");
        }
        for (const evt of allEvents) {
          const current = siteStatuses.get(evt.site.id);
          if (!current) continue;
          if (evt.level === "danger") {
            siteStatuses.set(evt.site.id, "danger");
          } else if (evt.level === "alert" || evt.level === "warning") {
            if (current !== "danger") {
              siteStatuses.set(evt.site.id, "warning");
            }
          }
        }
        const counts = { normal: 0, warning: 0, danger: 0 };
        for (const status of siteStatuses.values()) {
          counts[status]++;
        }
        setSiteStatusCounts(counts);
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
      <div className="w-[37.5rem]">
        <SiteStatistics
          totalSites={totalSites}
          normalSites={siteStatusCounts.normal}
          warningSites={siteStatusCounts.warning}
          dangerSites={siteStatusCounts.danger}
        />
      </div>

      <div className="h-[29rem] w-[25rem] overflow-hidden rounded-lg backdrop-blur-sm">
        <RegionSiteTree
          regionGroups={regionGroups}
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
