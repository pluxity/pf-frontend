import type { SafetyItem } from "./types/safety.types";
import { SAFETY_MOCK_DATA } from "./mocks/safety.mock";

// API 기본 URL (나중에 실제 API로 변경)
const API_BASE_URL = "/api";

// Mock 모드 (true: mock 데이터, false: 실제 API)
const USE_MOCK = true;

/**
 * 안전 모니터링 데이터 조회
 * GET /api/safety
 */
async function getSafetyData(): Promise<SafetyItem[]> {
  if (USE_MOCK) {
    return SAFETY_MOCK_DATA;
  }

  const response = await fetch(`${API_BASE_URL}/safety`);
  if (!response.ok) throw new Error("Failed to fetch safety data");
  return response.json();
}

export const safetyService = {
  getSafetyData,
};
