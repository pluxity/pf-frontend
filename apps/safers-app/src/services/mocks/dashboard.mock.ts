import type { SiteStatistics, Region, Event } from "../types/dashboard.types";

export const mockStatistics: SiteStatistics = {
  total: 15,
  normal: 11,
  warning: 3,
  danger: 1,
};

export const mockRegions: Region[] = [
  {
    id: "seoul",
    name: "서울",
    sites: [
      { id: "s1", name: "강남구 개포", status: "normal" },
      { id: "s2", name: "용산구 한남로", status: "normal" },
      { id: "s3", name: "구로구 개봉 A-12 구역", status: "warning" },
      { id: "s4", name: "관악구 지방", status: "normal" },
      { id: "s5", name: "서초구 우면", status: "normal" },
    ],
  },
  {
    id: "gyeonggi",
    name: "경기",
    sites: [
      { id: "g1", name: "수원시 영통구", status: "normal" },
      { id: "g2", name: "성남시 분당구", status: "warning" },
      { id: "g3", name: "용인시 기흥구", status: "normal" },
      { id: "g4", name: "고양시 일산동구", status: "normal" },
      { id: "g5", name: "안양시 동안구", status: "normal" },
      { id: "g6", name: "부천시 원미구", status: "warning" },
      { id: "g7", name: "화성시 동탄", status: "normal" },
      { id: "g8", name: "평택시 송탄", status: "danger" },
      { id: "g9", name: "의정부시 호원동", status: "normal" },
      { id: "g10", name: "파주시 운정", status: "normal" },
    ],
  },
  {
    id: "gangwon",
    name: "강원",
    sites: [
      { id: "gw1", name: "춘천시 퇴계동", status: "normal" },
      { id: "gw2", name: "원주시 단계동", status: "normal" },
    ],
  },
  {
    id: "chungcheong",
    name: "충청",
    sites: [
      { id: "c1", name: "대전시 유성구", status: "danger" },
      { id: "c2", name: "천안시 서북구", status: "normal" },
    ],
  },
  {
    id: "gyeongsang",
    name: "경상",
    sites: [
      { id: "gs1", name: "부산시 해운대구", status: "normal" },
      { id: "gs2", name: "대구시 수성구", status: "warning" },
    ],
  },
  {
    id: "jeolla",
    name: "전라",
    sites: [{ id: "j1", name: "광주시 서구", status: "normal" }],
  },
  {
    id: "jeju",
    name: "제주",
    sites: [{ id: "jj1", name: "제주시 연동", status: "normal" }],
  },
];

export const mockEvents: Event[] = [
  {
    id: "e1",
    level: "warning",
    code: "D-5",
    message: "위험계기구부 알림",
    region: "서울",
  },
  {
    id: "e2",
    level: "warning",
    code: "B-2",
    message: "일산화탄소 누출 경고 레벨 감지",
    region: "서울",
  },
  {
    id: "e3",
    level: "alert",
    code: "D-5",
    message: "위험계기구부 알림",
    region: "서울",
  },
  {
    id: "e4",
    level: "danger",
    code: "A-3",
    message: "양성온도 상승 주의 레벨 감지",
    region: "서울",
  },
  {
    id: "e5",
    level: "warning",
    code: "C-4",
    message: "고온 화재 경고 레벨 감지",
    region: "서울",
  },
  {
    id: "e6",
    level: "warning",
    code: "A-1",
    message: "가스 누출 감지",
    region: "경기",
  },
  {
    id: "e7",
    level: "danger",
    code: "B-3",
    message: "화재 위험 레벨 감지",
    region: "충청",
  },
];
