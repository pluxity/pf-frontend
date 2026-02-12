import type { SiteRegion } from "./sites.types";

// 이벤트 탭 표시용 지역명 매핑 (SiteRegion → 한글)
export const EVENT_REGION_MAP: Record<SiteRegion, string> = {
  SEOUL: "서울",
  GYEONGGI_INCHEON: "경기",
  GANGWON: "강원",
  CHUNGCHEONG: "충청",
  JEOLLA: "전라",
  GYEONGSANG: "경상",
  JEJU: "제주",
};

// 이벤트 탭 목록
export const EVENT_REGIONS = Object.values(EVENT_REGION_MAP);
export type EventRegionTab = (typeof EVENT_REGIONS)[number];

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

// 이벤트에 포함되는 현장 정보
export interface EventSite {
  id: number;
  name: string;
  region: SiteRegion;
}

// 이벤트
export interface Event {
  id: string;
  level: EventLevel;
  code: string;
  message: string;
  site: EventSite;
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
  region?: SiteRegion;
  level?: EventLevel;
  siteId?: number;
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
