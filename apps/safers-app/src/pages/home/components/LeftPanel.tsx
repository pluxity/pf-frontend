import { useEffect, useState, useCallback, useMemo } from "react";
import { Spinner } from "@pf-dev/ui";
import { SiteStatistics } from "./SiteStatistics";
import { RegionSiteTree } from "./RegionSiteTree";
import { RealtimeEvents } from "./RealtimeEvents";
import { EventDetailModal } from "./EventDetailModal";
import {
  eventsService,
  sitesService,
  type RegionGroup,
  type Event,
  type Site,
  REGION_DISPLAY_NAMES,
  type SiteRegion,
  type EventRegionTab,
  EVENT_REGION_LABEL_TO_KEY,
  EVENT_REGIONS,
} from "@/services";
import { useSitesStore, selectSelectedSiteId, selectSelectSiteAction } from "@/stores";
import { buildSiteStatusMap, countSiteStatuses } from "../utils";

const PAGE_SIZE = 20;

/** 대시보드 좌측 패널 - 현황, 지역 목록, 실시간 이벤트 표시 */
export function LeftPanel() {
  const [totalSites, setTotalSites] = useState(0);
  const [allSites, setAllSites] = useState<Site[]>([]);
  const [regionGroups, setRegionGroups] = useState<RegionGroup[]>([]);
  // 백엔드는 오늘자 전체 이벤트만 제공 → 한 번 fetch 후 클라이언트에서 region 필터링/페이지네이션
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeRegion, setActiveRegion] = useState<EventRegionTab>(EVENT_REGIONS[0]);
  // 클라이언트 사이드 페이지네이션
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const selectedSiteId = useSitesStore(selectSelectedSiteId);
  const selectSiteAction = useSitesStore(selectSelectSiteAction);

  async function fetchData() {
    setIsLoading(true);
    setError(null);

    try {
      const [sitesResult, regionsResult, eventsResult] = await Promise.allSettled([
        sitesService.getSites({ size: 1000 }),
        sitesService.getRegions(),
        eventsService.getEvents({ page: 1, size: 1000 }),
      ]);

      const allFailed = sitesResult.status === "rejected" && regionsResult.status === "rejected";

      if (allFailed) {
        setError("데이터를 불러오지 못했습니다");
        setIsLoading(false);
        return;
      }

      const sites = sitesResult.status === "fulfilled" ? sitesResult.value.data.content : [];
      const totalElements =
        sitesResult.status === "fulfilled" ? sitesResult.value.data.totalElements : 0;
      setTotalSites(totalElements);
      setAllSites(sites);

      const currentSelected = useSitesStore.getState().selectedSiteId;
      if (currentSelected == null && sites.length > 0) {
        const daegu = sites.find((s) => s.name.includes("대구 황금동"));
        useSitesStore.getState().selectSite(daegu?.id ?? sites[0]!.id);
      }

      if (regionsResult.status === "fulfilled") {
        const regions = regionsResult.value.data;
        const groups: RegionGroup[] = regions.map((r) => ({
          region: r.name,
          displayName: r.displayName || REGION_DISPLAY_NAMES[r.name as SiteRegion] || r.name,
          sites: sites.filter((s) => s.region === r.name),
        }));
        setRegionGroups(groups);
      }

      if (eventsResult.status === "fulfilled") {
        setAllEvents(eventsResult.value.data.content);
      }
    } catch {
      setError("데이터를 불러오는 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // 지역 변경 시 페이지 초기화
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeRegion]);

  // 활성 region으로 필터링된 전체 이벤트
  const filteredEvents = useMemo(() => {
    if (activeRegion === "전체") return allEvents;
    const regionKey = EVENT_REGION_LABEL_TO_KEY[activeRegion];
    return allEvents.filter((e) => e.site.region === regionKey);
  }, [allEvents, activeRegion]);

  // 화면에 보여줄 이벤트 (클라이언트 페이지네이션)
  const visibleEvents = useMemo(
    () => filteredEvents.slice(0, visibleCount),
    [filteredEvents, visibleCount]
  );
  const hasMore = visibleCount < filteredEvents.length;

  const loadMoreEvents = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  }, []);

  // KPI 집계 (danger > warning > normal)
  const siteStatusCounts = useMemo(
    () => countSiteStatuses(allSites, buildSiteStatusMap(allEvents)),
    [allSites, allEvents]
  );

  const handleSiteSelect = (site: Site) => {
    selectSiteAction(site.id);
  };

  const handleEventClick = (eventId: number) => {
    const event = allEvents.find((e) => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
      setModalOpen(true);
    }
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

      <div className="h-[20rem] min-h-0 w-[25rem] overflow-hidden">
        <RealtimeEvents
          events={visibleEvents}
          hasMore={hasMore}
          isLoadingMore={false}
          onLoadMore={loadMoreEvents}
          onEventClick={handleEventClick}
          activeRegion={activeRegion}
          onRegionChange={setActiveRegion}
        />
      </div>

      <EventDetailModal event={selectedEvent} open={modalOpen} onOpenChange={setModalOpen} />
    </aside>
  );
}
