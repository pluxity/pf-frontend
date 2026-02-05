import type {
  SitesResponse,
  SiteResponse,
  RegionsResponse,
  SiteStatisticsResponse,
  GetSitesParams,
} from "./types/sites.types";
import { mockSites, mockRegions, mockStatistics } from "./mocks/sites.mock";

// API 기본 URL (나중에 실제 API로 변경)
const API_BASE_URL = "/api";

// Mock 모드 (true: mock 데이터, false: 실제 API)
const USE_MOCK = true;

// 지연 시뮬레이션 유틸
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 현장 목록 조회
 * GET /api/sites
 */
async function getSites(params?: GetSitesParams): Promise<SitesResponse> {
  if (USE_MOCK) {
    await delay(300);
    let filtered = [...mockSites];

    if (params?.regionId) {
      filtered = filtered.filter((s) => s.regionId === params.regionId);
    }
    if (params?.status) {
      filtered = filtered.filter((s) => s.status === params.status);
    }

    return { data: filtered };
  }

  const queryParams = new URLSearchParams();
  if (params?.regionId) queryParams.set("regionId", params.regionId);
  if (params?.status) queryParams.set("status", params.status);

  const response = await fetch(`${API_BASE_URL}/sites?${queryParams}`);
  if (!response.ok) throw new Error("Failed to fetch sites");
  return response.json();
}

/**
 * 현장 상세 조회
 * GET /api/sites/:id
 */
async function getSite(id: string): Promise<SiteResponse> {
  if (USE_MOCK) {
    await delay(200);
    const site = mockSites.find((s) => s.id === id);
    if (!site) throw new Error("Site not found");
    return { data: site };
  }

  const response = await fetch(`${API_BASE_URL}/sites/${id}`);
  if (!response.ok) throw new Error("Failed to fetch site");
  return response.json();
}

/**
 * 지역별 현장 목록 조회
 * GET /api/sites/regions
 */
async function getRegions(): Promise<RegionsResponse> {
  if (USE_MOCK) {
    await delay(300);
    return { data: mockRegions };
  }

  const response = await fetch(`${API_BASE_URL}/sites/regions`);
  if (!response.ok) throw new Error("Failed to fetch regions");
  return response.json();
}

/**
 * 현장 통계 조회
 * GET /api/sites/statistics
 */
async function getStatistics(): Promise<SiteStatisticsResponse> {
  if (USE_MOCK) {
    await delay(200);
    return { data: mockStatistics };
  }

  const response = await fetch(`${API_BASE_URL}/sites/statistics`);
  if (!response.ok) throw new Error("Failed to fetch statistics");
  return response.json();
}

export const sitesService = {
  getSites,
  getSite,
  getRegions,
  getStatistics,
};
