import type { SafetyItem } from "./types/safety.types";
import { generateSafetyData } from "./mocks/safety.mock";

/**
 * 안전 모니터링 데이터 조회
 * siteId에 따라 현장별 데이터 반환
 */
async function getSafetyData(siteId?: number): Promise<SafetyItem[]> {
  return generateSafetyData(siteId ?? 1);
}

export const safetyService = {
  getSafetyData,
};
