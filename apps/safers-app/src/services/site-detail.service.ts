import type { SiteDetailResponse } from "./types/site-detail.types";
import { mockSiteDetail } from "./mocks/site-detail.mock";
import { MOCK_CONFIG, delay } from "./config";

/**
 * 현장 상세 데이터 조회 (안전율/기성률/인원)
 * GET /api/sites/:id/detail
 */
async function getSiteDetail(_id: number): Promise<SiteDetailResponse> {
  if (MOCK_CONFIG.siteDetail) {
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
