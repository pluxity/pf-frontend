import type {
  SitesResponse,
  SiteResponse,
  RegionsResponse,
  GetSitesParams,
} from "./types/sites.types";

const API_BASE_URL = "/api";

/**
 * 현장 목록 조회
 * GET /api/sites
 */
async function getSites(params?: GetSitesParams): Promise<SitesResponse> {
  const queryParams = new URLSearchParams();
  if (params?.region) queryParams.set("region", params.region);
  if (params?.page != null) queryParams.set("page", String(params.page));
  if (params?.size != null) queryParams.set("size", String(params.size));

  const query = queryParams.toString();
  const url = `${API_BASE_URL}/sites${query ? `?${query}` : ""}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch sites");
  return response.json();
}

/**
 * 현장 상세 조회
 * GET /api/sites/:id
 */
async function getSite(id: number): Promise<SiteResponse> {
  const response = await fetch(`${API_BASE_URL}/sites/${id}`);
  if (!response.ok) throw new Error("Failed to fetch site");
  return response.json();
}

/**
 * 지역 목록 조회
 * GET /api/sites/regions
 */
async function getRegions(): Promise<RegionsResponse> {
  const response = await fetch(`${API_BASE_URL}/sites/regions`);
  if (!response.ok) throw new Error("Failed to fetch regions");
  return response.json();
}

export const sitesService = {
  getSites,
  getSite,
  getRegions,
};
