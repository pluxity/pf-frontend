import type { Event } from "../types/events.types";

/** 실시간 이벤트 목 데이터 */
export const mockEvents: Event[] = [
  {
    id: "e1",
    level: "warning",
    code: "A-5",
    message: "화재 발생 긴급 알림",
    site: { id: 6, name: "대구칠성 주상복합", region: "GYEONGSANG" },
    createdAt: "2026-02-06T09:15:00Z",
  },
];
