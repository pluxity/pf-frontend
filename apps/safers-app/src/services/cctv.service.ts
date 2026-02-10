import type { CCTVPathsResponse } from "./types/cctv.types";

const MEDIA_SERVER_URL = import.meta.env.VITE_MEDIA_SERVER_URL ?? "";

export const cctvService = {
  getPaths: async (): Promise<CCTVPathsResponse> => {
    const res = await fetch(`${MEDIA_SERVER_URL}/api/v3/paths/list`);
    if (!res.ok) throw new Error(`Failed to fetch paths: ${res.status}`);
    return res.json() as Promise<CCTVPathsResponse>;
  },

  getWHEPUrl: (streamName: string): string => `${MEDIA_SERVER_URL}/webrtc/${streamName}/whep`,
  getHLSUrl: (streamName: string): string => `${MEDIA_SERVER_URL}/${streamName}/index.m3u8`,
};
