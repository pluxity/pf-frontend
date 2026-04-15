import type { DataResponseBody, PageResponse, FileResponse } from "./common.types";
import type { SiteRegion } from "./sites.types";

// ─── Event API 타입 ───

export type EventCategory = "DETECTION" | "ROI";

export type EventType =
  | "NO_HELMET"
  | "HELMET"
  | "FALLEN_PERSON"
  | "INTRUSION"
  | "EXIT"
  | "LINE_CROSSING";

/** API 응답의 이벤트 내 현장 정보 */
export interface EventSite {
  id: number;
  name: string;
  region: SiteRegion;
}

/** GET /events 응답 아이템 */
export interface Event {
  id: number;
  eventId: string;
  timestamp: string;
  category: EventCategory;
  type: EventType;
  trackId: number;
  name: string;
  confidence: number;
  path: string;
  site: EventSite;
  snapshot?: FileResponse;
  video?: FileResponse;
}

// ─── API 응답/요청 ───

export type EventsResponse = DataResponseBody<PageResponse<Event>>;
export type EventDetailResponse = DataResponseBody<Event>;

export interface GetEventsParams {
  page?: number;
  size?: number;
  query?: string;
}

// ─── 이벤트 카테고리 조회 ───

export interface EventTypeInfo {
  name: EventType;
  displayName: string;
}

export interface EventCategoryInfo {
  name: EventCategory;
  displayName: string;
  types: EventTypeInfo[];
}

export type EventCategoriesResponse = DataResponseBody<EventCategoryInfo[]>;

// ─── 표시용 매핑 ───

/** 이벤트 타입 → 위험 등급 */
export const EVENT_TYPE_SEVERITY: Record<EventType, "danger" | "warning" | "info"> = {
  NO_HELMET: "danger",
  FALLEN_PERSON: "danger",
  INTRUSION: "warning",
  EXIT: "warning",
  LINE_CROSSING: "warning",
  HELMET: "info",
};

/** 위험 등급별 스타일 */
export const EVENT_SEVERITY_STYLES = {
  danger: { bg: "bg-red-100", text: "text-red-700", label: "위험" },
  warning: { bg: "bg-amber-100", text: "text-amber-700", label: "주의" },
  info: { bg: "bg-blue-100", text: "text-blue-700", label: "정보" },
} as const;

// ─── 탭용 지역 매핑 ───

export const EVENT_REGION_MAP: Record<SiteRegion, string> = {
  SEOUL: "서울",
  GYEONGGI_INCHEON: "경기",
  GANGWON: "강원",
  CHUNGCHEONG: "충청",
  JEOLLA: "전라",
  GYEONGSANG: "경상",
  JEJU: "제주",
};

export const EVENT_REGIONS = ["전체", ...Object.values(EVENT_REGION_MAP)] as const;
export type EventRegionTab = (typeof EVENT_REGIONS)[number];

/** 한글 지역 라벨 → SiteRegion key */
export const EVENT_REGION_LABEL_TO_KEY: Record<string, SiteRegion> = Object.fromEntries(
  Object.entries(EVENT_REGION_MAP).map(([key, label]) => [label, key as SiteRegion])
);

// ─── STOMP WebSocket 이벤트 타입 (기존 호환) ───

export type StompEventType = EventType;
export type StompEventCategory = EventCategory;

export interface StompEventResponse {
  eventId: string;
  id: number;
  name: string;
  type: StompEventType;
  category: StompEventCategory;
  confidence: number;
  timestamp: string;
  trackId: number;
  path: string;
  snapshot?: FileResponse;
  video?: FileResponse;
}

// ─── 현장 상태 (이벤트 기반) ───

export interface SiteEmergencyPayload {
  workerId: string;
  position: { lng: number; lat: number; altitude: number };
  vitals: { temperature: number; heartRate: number };
}

export interface SiteEvent extends Event {
  emergency?: SiteEmergencyPayload;
}
