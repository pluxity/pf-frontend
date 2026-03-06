import type { Site, SiteRegion } from "../types/sites.types";

/** 실제 API 데이터 기반 현장 mock (API 장애 시 폴백) */
export const mockSites: Site[] = [
  {
    id: 9,
    name: "천안 일봉공원 2BL",
    region: "CHUNGCHEONG" as SiteRegion,
    address: "충남 천안시 동남구 신방동 30-24",
    baseUrl: "http://14.51.233.128",
    location:
      "POLYGON ((127.129 36.7861, 127.1402 36.7861, 127.1402 36.7951, 127.129 36.7951, 127.129 36.7861))",
    constructionStartDate: "2022-09-01",
    constructionEndDate: "2027-04-30",
  },
  {
    id: 10,
    name: "광주중앙공원 2지구",
    region: "JEOLLA" as SiteRegion,
    address: "광주광역시 서구 풍암동 10-12",
    baseUrl: "http://14.51.233.128",
    location:
      "POLYGON ((126.8745 35.1325, 126.8855 35.1325, 126.8855 35.1415, 126.8745 35.1415, 126.8745 35.1325))",
    constructionStartDate: "2023-06-23",
    constructionEndDate: "2026-06-23",
    description: "광주중앙공원2지구",
  },
  {
    id: 11,
    name: "인천연희공원",
    region: "GYEONGGI_INCHEON" as SiteRegion,
    address: "인천 서구 중봉대로722번길 5-5",
    baseUrl: "http://14.51.233.128",
    location:
      "POLYGON ((126.6448 37.5397, 126.6562 37.5397, 126.6562 37.5487, 126.6448 37.5487, 126.6448 37.5397))",
    constructionStartDate: "2023-09-18",
    constructionEndDate: "2026-11-29",
  },
  {
    id: 12,
    name: "안동옥송 상록공원",
    region: "GYEONGSANG" as SiteRegion,
    address: "경상북도 안동시 옥동 산 70",
    baseUrl: "http://14.51.233.128",
    location:
      "POLYGON ((128.6894 36.5595, 128.7006 36.5595, 128.7006 36.5685, 128.6894 36.5685, 128.6894 36.5595))",
    constructionStartDate: "2023-11-16",
    constructionEndDate: "2026-12-31",
    description: "안동옥송 상록공원1",
  },
  {
    id: 13,
    name: "인천검단3차",
    region: "GYEONGGI_INCHEON" as SiteRegion,
    address: "인천 서구 원당동 24-1",
    baseUrl: "http://14.51.233.128",
    location:
      "POLYGON ((126.7153 37.5885, 126.7267 37.5885, 126.7267 37.5975, 126.7153 37.5975, 126.7153 37.5885))",
    constructionStartDate: "2023-12-13",
    constructionEndDate: "2026-11-30",
  },
  {
    id: 14,
    name: "제주위파크2단지",
    region: "JEJU" as SiteRegion,
    address: "제주 제주시 오라이동 오남로 191-9",
    baseUrl: "http://14.51.233.128",
    location:
      "POLYGON ((126.5116 33.4735, 126.5224 33.4735, 126.5224 33.4825, 126.5116 33.4825, 126.5116 33.4735))",
    constructionStartDate: "2024-08-20",
    constructionEndDate: "2027-11-30",
  },
  {
    id: 15,
    name: "제주위파크1단지",
    region: "JEJU" as SiteRegion,
    address: "제주 제주시 오라이동 854-1",
    baseUrl: "http://14.51.233.128",
    location:
      "POLYGON ((126.5076 33.4665, 126.5184 33.4665, 126.5184 33.4755, 126.5076 33.4755, 126.5076 33.4665))",
    constructionStartDate: "2024-08-20",
    constructionEndDate: "2027-11-30",
  },
  {
    id: 16,
    name: "당진 해저케이블2공장",
    region: "CHUNGCHEONG" as SiteRegion,
    address: "충청남도 당진시 송악읍 고대리 346-6",
    baseUrl: "http://14.51.233.128",
    location:
      "POLYGON ((126.7414 36.9775, 126.7526 36.9775, 126.7526 36.9865, 126.7414 36.9865, 126.7414 36.9775))",
    constructionStartDate: "2025-09-24",
    constructionEndDate: "2027-12-31",
  },
  {
    id: 17,
    name: "김포 풍무B5",
    region: "GYEONGGI_INCHEON" as SiteRegion,
    address: "경기도 김포시 김포대로 680번길 94-33",
    baseUrl: "http://14.51.233.128",
    location:
      "POLYGON ((126.7318 37.6115, 126.7432 37.6115, 126.7432 37.6205, 126.7318 37.6205, 126.7318 37.6115))",
    constructionStartDate: "2025-09-01",
    constructionEndDate: "2028-09-30",
    description: "김포풍무B5",
  },
];
