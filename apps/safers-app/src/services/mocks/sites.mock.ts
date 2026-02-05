import type { Site, Region, SiteStatistics } from "../types/sites.types";

export const mockSites: Site[] = [
  // 서울
  { id: "s1", name: "강남구 개포", status: "normal", regionId: "seoul" },
  { id: "s2", name: "용산구 한남로", status: "normal", regionId: "seoul" },
  { id: "s3", name: "구로구 개봉 A-12 구역", status: "warning", regionId: "seoul" },
  { id: "s4", name: "관악구 지방", status: "normal", regionId: "seoul" },
  { id: "s5", name: "서초구 우면", status: "normal", regionId: "seoul" },
  // 경기
  { id: "g1", name: "수원시 영통구", status: "normal", regionId: "gyeonggi" },
  { id: "g2", name: "성남시 분당구", status: "warning", regionId: "gyeonggi" },
  { id: "g3", name: "용인시 기흥구", status: "normal", regionId: "gyeonggi" },
  { id: "g4", name: "고양시 일산동구", status: "normal", regionId: "gyeonggi" },
  { id: "g5", name: "안양시 동안구", status: "normal", regionId: "gyeonggi" },
  { id: "g6", name: "부천시 원미구", status: "warning", regionId: "gyeonggi" },
  { id: "g7", name: "화성시 동탄", status: "normal", regionId: "gyeonggi" },
  { id: "g8", name: "평택시 송탄", status: "danger", regionId: "gyeonggi" },
  { id: "g9", name: "의정부시 호원동", status: "normal", regionId: "gyeonggi" },
  { id: "g10", name: "파주시 운정", status: "normal", regionId: "gyeonggi" },
  // 강원
  { id: "gw1", name: "춘천시 퇴계동", status: "normal", regionId: "gangwon" },
  { id: "gw2", name: "원주시 단계동", status: "normal", regionId: "gangwon" },
  // 충청
  { id: "c1", name: "대전시 유성구", status: "danger", regionId: "chungcheong" },
  { id: "c2", name: "천안시 서북구", status: "normal", regionId: "chungcheong" },
  // 경상
  { id: "gs1", name: "부산시 해운대구", status: "normal", regionId: "gyeongsang" },
  { id: "gs2", name: "대구시 수성구", status: "warning", regionId: "gyeongsang" },
  // 전라
  { id: "j1", name: "광주시 서구", status: "normal", regionId: "jeolla" },
  // 제주
  { id: "jj1", name: "제주시 연동", status: "normal", regionId: "jeju" },
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
