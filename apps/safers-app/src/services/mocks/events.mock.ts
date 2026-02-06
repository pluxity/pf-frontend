import type { Event } from "../types/events.types";

// warning/danger 상태의 site들에만 이벤트 생성
// s2 (구로구 개봉) - warning, 서울
// g1 (성남시 분당구) - warning, 경기
// g3 (평택시 송탄) - danger, 경기
// gw2 (원주시 단계동) - warning, 강원
// c1 (대전시 유성구) - danger, 충청
// gs2 (대구시 수성구) - warning, 경상
// gs4 (경주시 동천동) - warning, 경상
// j2 (전주시 완산구) - warning, 전라
// j4 (군산시 나운동) - danger, 전라

export const mockEvents: Event[] = [
  // 서울 - s2 (구로구 개봉, warning)
  {
    id: "e1",
    level: "warning",
    code: "D-5",
    message: "위험계기구부 알림",
    region: "서울",
    siteId: "s2",
    siteName: "구로구 개봉",
    createdAt: "2026-02-06T09:30:00Z",
  },
  {
    id: "e2",
    level: "alert",
    code: "B-2",
    message: "일산화탄소 누출 경고 레벨 감지",
    region: "서울",
    siteId: "s2",
    siteName: "구로구 개봉",
    createdAt: "2026-02-06T09:25:00Z",
  },

  // 경기 - g1 (성남시 분당구, warning)
  {
    id: "e3",
    level: "warning",
    code: "A-1",
    message: "가스 누출 감지",
    region: "경기",
    siteId: "g1",
    siteName: "성남시 분당구",
    createdAt: "2026-02-06T09:20:00Z",
  },

  // 경기 - g3 (평택시 송탄, danger)
  {
    id: "e4",
    level: "danger",
    code: "A-5",
    message: "화재 발생 긴급 알림",
    region: "경기",
    siteId: "g3",
    siteName: "평택시 송탄",
    createdAt: "2026-02-06T09:15:00Z",
  },
  {
    id: "e5",
    level: "danger",
    code: "B-3",
    message: "고온 위험 레벨 초과",
    region: "경기",
    siteId: "g3",
    siteName: "평택시 송탄",
    createdAt: "2026-02-06T09:10:00Z",
  },

  // 강원 - gw2 (원주시 단계동, warning)
  {
    id: "e6",
    level: "warning",
    code: "C-3",
    message: "진동 이상 감지",
    region: "강원",
    siteId: "gw2",
    siteName: "원주시 단계동",
    createdAt: "2026-02-06T09:05:00Z",
  },

  // 충청 - c1 (대전시 유성구, danger)
  {
    id: "e7",
    level: "danger",
    code: "C-5",
    message: "구조물 붕괴 위험 감지",
    region: "충청",
    siteId: "c1",
    siteName: "대전시 유성구",
    createdAt: "2026-02-06T09:00:00Z",
  },
  {
    id: "e8",
    level: "alert",
    code: "D-2",
    message: "전기 합선 경고",
    region: "충청",
    siteId: "c1",
    siteName: "대전시 유성구",
    createdAt: "2026-02-06T08:55:00Z",
  },

  // 경상 - gs2 (대구시 수성구, warning)
  {
    id: "e9",
    level: "warning",
    code: "A-2",
    message: "연기 감지",
    region: "경상",
    siteId: "gs2",
    siteName: "대구시 수성구",
    createdAt: "2026-02-06T08:50:00Z",
  },

  // 경상 - gs4 (경주시 동천동, warning)
  {
    id: "e10",
    level: "warning",
    code: "B-1",
    message: "온도 이상 상승 감지",
    region: "경상",
    siteId: "gs4",
    siteName: "경주시 동천동",
    createdAt: "2026-02-06T08:45:00Z",
  },
  {
    id: "e11",
    level: "alert",
    code: "C-1",
    message: "설비 이상 경고",
    region: "경상",
    siteId: "gs4",
    siteName: "경주시 동천동",
    createdAt: "2026-02-06T08:40:00Z",
  },

  // 전라 - j2 (전주시 완산구, warning)
  {
    id: "e12",
    level: "warning",
    code: "D-3",
    message: "수위 상승 주의",
    region: "전라",
    siteId: "j2",
    siteName: "전주시 완산구",
    createdAt: "2026-02-06T08:35:00Z",
  },

  // 전라 - j4 (군산시 나운동, danger)
  {
    id: "e13",
    level: "danger",
    code: "A-4",
    message: "폭발 위험 감지",
    region: "전라",
    siteId: "j4",
    siteName: "군산시 나운동",
    createdAt: "2026-02-06T08:30:00Z",
  },
  {
    id: "e14",
    level: "alert",
    code: "B-5",
    message: "유해가스 농도 상승",
    region: "전라",
    siteId: "j4",
    siteName: "군산시 나운동",
    createdAt: "2026-02-06T08:25:00Z",
  },
];
