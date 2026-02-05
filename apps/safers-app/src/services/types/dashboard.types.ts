// 현장 상태
export type SiteStatus = "normal" | "warning" | "danger";

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
    bg: "bg-amber-100 dark:bg-amber-100",
    text: "text-amber-700 dark:text-amber-700",
    label: "주의",
  },
  alert: {
    bg: "bg-orange-100 dark:bg-orange-100",
    text: "text-orange-700 dark:text-orange-700",
    label: "경고",
  },
  danger: {
    bg: "bg-red-100 dark:bg-red-100",
    text: "text-red-700 dark:text-red-700",
    label: "위험",
  },
};

// 지역 목록
export const REGIONS = ["서울", "경기", "강원", "충청", "전라", "경상"] as const;
export type RegionName = (typeof REGIONS)[number];

// 현장
export interface Site {
  id: string;
  name: string;
  status: SiteStatus;
}

// 지역
export interface Region {
  id: string;
  name: string;
  sites: Site[];
}

// 이벤트
export interface Event {
  id: string;
  level: EventLevel;
  code: string;
  message: string;
  region: string;
}

// 통계
export interface SiteStatistics {
  total: number;
  normal: number;
  warning: number;
  danger: number;
}

// API 응답
export interface DashboardStatisticsResponse {
  data: SiteStatistics;
}

export interface DashboardRegionsResponse {
  data: Region[];
}

export interface DashboardEventsResponse {
  data: Event[];
}
