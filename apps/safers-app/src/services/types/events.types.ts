import type { RegionName } from "./sites.types";

// 이벤트 레벨
export type EventLevel = "warning" | "alert" | "danger";

// 이벤트 레벨별 스타일
export interface EventLevelStyle {
  bg: string;
  text: string;
  label: string;
}

// 이벤트 레벨 스타일 맵
export const EVENT_LEVEL_STYLES: Record<EventLevel, EventLevelStyle> = {
  warning: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    label: "주의",
  },
  alert: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    label: "경고",
  },
  danger: {
    bg: "bg-red-100",
    text: "text-red-700",
    label: "위험",
  },
};

// 이벤트
export interface Event {
  id: string;
  level: EventLevel;
  code: string;
  message: string;
  region: RegionName;
  siteId: string;
  siteName: string;
  createdAt: string;
}

// API 응답
export interface EventsResponse {
  data: Event[];
}

export interface EventResponse {
  data: Event;
}

// API 요청 파라미터
export interface GetEventsParams {
  region?: string;
  level?: EventLevel;
  siteId?: string;
  limit?: number;
}

// 현장 비상 이벤트 (danger 레벨일 때 워커 데이터 포함)
export interface SiteEmergencyPayload {
  workerId: string;
  position: { lng: number; lat: number; altitude: number };
  vitals: { temperature: number; heartRate: number };
}

// WS로 수신되는 현장 이벤트
export interface SiteEvent extends Event {
  emergency?: SiteEmergencyPayload; // danger일 때만 포함
}
