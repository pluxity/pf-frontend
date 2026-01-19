import type { CCTVListResponse } from "./types/cctv";

const MEDIA_API_URL = import.meta.env.VITE_MEDIA_API_URL || "http://192.168.10.181:9997";
const WHEP_API_URL = import.meta.env.VITE_WHEP_API_URL || "http://192.168.10.181:8889";

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
