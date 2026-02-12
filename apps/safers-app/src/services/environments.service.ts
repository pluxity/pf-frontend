import type { EnvironmentsResponse } from "./types/environments.types";
import { mockEnvironments } from "./mocks/environments.mock";

// API 기본 URL (나중에 실제 API로 변경)
const API_BASE_URL = "/api";

// Mock 모드 (true: mock 데이터, false: 실제 API)
const USE_MOCK = true;

/**
 * 환경 목록 조회
 * GET /api/environments
 */
async function getEnvironments(): Promise<EnvironmentsResponse> {
  if (USE_MOCK) {
    return { data: mockEnvironments };
  }

  const response = await fetch(`${API_BASE_URL}/environments`);
  if (!response.ok) throw new Error("Failed to fetch environments");
  return response.json();
}

export const environmentsService = {
  getEnvironments,
};
