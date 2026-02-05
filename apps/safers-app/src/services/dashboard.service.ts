import type {
  DashboardStatisticsResponse,
  DashboardRegionsResponse,
  DashboardEventsResponse,
} from "./types/dashboard.types";
import { mockStatistics, mockRegions, mockEvents } from "./mocks/dashboard.mock";

// 지연 시뮬레이션 유틸
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 대시보드 통계 조회
 * GET /api/dashboard/statistics
 */
async function getStatistics(): Promise<DashboardStatisticsResponse> {
  await delay(300);
  return { data: mockStatistics };
}

/**
 * 지역별 현장 목록 조회
 * GET /api/dashboard/regions
 */
async function getRegions(): Promise<DashboardRegionsResponse> {
  await delay(300);
  return { data: mockRegions };
}

/**
 * 실시간 이벤트 목록 조회
 * GET /api/dashboard/events
 */
async function getEvents(): Promise<DashboardEventsResponse> {
  await delay(300);
  return { data: mockEvents };
}

export const dashboardService = {
  getStatistics,
  getRegions,
  getEvents,
};
