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
import { buildSiteStatusMap, countSiteStatuses } from "../utils";

/** 대시보드 좌측 패널 - 현황, 지역 목록, 실시간 이벤트 표시 */
export function LeftPanel() {
  const [totalSites, setTotalSites] = useState(0);
  const [siteStatusCounts, setSiteStatusCounts] = useState({ normal: 0, warning: 0, danger: 0 });
  const [regionGroups, setRegionGroups] = useState<RegionGroup[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedSiteId = useSitesStore(selectSelectedSiteId);
  const selectSiteAction = useSitesStore(selectSelectSiteAction);

  async function fetchData() {
    setIsLoading(true);
    setError(null);

    try {
      // 각 API를 독립적으로 호출 — 하나가 실패해도 나머지는 동작
      const [sitesResult, regionsResult, eventsResult] = await Promise.allSettled([
        sitesService.getSites({ size: 1000 }),
        sitesService.getRegions(),
        eventsService.getEvents(),
      ]);

      const allFailed =
        sitesResult.status === "rejected" &&
        regionsResult.status === "rejected" &&
        eventsResult.status === "rejected";

      if (allFailed) {
        setError("데이터를 불러오지 못했습니다");
        setIsLoading(false);
        return;
      }

      const sites = sitesResult.status === "fulfilled" ? sitesResult.value.data.content : [];
      const totalElements =
        sitesResult.status === "fulfilled" ? sitesResult.value.data.totalElements : 0;
      setTotalSites(totalElements);

      // 최초 로드 시 "김포 풍무" 현장 자동 선택 (없으면 첫 번째 사이트)
      const currentSelected = useSitesStore.getState().selectedSiteId;
      if (currentSelected == null && sites.length > 0) {
        const gimpo = sites.find((s) => s.name.includes("김포 풍무"));
        useSitesStore.getState().selectSite(gimpo?.id ?? sites[0]!.id);
      }

      // 지역 목록으로 사이트 그룹핑
      if (regionsResult.status === "fulfilled") {
        const regions = regionsResult.value.data;
        const groups: RegionGroup[] = regions.map((r) => ({
          region: r.name,
          displayName: r.displayName || REGION_DISPLAY_NAMES[r.name as SiteRegion] || r.name,
          sites: sites.filter((s) => s.region === r.name),
        }));
        setRegionGroups(groups);
      }

      const allEvents = eventsResult.status === "fulfilled" ? eventsResult.value.data : [];
      setEvents(allEvents);

      // 이벤트 기반 현장 상태 집계
      const siteStatusMap = buildSiteStatusMap(allEvents);
      setSiteStatusCounts(countSiteStatuses(sites, siteStatusMap));
    } catch {
      setError("데이터를 불러오는 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleSiteSelect = (site: Site) => {
    selectSiteAction(site.id);
  };

  const handleEventClick = (_eventId: string) => {
    // TODO: 이벤트 클릭 시 상세 페이지 이동 구현
  };

  if (isLoading) {
    return (
      <aside className="z-10 flex h-full w-[25rem] flex-shrink-0 items-center justify-center">
        <Spinner size="lg" />
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="z-10 flex h-full w-[25rem] flex-shrink-0 flex-col items-center justify-center gap-3 p-4">
        <p className="text-sm text-error-brand">{error}</p>
        <button
          onClick={fetchData}
          className="rounded-md bg-brand px-4 py-2 text-sm text-white transition-colors hover:bg-brand/80"
        >
          다시 시도
        </button>
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
