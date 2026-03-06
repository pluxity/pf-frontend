import type {
  SitesResponse,
  SiteResponse,
  RegionsResponse,
  GetSitesParams,
  Site,
} from "./types/sites.types";
import { mockSites } from "./mocks/sites.mock";
import { API_BASE_URL } from "./config";

/** mock 데이터로 SitesResponse 생성 */
function buildMockSitesResponse(params?: GetSitesParams): SitesResponse {
  let filtered = [...mockSites];
  if (params?.region) {
    filtered = filtered.filter((s) => s.region === params.region);
  }
  return {
    data: {
      content: filtered,
      pageNumber: 0,
      pageSize: filtered.length,
      totalElements: filtered.length,
      first: true,
      last: true,
    },
    status: 200,
    timestamp: new Date().toISOString(),
  };
}

/**
 * 현장 목록 조회
 * GET /api/sites — 실패 시 mock 폴백
 */
async function getSites(params?: GetSitesParams): Promise<SitesResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.region) queryParams.set("region", params.region);
    if (params?.page != null) queryParams.set("page", String(params.page));
    if (params?.size != null) queryParams.set("size", String(params.size));

    const query = queryParams.toString();
    const url = `${API_BASE_URL}/sites${query ? `?${query}` : ""}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch sites: ${response.status}`);
    return response.json();
  } catch {
    return buildMockSitesResponse(params);
  }
}

/**
 * 현장 상세 조회
 * GET /api/sites/:id — 실패 시 mock 폴백
 */
async function getSite(id: number): Promise<SiteResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/sites/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch site: ${response.status}`);
    return response.json();
  } catch {
    const site = mockSites.find((s) => s.id === id);
    return {
      data: site ?? ({ id, name: `현장 ${id}` } as Site),
      status: 200,
      timestamp: new Date().toISOString(),
    };
  }
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
