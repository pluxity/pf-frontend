/** 공유 API 설정 및 mock 전략 */

export const API_BASE_URL = "/api";

/**
 * 도메인별 mock 사용 여부
 * - true: mock 데이터 반환 (API 미구현)
 * - false: 실제 API 호출 (실패 시 fallback은 각 서비스에서 처리)
 */
export const MOCK_CONFIG = {
  siteDetail: true,
} as const;

/** 이벤트 버퍼 최대 크기 */
export const MAX_EVENTS = 200;

/** mock 지연 시뮬레이션 */
export const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** NVR 녹화영상(playback)이 활성화된 현장 ID 목록 */
export const PLAYBACK_ENABLED_SITE_IDS = new Set<number>([15, 17, 18]);

/** 현장 ID가 녹화영상 활성 대상인지 확인 */
export function isPlaybackEnabledSite(siteId: number | string | undefined | null): boolean {
  if (siteId == null) return false;
  const id = typeof siteId === "string" ? Number(siteId) : siteId;
  if (!Number.isFinite(id)) return false;
  return PLAYBACK_ENABLED_SITE_IDS.has(id);
}
