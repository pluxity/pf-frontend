import type { SiteDetailResponse } from "./types/site-detail.types";
import { mockSiteDetail } from "./mocks/site-detail.mock";

// 안전율, 기성률, 인원은 아직 API 미구현 → mock 유지
const USE_MOCK = true;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 현장 상세 데이터 조회 (안전율/기성률/인원)
 * GET /api/sites/:id/detail
 */
async function getSiteDetail(_id: number): Promise<SiteDetailResponse> {
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
