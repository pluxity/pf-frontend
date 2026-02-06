import type { Site, Region, SiteStatistics } from "../types/sites.types";

/** 현장 목 데이터 */
export const mockSites: Site[] = [
  // 서울 (2개)
  {
    id: "26",
    name: "개봉 5구역",
    status: "warning",
    regionId: "seoul",
    address: "서울특별시 구로구 개봉동 68-11",
    latitude: 37.4597,
    longitude: 127.023,
  },
  {
    id: "27",
    name: "양재동 청년주택",
    status: "normal",
    regionId: "seoul",
    address: "서울시 서초구 양재동 산17-7",
    latitude: 37.484668,
    longitude: 127.031,
  },

  // 경기/인천 (5개)
  {
    id: "28",
    name: "화성비봉",
    status: "warning",
    regionId: "gyeonggi",
    address: "경기 화성시 비봉면 삼화리 375-1",
    latitude: 37.2497148,
    longitude: 126.8688,
  },
  {
    id: "34",
    name: "인천검단 5차",
    status: "normal",
    regionId: "gyeonggi",
    address: "인천 서구 불로동 547-10",
    latitude: 37.6069,
    longitude: 126.6889,
  },
  {
    id: "35",
    name: "인천연희공원",
    status: "normal",
    regionId: "gyeonggi",
    address: "인천 서구 중봉대로722번길 5-5",
    latitude: 37.54423,
    longitude: 126.6505,
  },
  {
    id: "37",
    name: "오산세교2 A13",
    status: "normal",
    regionId: "gyeonggi",
    address: "경기도 오산시 벌음동 263",
    latitude: 37.13,
    longitude: 127.04,
  },
  {
    id: "40",
    name: "인천검단3차",
    status: "normal",
    regionId: "gyeonggi",
    address: "인천 서구 원당동 24-1",
    latitude: 37.593,
    longitude: 126.721,
  },

  // 충청 (5개)
  {
    id: "29",
    name: "당진수청3차",
    status: "danger",
    regionId: "chungcheong",
    address: "충남 당진시 수청동 1543",
    latitude: 36.89031,
    longitude: 126.6566,
  },
  {
    id: "30",
    name: "천안 일봉공원 2BL",
    status: "normal",
    regionId: "chungcheong",
    address: "충남 천안시 동남구 신방동 30-24",
    latitude: 36.7906,
    longitude: 127.1346,
  },
  {
    id: "32",
    name: "천안일봉공원 1BL",
    status: "normal",
    regionId: "chungcheong",
    address: "충남 천안시 동남구 신방동 24-25",
    latitude: 36.7953,
    longitude: 127.1339,
  },
  {
    id: "41",
    name: "당진 해저케이블공장",
    status: "normal",
    regionId: "chungcheong",
    address: "충청남도 당진시 송악읍 고대리 346-6",
    latitude: 36.98,
    longitude: 126.75,
  },
  {
    id: "44",
    name: "당진 해저케이블2공장",
    status: "normal",
    regionId: "chungcheong",
    address: "충청남도 당진시 송악읍 고대리 346-6",
    latitude: 36.982,
    longitude: 126.747,
  },

  // 전라/광주 (2개)
  {
    id: "31",
    name: "광주마륵공원",
    status: "normal",
    regionId: "jeolla",
    address: "광주 서구 금호동 산109번지",
    latitude: 35.1351,
    longitude: 126.8534,
  },
  {
    id: "33",
    name: "광주중앙공원 2지구",
    status: "normal",
    regionId: "jeolla",
    address: "광주광역시 서구 풍암동 10-12",
    latitude: 35.137,
    longitude: 126.88,
  },

  // 경상/대구 (2개)
  {
    id: "36",
    name: "대구칠성 주상복합",
    status: "danger",
    regionId: "gyeongsang",
    address: "대구광역시 북구 칠성동 2가 725번지",
    latitude: 35.8838,
    longitude: 128.5909,
  },
  {
    id: "39",
    name: "안동옥송 상록공원",
    status: "warning",
    regionId: "gyeongsang",
    address: "경상북도 안동시 옥동 산 70",
    latitude: 36.564,
    longitude: 128.695,
  },

  // 제주 (2개)
  {
    id: "42",
    name: "제주위파크2단지",
    status: "normal",
    regionId: "jeju",
    address: "제주 제주시 오라이동 오남로 191-9",
    latitude: 33.478,
    longitude: 126.517,
  },
  {
    id: "43",
    name: "제주위파크1단지",
    status: "normal",
    regionId: "jeju",
    address: "제주 제주시 오라이동 854-1",
    latitude: 33.471,
    longitude: 126.513,
  },
];

/** 지역별 현장 목록 */
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
    id: "chungcheong",
    name: "충청",
    sites: mockSites.filter((s) => s.regionId === "chungcheong"),
  },
  {
    id: "jeolla",
    name: "전라",
    sites: mockSites.filter((s) => s.regionId === "jeolla"),
  },
  {
    id: "gyeongsang",
    name: "경상",
    sites: mockSites.filter((s) => s.regionId === "gyeongsang"),
  },
  {
    id: "jeju",
    name: "제주",
    sites: mockSites.filter((s) => s.regionId === "jeju"),
  },
];

/** 현장 통계 */
export const mockStatistics: SiteStatistics = {
  total: mockSites.length,
  normal: mockSites.filter((s) => s.status === "normal").length,
  warning: mockSites.filter((s) => s.status === "warning").length,
  danger: mockSites.filter((s) => s.status === "danger").length,
};
