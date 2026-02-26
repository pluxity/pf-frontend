import { getApiClient, type DataResponse } from "@pf-dev/api";
import type { CCTVResponse } from "./types";

const MEDIA_SERVER_URL = import.meta.env.VITE_MEDIA_SERVER_URL ?? "";

export const cctvService = {
  getCctvs: async (): Promise<CCTVResponse[]> => {
    const response = await getApiClient().get<DataResponse<CCTVResponse[]>>("/cctvs");
    return response.data;
  },

  getHLSUrl: (streamName: string): string => `${MEDIA_SERVER_URL}/${streamName}/index.m3u8`,

  getWHEPUrl: (streamName: string): string => `${MEDIA_SERVER_URL}/webrtc/${streamName}/whep`,
};
