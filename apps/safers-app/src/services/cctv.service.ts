import type { SafersCCTVResponse, SafersCCTV, CctvUpdateRequest } from "./types/cctv.types";
import { SAFERS_API_URL } from "./config";

/**
 * [임시] 시연용 현장별 WebRTC(WHEP) 포트 매핑
 *
 * 현재 모든 현장이 동일 서버(14.51.233.128)를 사용하되 포트가 다름.
 * 추후 현장별 도메인이 분리되면 공통 포트로 통일 예정.
 */
const SITE_WHEP_PORT: Record<number, number> = {
  11: 8811, // 인천연희공원
  13: 8812, // 인천검단3차
  17: 8813, // 김포풍무B5
  9: 8814, // 천안일봉공원2BL
  16: 8815, // 당진해저케이블2공장
  10: 8816, // 광주중앙공원2지구
  12: 8817, // 안동옥송상록공원
  15: 8818, // 제주위파크1단지
  14: 8819, // 제주위파크2단지
};

/** 응답 형태 검증 — data 배열이 존재하는지 확인 */
function isCCTVResponse(value: unknown): value is SafersCCTVResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    Array.isArray((value as SafersCCTVResponse).data)
  );
}

/** CCTV 목록 조회 (siteId로 현장별 필터링 가능) */
async function getCCTVs(siteId?: number): Promise<SafersCCTV[]> {
  const query = siteId != null ? `?siteId=${siteId}` : "";
  const res = await fetch(`${SAFERS_API_URL}/cctvs${query}`);
  if (!res.ok) throw new Error(`Failed to fetch CCTVs: ${res.status}`);
  const body: unknown = await res.json();
  if (!isCCTVResponse(body)) throw new Error("Invalid CCTV response shape");
  return body.data;
}

/** CCTV 수정 (이름, 경도, 위도, 고도) */
async function updateCCTV(id: number, data: CctvUpdateRequest): Promise<void> {
  const res = await fetch(`${SAFERS_API_URL}/cctvs/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update CCTV: ${res.status}`);
}

/** 미디어서버에서 CCTV 경로 목록을 가져와 DB에 동기화 */
async function syncCCTVs(siteId?: number): Promise<void> {
  const query = siteId != null ? `?siteId=${siteId}` : "";
  const res = await fetch(`${SAFERS_API_URL}/cctvs/sync${query}`, { method: "POST" });
  if (!res.ok) throw new Error(`Failed to sync CCTVs: ${res.status}`);
}

/** 현장 정보 기반으로 WHEP URL 생성 — /webrtc/{port}/{streamName}/whep */
function getWHEPUrl(streamName: string, siteId: number): string {
  const port = SITE_WHEP_PORT[siteId];
  if (port) return `/webrtc/${port}/${streamName}/whep`;
  return `/webrtc/${streamName}/whep`;
}

export const cctvService = {
  getCCTVs,
  updateCCTV,
  syncCCTVs,
  getWHEPUrl,
};
