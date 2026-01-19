import type { CCTVListResponse } from "./types/cctv";

// 환경변수 필수 - .env 파일에 설정 필요
// VITE_MEDIA_API_URL: MediaMTX API URL (예: http://localhost:9997)
// VITE_WHEP_API_URL: WHEP 스트리밍 URL (예: http://localhost:8889)
const MEDIA_API_URL = import.meta.env.VITE_MEDIA_API_URL || "";
const WHEP_API_URL = import.meta.env.VITE_WHEP_API_URL || "";

if (!MEDIA_API_URL || !WHEP_API_URL) {
  console.warn("[CCTV] VITE_MEDIA_API_URL 또는 VITE_WHEP_API_URL 환경변수가 설정되지 않았습니다.");
}

export const cctvService = {
  async fetchList(): Promise<CCTVListResponse> {
    const response = await fetch(`${MEDIA_API_URL}/v3/paths/list`);

    if (!response.ok) {
      throw new Error(`Failed to fetch CCTV list: ${response.statusText}`);
    }

    return response.json();
  },

  getStreamUrl(cctvName: string, protocol: "hls" | "whep" = "whep"): string {
    if (protocol === "hls") {
      return `${MEDIA_API_URL}/${cctvName}/index.m3u8`;
    }
    // WHEP는 8889 포트 사용
    return `${WHEP_API_URL}/${cctvName}/whep`;
  },
};
