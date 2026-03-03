import type { FileResponse } from "./common.types";
import type { SiteRegion } from "./sites.types";

/** CCTV 응답에 포함되는 현장 정보 (API SiteResponse) */
export interface CCTVSite {
  id: number;
  name: string;
  constructionStartDate?: string;
  constructionEndDate?: string;
  description?: string;
  region?: SiteRegion;
  address?: string;
  baseUrl?: string;
  location: string;
  thumbnailImage?: FileResponse;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

/** Safers API /cctvs 응답 항목 */
export interface SafersCCTV {
  id: number;
  streamName: string;
  name: string;
  lon?: number;
  lat?: number;
  alt?: number;
  site: CCTVSite;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface SafersCCTVResponse {
  data: SafersCCTV[];
  status: number;
  message: string;
  timestamp: string;
}

/** PATCH /cctvs/{id} 요청 */
export interface CctvUpdateRequest {
  name: string;
  lon?: number;
  lat?: number;
  alt?: number;
}
