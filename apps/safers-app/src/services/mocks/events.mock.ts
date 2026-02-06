import type { Event } from "../types/events.types";

/** 실시간 이벤트 목 데이터 */
export const mockEvents: Event[] = [
  // 서울 - 개봉 5구역 (warning)
  {
    id: "e1",
    level: "warning",
    code: "D-5",
    message: "위험계기구부 알림",
    region: "서울",
    siteId: "26",
    siteName: "개봉 5구역",
    createdAt: "2026-02-06T09:30:00Z",
  },

  // 경기 - 화성비봉 (warning)
  {
    id: "e2",
    level: "warning",
    code: "A-1",
    message: "가스 누출 감지",
    region: "경기",
    siteId: "28",
    siteName: "화성비봉",
    createdAt: "2026-02-06T09:20:00Z",
  },

  // 충청 - 당진수청3차 (danger)
  {
    id: "e3",
    level: "danger",
    code: "C-5",
    message: "구조물 붕괴 위험 감지",
    region: "충청",
    siteId: "29",
    siteName: "당진수청3차",
    createdAt: "2026-02-06T09:00:00Z",
  },
  {
    id: "e4",
    level: "alert",
    code: "D-2",
    message: "전기 합선 경고",
    region: "충청",
    siteId: "29",
    siteName: "당진수청3차",
    createdAt: "2026-02-06T08:55:00Z",
  },

  // 경상 - 안동옥송 상록공원 (warning)
  {
    id: "e5",
    level: "warning",
    code: "B-1",
    message: "온도 이상 상승 감지",
    region: "경상",
    siteId: "39",
    siteName: "안동옥송 상록공원",
    createdAt: "2026-02-06T08:45:00Z",
  },

  // 경상 - 대구칠성 주상복합 (danger)
  {
    id: "e6",
    level: "danger",
    code: "A-5",
    message: "화재 발생 긴급 알림",
    region: "경상",
    siteId: "36",
    siteName: "대구칠성 주상복합",
    createdAt: "2026-02-06T09:15:00Z",
  },
  {
    id: "e7",
    level: "alert",
    code: "B-3",
    message: "고온 위험 레벨 초과",
    region: "경상",
    siteId: "36",
    siteName: "대구칠성 주상복합",
    createdAt: "2026-02-06T09:10:00Z",
  },
];
