import { useEffect, useState, useCallback, useRef } from "react";
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
} from "@/services";
import { useSitesStore, selectSelectedSiteId, selectSelectSiteAction } from "@/stores";
import { buildSiteStatusMap, countSiteStatuses } from "../utils";

const PAGE_SIZE = 20;

/** 대시보드 좌측 패널 - 현황, 지역 목록, 실시간 이벤트 표시 */
export function LeftPanel() {
  const [totalSites, setTotalSites] = useState(0);
  const [siteStatusCounts, setSiteStatusCounts] = useState({ normal: 0, warning: 0, danger: 0 });
  const [regionGroups, setRegionGroups] = useState<RegionGroup[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 무한스크롤 상태
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const pageRef = useRef(1);
  const totalElementsRef = useRef(0);

  const selectedSiteId = useSitesStore(selectSelectedSiteId);
  const selectSiteAction = useSitesStore(selectSelectSiteAction);

  async function fetchData() {
    setIsLoading(true);
    setError(null);
    pageRef.current = 1;

    try {
      const [sitesResult, regionsResult, eventsResult] = await Promise.allSettled([
        sitesService.getSites({ size: 1000 }),
        sitesService.getRegions(),
        eventsService.getEvents({ page: 1, size: PAGE_SIZE }),
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
        const eventPage = eventsResult.value.data;
        setEvents(eventPage.content);
        totalElementsRef.current = eventPage.totalElements;
        setHasMore(!eventPage.last);

        // 현장 상태 집계 (첫 페이지 기반)
        const siteStatusMap = buildSiteStatusMap(eventPage.content);
        setSiteStatusCounts(countSiteStatuses(sites, siteStatusMap));
      }
    } catch {
      setError("데이터를 불러오는 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  }

  const loadMoreEvents = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const nextPage = pageRef.current + 1;

    try {
      const result = await eventsService.getEvents({ page: nextPage, size: PAGE_SIZE });
      const eventPage = result.data;
      setEvents((prev) => [...prev, ...eventPage.content]);
      pageRef.current = nextPage;
      setHasMore(!eventPage.last);
    } catch {
      // 추가 로딩 실패 시 무시 — 다음 스크롤에서 재시도
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleSiteSelect = (site: Site) => {
    selectSiteAction(site.id);
  };

  const handleEventClick = (eventId: number) => {
    const event = events.find((e) => e.id === eventId);
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

      <div className="h-[20rem] w-[25rem]">
        <RealtimeEvents
          events={events}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={loadMoreEvents}
          onEventClick={handleEventClick}
        />
      </div>

      <EventDetailModal event={selectedEvent} open={modalOpen} onOpenChange={setModalOpen} />
    </aside>
  );
}
