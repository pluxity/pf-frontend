import { useEffect, useRef, useState } from "react";
import { useAuthStore, selectIsAuthenticated } from "@pf-dev/services";
import {
  stompService,
  type ConnectionStatus,
  type StompEventResponse,
  type DataResponseBody,
  type PageResponse,
} from "@/services";
import { API_BASE_URL, MAX_EVENTS } from "@/services/config";

// STOMP 토픽
const TOPIC_EVENTS = "/topic/events";
const TOPIC_EVENT_VIDEOS = "/topic/event-videos";

/**
 * 이벤트 목록을 upsert 방식으로 업데이트
 * - 동일 eventId가 있으면 병합 (video 필드 등 업데이트)
 * - 없으면 맨 앞에 추가
 */
function upsertEvent(
  prev: StompEventResponse[],
  incoming: StompEventResponse
): StompEventResponse[] {
  const idx = prev.findIndex((e) => e.eventId === incoming.eventId);

  if (idx >= 0) {
    // 기존 이벤트 업데이트 (병합)
    const updated = [...prev];
    updated[idx] = { ...updated[idx], ...incoming };
    return updated;
  }

  // 새 이벤트: 맨 앞에 추가
  return [incoming, ...prev].slice(0, MAX_EVENTS);
}

/**
 * CCTV AI 이벤트 Hook
 *
 * 1. REST API로 기존 이벤트 목록 페칭 (GET /api/events)
 * 2. query 변경 시 debounce REST 재조회 (LLM 자연어 검색)
 * 3. STOMP /topic/events 구독 — 새 이벤트 (snapshot 포함, video 미포함)
 * 4. STOMP /topic/event-videos 구독 — 영상 제작 완료 알림 (video 포함)
 * 5. 무한스크롤: loadMore()로 다음 페이지 append
 */
