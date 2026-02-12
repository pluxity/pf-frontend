import type { DataResponseBody, PageResponse } from "./common.types";

/** 지역 enum (백엔드 API) */
export type SiteRegion =
  | "SEOUL"
  | "GYEONGGI_INCHEON"
  | "GANGWON"
  | "CHUNGCHEONG"
  | "JEOLLA"
  | "GYEONGSANG"
  | "JEJU";

/** 지역 표시명 매핑 */
export const REGION_DISPLAY_NAMES: Record<SiteRegion, string> = {
  SEOUL: "서울",
  GYEONGGI_INCHEON: "경기/인천",
  GANGWON: "강원",
  CHUNGCHEONG: "충청",
  JEOLLA: "전라",
  GYEONGSANG: "경상",
  JEJU: "제주",
};

/** 현장 (백엔드 API 응답) */
export interface Site {
  id: number;
  name: string;
  region: SiteRegion;
  address?: string;
  latitude?: number;
  longitude?: number;
  constructionStartDate?: string;
  constructionEndDate?: string;
  description?: string;
  thumbnailImage?: string;
}

/** 지역 응답 */
export interface RegionResponse {
  name: SiteRegion;
  displayName: string;
}

/** 클라이언트에서 사이트를 지역별로 그룹핑한 결과 */
export interface RegionGroup {
  region: SiteRegion;
  displayName: string;
  sites: Site[];
}

/** API 응답 타입 */
export type SitesResponse = DataResponseBody<PageResponse<Site>>;
export type SiteResponse = DataResponseBody<Site>;
export type RegionsResponse = DataResponseBody<RegionResponse[]>;

/** API 요청 파라미터 */
export interface GetSitesParams {
  region?: SiteRegion;
  page?: number;
  size?: number;
}
