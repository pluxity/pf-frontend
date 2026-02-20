import { useEffect, useRef, useState } from "react";
import { useAuthStore, selectIsAuthenticated } from "@pf-dev/services";
import {
  stompService,
  type ConnectionStatus,
  type StompEventResponse,
  type DataResponseBody,
  type PageResponse,
} from "@/services";

const API_BASE_URL = "/api";
const MAX_EVENTS = 200;

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
 * 2. STOMP /topic/events 구독 — 새 이벤트 (snapshot 포함, video 미포함)
 * 3. STOMP /topic/event-videos 구독 — 영상 제작 완료 알림 (video 포함)
 */
export function useCCTVAIEvents() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const [events, setEvents] = useState<StompEventResponse[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [isLoading, setIsLoading] = useState(true);
  const unsubEventRef = useRef<(() => void) | null>(null);
  const unsubVideoRef = useRef<(() => void) | null>(null);

  // 1단계: REST API 초기 페칭
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    const fetchInitialEvents = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE_URL}/events?page=1&size=50`);
        if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`);

        const body = (await res.json()) as DataResponseBody<PageResponse<StompEventResponse>>;

        if (!cancelled) {
          const sorted = [...body.data.content].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setEvents(sorted);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[CCTV-AI] Failed to fetch initial events:", err);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchInitialEvents();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // 2단계: STOMP 구독 — 이벤트 + 영상 완료
  useEffect(() => {
    if (!isAuthenticated) return;

    stompService.connect((status) => {
      setConnectionStatus(status);

      if (status === "connected") {
        // 새 이벤트 (snapshot 포함)
        unsubEventRef.current = stompService.subscribe(TOPIC_EVENTS, (message) => {
          try {
            const event: StompEventResponse = JSON.parse(message.body);
            setEvents((prev) => upsertEvent(prev, event));
          } catch (e) {
            console.error("[CCTV-AI] Failed to parse event:", e);
          }
        });

        // 영상 제작 완료 알림 (video 포함)
        unsubVideoRef.current = stompService.subscribe(TOPIC_EVENT_VIDEOS, (message) => {
          try {
            const event: StompEventResponse = JSON.parse(message.body);
            setEvents((prev) => upsertEvent(prev, event));
          } catch (e) {
            console.error("[CCTV-AI] Failed to parse video event:", e);
          }
        });
      }
    });

    return () => {
      unsubEventRef.current?.();
      unsubVideoRef.current?.();
      stompService.disconnect();
    };
  }, [isAuthenticated]);

  return { events, connectionStatus, isLoading };
}
