import type { SiteDetailResponse } from "./types/site-detail.types";
import { mockSiteDetail } from "./mocks/site-detail.mock";

// Mock 모드 (true: mock 데이터, false: 실제 API)
const USE_MOCK = true;

// 지연 시뮬레이션 유틸
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 현장 상세 데이터 조회
 * GET /api/sites/:id/detail
 */
async function getSiteDetail(_id: string): Promise<SiteDetailResponse> {
  if (USE_MOCK) {
    await delay(300);
    return { data: mockSiteDetail };
  }

  const response = await fetch(`/api/sites/${_id}/detail`);
  if (!response.ok) throw new Error("Failed to fetch site detail");
  return response.json();
}

export const siteDetailService = {
  getSiteDetail,
};
