// 현장 상태
export type SiteStatus = "normal" | "warning" | "danger";

// 지역 목록
export const REGIONS = ["서울", "경기", "강원", "충청", "전라", "경상", "제주"] as const;
export type RegionName = (typeof REGIONS)[number];

// 현장
export interface Site {
  id: string;
  name: string;
  status: SiteStatus;
  regionId: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

// 지역
export interface Region {
  id: string;
  name: string;
  sites: Site[];
}

// 통계
export interface SiteStatistics {
  total: number;
  normal: number;
  warning: number;
  danger: number;
}

// API 응답
export interface SitesResponse {
  data: Site[];
}

export interface SiteResponse {
  data: Site;
}

export interface RegionsResponse {
  data: Region[];
}

export interface SiteStatisticsResponse {
  data: SiteStatistics;
}

// API 요청 파라미터
export interface GetSitesParams {
  regionId?: string;
  status?: SiteStatus;
}
