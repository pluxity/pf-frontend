import type { Site, Region, SiteStatistics } from "../types/sites.types";

export const mockSites: Site[] = [
  // 서울 (3개)
  {
    id: "s1",
    name: "강남구 개포",
    status: "normal",
    regionId: "seoul",
    latitude: 37.4833,
    longitude: 127.0469,
  },
  {
    id: "s2",
    name: "구로구 개봉",
    status: "warning",
    regionId: "seoul",
    latitude: 37.4954,
    longitude: 126.8576,
  },
  {
    id: "s3",
    name: "서초구 우면",
    status: "normal",
    regionId: "seoul",
    latitude: 37.4653,
    longitude: 127.0178,
  },

  // 경기 (4개)
  {
    id: "g1",
    name: "성남시 분당구",
    status: "warning",
    regionId: "gyeonggi",
    latitude: 37.3825,
    longitude: 127.1231,
  },
  {
    id: "g2",
    name: "수원시 영통구",
    status: "normal",
    regionId: "gyeonggi",
    latitude: 37.2596,
    longitude: 127.0446,
  },
  {
    id: "g3",
    name: "평택시 송탄",
    status: "danger",
    regionId: "gyeonggi",
    latitude: 37.0892,
    longitude: 127.0537,
  },
  {
    id: "g4",
    name: "고양시 일산",
    status: "normal",
    regionId: "gyeonggi",
    latitude: 37.6684,
    longitude: 126.7739,
  },

  // 강원 (2개)
  {
    id: "gw1",
    name: "춘천시 퇴계동",
    status: "normal",
    regionId: "gangwon",
    latitude: 37.8813,
    longitude: 127.7298,
  },
  {
    id: "gw2",
    name: "원주시 단계동",
    status: "warning",
    regionId: "gangwon",
    latitude: 37.3422,
    longitude: 127.9202,
  },

  // 충청 (3개)
  {
    id: "c1",
    name: "대전시 유성구",
    status: "danger",
    regionId: "chungcheong",
    latitude: 36.3622,
    longitude: 127.3561,
  },
  {
    id: "c2",
    name: "천안시 서북구",
    status: "normal",
    regionId: "chungcheong",
    latitude: 36.8151,
    longitude: 127.1139,
  },
  {
    id: "c3",
    name: "청주시 상당구",
    status: "normal",
    regionId: "chungcheong",
    latitude: 36.6424,
    longitude: 127.489,
  },

  // 경상 (5개) - 경북 추가
  {
    id: "gs1",
    name: "부산시 해운대구",
    status: "normal",
    regionId: "gyeongsang",
    latitude: 35.1631,
    longitude: 129.1635,
  },
  {
    id: "gs2",
    name: "대구시 수성구",
    status: "warning",
    regionId: "gyeongsang",
    latitude: 35.8584,
    longitude: 128.6305,
  },
  {
    id: "gs3",
    name: "포항시 북구",
    status: "normal",
    regionId: "gyeongsang",
    latitude: 36.019,
    longitude: 129.3435,
  },
  {
    id: "gs4",
    name: "경주시 동천동",
    status: "warning",
    regionId: "gyeongsang",
    latitude: 35.8562,
    longitude: 129.2247,
  },
  {
    id: "gs5",
    name: "구미시 원평동",
    status: "normal",
    regionId: "gyeongsang",
    latitude: 36.1195,
    longitude: 128.3446,
  },

  // 전라 (4개) - 전북 추가
  {
    id: "j1",
    name: "광주시 서구",
    status: "normal",
    regionId: "jeolla",
    latitude: 35.1525,
    longitude: 126.8895,
  },
  {
    id: "j2",
    name: "전주시 완산구",
    status: "warning",
    regionId: "jeolla",
    latitude: 35.8242,
    longitude: 127.148,
  },
  {
    id: "j3",
    name: "익산시 영등동",
    status: "normal",
    regionId: "jeolla",
    latitude: 35.9483,
    longitude: 126.9577,
  },
  {
    id: "j4",
    name: "군산시 나운동",
    status: "danger",
    regionId: "jeolla",
    latitude: 35.9676,
    longitude: 126.7369,
  },

  // 제주 (1개)
  {
    id: "jj1",
    name: "제주시 연동",
    status: "normal",
    regionId: "jeju",
    latitude: 33.489,
    longitude: 126.4983,
  },
];

export const mockRegions: Region[] = [
  {
    id: "seoul",
    name: "서울",
    sites: mockSites.filter((s) => s.regionId === "seoul"),
  },
  {
    id: "gyeonggi",
    name: "경기",
    sites: mockSites.filter((s) => s.regionId === "gyeonggi"),
  },
  {
    id: "gangwon",
    name: "강원",
    sites: mockSites.filter((s) => s.regionId === "gangwon"),
  },
  {
    id: "chungcheong",
    name: "충청",
    sites: mockSites.filter((s) => s.regionId === "chungcheong"),
  },
  {
    id: "gyeongsang",
    name: "경상",
    sites: mockSites.filter((s) => s.regionId === "gyeongsang"),
  },
  {
    id: "jeolla",
    name: "전라",
    sites: mockSites.filter((s) => s.regionId === "jeolla"),
  },
  {
    id: "jeju",
    name: "제주",
    sites: mockSites.filter((s) => s.regionId === "jeju"),
  },
];

export const mockStatistics: SiteStatistics = {
  total: mockSites.length,
  normal: mockSites.filter((s) => s.status === "normal").length,
  warning: mockSites.filter((s) => s.status === "warning").length,
  danger: mockSites.filter((s) => s.status === "danger").length,
};
