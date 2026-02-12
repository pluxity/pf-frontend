import type { EventsResponse, EventResponse, GetEventsParams } from "./types/events.types";
import { mockEvents } from "./mocks/events.mock";

// API 기본 URL (나중에 실제 API로 변경)
const API_BASE_URL = "/api";

// Mock 모드 (true: mock 데이터, false: 실제 API)
const USE_MOCK = true;

// 지연 시뮬레이션 유틸
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 이벤트 목록 조회
 * GET /api/events
 */
async function getEvents(params?: GetEventsParams): Promise<EventsResponse> {
  if (USE_MOCK) {
    await delay(300);
    let filtered = [...mockEvents];

    if (params?.region) {
      filtered = filtered.filter((e) => e.site.region === params.region);
    }
    if (params?.level) {
      filtered = filtered.filter((e) => e.level === params.level);
    }
    if (params?.siteId) {
      filtered = filtered.filter((e) => e.site.id === params.siteId);
    }
    if (params?.limit) {
      filtered = filtered.slice(0, params.limit);
    }

    return { data: filtered };
  }

  // 실제 API 호출
  const queryParams = new URLSearchParams();
  if (params?.region) queryParams.set("region", params.region);
  if (params?.level) queryParams.set("level", params.level);
  if (params?.siteId) queryParams.set("siteId", String(params.siteId));
  if (params?.limit) queryParams.set("limit", String(params.limit));

  const response = await fetch(`${API_BASE_URL}/events?${queryParams}`);
  if (!response.ok) throw new Error("Failed to fetch events");
  return response.json();
}

/**
 * 이벤트 상세 조회
 * GET /api/events/:id
 */
async function getEvent(id: string): Promise<EventResponse> {
  if (USE_MOCK) {
    await delay(200);
    const event = mockEvents.find((e) => e.id === id);
    if (!event) throw new Error("Event not found");
    return { data: event };
  }

  const response = await fetch(`${API_BASE_URL}/events/${id}`);
  if (!response.ok) throw new Error("Failed to fetch event");
  return response.json();
}

export const eventsService = {
  getEvents,
  getEvent,
};
