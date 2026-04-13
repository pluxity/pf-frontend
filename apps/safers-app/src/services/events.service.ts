import type {
  EventsResponse,
  EventDetailResponse,
  EventCategoriesResponse,
  GetEventsParams,
} from "./types/events.types";
import { API_BASE_URL } from "./config";

/**
 * 이벤트 목록 조회
 * GET /api/events
 */
async function getEvents(params?: GetEventsParams): Promise<EventsResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page != null) queryParams.set("page", String(params.page));
  if (params?.size != null) queryParams.set("size", String(params.size));
  if (params?.query) queryParams.set("query", params.query);

  const response = await fetch(`${API_BASE_URL}/events?${queryParams}`);
  if (!response.ok) throw new Error(`Failed to fetch events: ${response.status}`);
  return response.json();
}

/**
 * 이벤트 상세 조회
 * GET /api/events/:id
 */
async function getEvent(id: number): Promise<EventDetailResponse> {
  const response = await fetch(`${API_BASE_URL}/events/${id}`);
  if (!response.ok) throw new Error(`Failed to fetch event: ${response.status}`);
  return response.json();
}

/**
 * 이벤트 카테고리 목록 조회
 * GET /api/events/categories
 */
async function getCategories(): Promise<EventCategoriesResponse> {
  const response = await fetch(`${API_BASE_URL}/events/categories`);
  if (!response.ok) throw new Error(`Failed to fetch event categories: ${response.status}`);
  return response.json();
}

export const eventsService = {
  getEvents,
  getEvent,
  getCategories,
};
