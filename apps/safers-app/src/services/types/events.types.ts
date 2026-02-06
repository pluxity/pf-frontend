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

// 이벤트
export interface Event {
  id: string;
  level: EventLevel;
  code: string;
  message: string;
  region: string;
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
