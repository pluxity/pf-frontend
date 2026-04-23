import type { DataResponseBody, PageResponse } from "./common.types";

export type SiteRegion =
  | "SEOUL"
  | "GYEONGGI_INCHEON"
  | "GANGWON"
  | "CHUNGCHEONG"
  | "JEOLLA"
  | "GYEONGSANG"
  | "JEJU";

export const REGION_DISPLAY_NAMES: Record<SiteRegion, string> = {
  SEOUL: "서울",
  GYEONGGI_INCHEON: "경기/인천",
  GANGWON: "강원",
  CHUNGCHEONG: "충청",
  JEOLLA: "전라",
  GYEONGSANG: "경상",
  JEJU: "제주",
};

export interface Site {
  id: number;
  name: string;
  region: SiteRegion;
  address?: string;
  latitude?: number;
  longitude?: number;
  location?: string;
  baseUrl?: string;
  constructionStartDate?: string;
  constructionEndDate?: string;
  description?: string;
  thumbnailImage?: string;
}

export interface RegionResponse {
  name: SiteRegion;
  displayName: string;
}

export interface RegionGroup {
  region: SiteRegion;
  displayName: string;
  sites: Site[];
}

export type SitesResponse = DataResponseBody<PageResponse<Site>>;
export type SiteResponse = DataResponseBody<Site>;
export type RegionsResponse = DataResponseBody<RegionResponse[]>;

export interface GetSitesParams {
  region?: SiteRegion;
  page?: number;
  size?: number;
}