export function useCCTVAIEvents(query = "") {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const [events, setEvents] = useState<StompEventResponse[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const unsubEventRef = useRef<(() => void) | null>(null);
  const unsubVideoRef = useRef<(() => void) | null>(null);
  const stompBufferRef = useRef<StompEventResponse[]>([]);
  const queryRef = useRef(query);
  const nextPageRef = useRef(2);
  const isPaginatedRef = useRef(false);

  // REST 이벤트 페칭
  async function fetchEvents(q: string, page: number, signal: AbortSignal) {
    // 검색: LLM 호출 비용 고려 — 한 번에 전체 결과 반환 (페이지네이션 없음)
    // 일반: 무한스크롤용 20건씩
    const params = new URLSearchParams({ page: String(page), size: q ? "200" : "20" });
    if (q) params.set("query", q);

    const res = await fetch(`${API_BASE_URL}/events?${params}`, { signal });
    if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`);

    const body = (await res.json()) as DataResponseBody<PageResponse<StompEventResponse>>;
    const content = [...body.data.content].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return { content, last: body.data.last };
  }

  // queryRef 동기화 — STOMP 클로저 안에서 최신 query 참조용
  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  // REST 페칭: 초기 로드 + query 검색 + query 초기화 시 최신 재조회 통합
  useEffect(() => {
    if (!isAuthenticated) return;

    const controller = new AbortController();

    if (query) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSearching(true);
      fetchEvents(query, 1, controller.signal)
        .then(({ content }) => setEvents(content))
        .catch(() => {})
        .finally(() => setIsSearching(false));
    } else {
      setIsLoading(true);
      // 초기 로드 or 검색 초기화: 항상 page 1, 상태 리셋
      nextPageRef.current = 2;
      isPaginatedRef.current = false;
      fetchEvents("", 1, controller.signal)
        .then(({ content, last }) => {
          setEvents(() => {
            const restIds = new Set(content.map((e) => e.eventId));
            const onlyNew = stompBufferRef.current.filter((e) => !restIds.has(e.eventId));
            stompBufferRef.current = [];
            return [...onlyNew, ...content].slice(0, MAX_EVENTS);
          });
          setHasMore(!last);
          setPendingCount(0);
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }

    return () => controller.abort();
  }, [isAuthenticated, query]);

  // 2단계: STOMP 구독 — 이벤트 + 영상 완료
  useEffect(() => {
    if (!isAuthenticated) return;

    // StrictMode 첫 마운트 → 즉시 언마운트 시 connect 방지
    const timer = setTimeout(() => {
      stompService.connect((status) => {
        setConnectionStatus(status);

        if (status === "connected") {
          // 새 이벤트 (snapshot 포함)
          unsubEventRef.current = stompService.subscribe(TOPIC_EVENTS, (message) => {
            try {
              const event: StompEventResponse = JSON.parse(message.body);
              setEvents((prev) => {
                const isNew = !prev.some((e) => e.eventId === event.eventId);
                if (isNew) {
                  stompBufferRef.current = [event, ...stompBufferRef.current].slice(0, MAX_EVENTS);

                  if (queryRef.current !== "" || isPaginatedRef.current) {
                    // 검색 중 OR 페이지네이션 상태: pill 표시만
                    setPendingCount((c) => c + 1);
                  } else {
                    // page 1만 로드된 상태: REST 재조회 + 버퍼 얹기
                    const controller = new AbortController();
                    fetchEvents("", 1, controller.signal)
                      .then(({ content, last }) => {
                        setEvents(() => {
                          const restIds = new Set(content.map((e) => e.eventId));
                          const onlyNew = stompBufferRef.current.filter(
                            (e) => !restIds.has(e.eventId)
                          );
                          stompBufferRef.current = [];
                          return [...onlyNew, ...content].slice(0, MAX_EVENTS);
                        });
                        setHasMore(!last);
                      })
                      .catch(() => {});
                  }
                }
                return upsertEvent(prev, event);
              });
            } catch {
              // STOMP 이벤트 파싱 실패 — 무시
            }
          });

          // 영상 제작 완료 알림 (video 포함)
          unsubVideoRef.current = stompService.subscribe(TOPIC_EVENT_VIDEOS, (message) => {
            try {
              const event: StompEventResponse = JSON.parse(message.body);
              setEvents((prev) => upsertEvent(prev, event));
            } catch {
              // STOMP 비디오 이벤트 파싱 실패 — 무시
            }
          });
        }
      });
    }, 0);

    return () => {
      clearTimeout(timer);
      unsubEventRef.current?.();
      unsubVideoRef.current?.();
      stompService.disconnect();
    };
  }, [isAuthenticated]);

  function refreshToLatest() {
    nextPageRef.current = 2;
    isPaginatedRef.current = false;
    const controller = new AbortController();
    fetchEvents("", 1, controller.signal)
      .then(({ content, last }) => {
        setEvents(() => {
          const restIds = new Set(content.map((e) => e.eventId));
          const onlyNew = stompBufferRef.current.filter((e) => !restIds.has(e.eventId));
          stompBufferRef.current = [];
          return [...onlyNew, ...content].slice(0, MAX_EVENTS);
        });
        setHasMore(!last);
        setPendingCount(0);
      })
      .catch(() => {});
  }

  function loadMore() {
    if (isLoadingMore || !hasMore || query) return;
    const controller = new AbortController();
    setIsLoadingMore(true);
    fetchEvents("", nextPageRef.current, controller.signal)
      .then(({ content, last }) => {
        setEvents((prev) => {
          const existingIds = new Set(prev.map((e) => e.eventId));
          const newOnly = content.filter((e) => !existingIds.has(e.eventId));
          return [...prev, ...newOnly].slice(0, MAX_EVENTS);
        });
        setHasMore(!last);
        nextPageRef.current += 1;
        isPaginatedRef.current = true;
      })
      .catch(() => {})
      .finally(() => setIsLoadingMore(false));
  }

  return {
    events,
    connectionStatus,
    isLoading,
    isSearching,
    pendingCount,
    refreshToLatest,
    hasMore,
    isLoadingMore,
    loadMore,
  };
}
