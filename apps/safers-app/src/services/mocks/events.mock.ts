import type { Event } from "../types/events.types";

/**
 * 이벤트 mock 데이터
 *
 * 현장별 상태 (9개 현장 중 2곳에 이벤트):
 *   위험(danger) 1곳: 천안 일봉공원 2BL (ID 9)
 *   주의(warning) 1곳: 안동옥송 상록공원 (ID 12)
 *   정상(normal) 7곳: 나머지
 */
export const mockEvents: Event[] = [
  // ── 안동옥송 상록공원 (ID 12, GYEONGSANG) → 주의 ──
  {
    id: "e1",
    level: "warning",
    code: "ENV-01",
    message: "소음 기준치 초과 (92dB)",
    site: { id: 12, name: "안동옥송 상록공원", region: "GYEONGSANG" },
    createdAt: "2026-03-03T09:23:00Z",
  },
  {
    id: "e2",
    level: "alert",
    code: "SAF-03",
    message: "위험구역 진입 감지 (B구역)",
    site: { id: 12, name: "안동옥송 상록공원", region: "GYEONGSANG" },
    createdAt: "2026-03-03T09:18:00Z",
  },
  {
    id: "e3",
    level: "warning",
    code: "ENV-04",
    message: "총휘발성유기화합물 주의 단계 (620µg/m³)",
    site: { id: 12, name: "안동옥송 상록공원", region: "GYEONGSANG" },
    createdAt: "2026-03-03T08:45:00Z",
  },

  // ── 천안 일봉공원 2BL (ID 9, CHUNGCHEONG) → 위험 ──
  {
    id: "e4",
    level: "alert",
    code: "ENV-02",
    message: "미세먼지(PM10) 나쁨 단계 (120µg/m³)",
    site: { id: 9, name: "천안 일봉공원 2BL", region: "CHUNGCHEONG" },
    createdAt: "2026-03-03T09:30:00Z",
  },
  {
    id: "e5",
    level: "danger",
    code: "SAF-01",
    message: "안전모 미착용 작업자 다수 감지 (3명)",
    site: { id: 9, name: "천안 일봉공원 2BL", region: "CHUNGCHEONG" },
    createdAt: "2026-03-03T09:25:00Z",
  },
  {
    id: "e6",
    level: "warning",
    code: "ENV-01",
    message: "초미세먼지(PM2.5) 주의 단계 (28µg/m³)",
    site: { id: 9, name: "천안 일봉공원 2BL", region: "CHUNGCHEONG" },
    createdAt: "2026-03-03T08:50:00Z",
  },
];
