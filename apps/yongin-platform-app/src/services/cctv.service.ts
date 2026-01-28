import type { CCTVPathsResponse, CCTVStreamsResponse } from "./types";

const MEDIA_SERVER_URL = import.meta.env.VITE_MEDIA_SERVER_URL ?? "";

export const cctvService = {
  /** v3 - 기본 사용 */
  getPaths: async (): Promise<CCTVPathsResponse> => {
    const res = await fetch(`${MEDIA_SERVER_URL}/api/v3/paths/list`);
    if (!res.ok) throw new Error(`Failed to fetch paths: ${res.status}`);
    return res.json() as Promise<CCTVPathsResponse>;
  },

  /** v1 - 레거시 (추후 사용) */
  getStreams: async (): Promise<CCTVStreamsResponse> => {
    const res = await fetch(`${MEDIA_SERVER_URL}/api/v1/streams`);
    if (!res.ok) throw new Error(`Failed to fetch streams: ${res.status}`);
    return res.json() as Promise<CCTVStreamsResponse>;
  },

  getHLSUrl: (streamName: string): string => `${MEDIA_SERVER_URL}/${streamName}/index.m3u8`,

  getWHEPUrl: (streamName: string): string => `${MEDIA_SERVER_URL}/webrtc/${streamName}/whep`,
};
