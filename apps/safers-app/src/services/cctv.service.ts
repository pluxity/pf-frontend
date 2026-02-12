import type { CCTVPathsResponse, CCTVListResponse } from "./types/cctv.types";
import { mockCCTVs } from "./mocks/cctv.mock";

const API_BASE_URL = "/api";
const MEDIA_SERVER_URL = import.meta.env.VITE_MEDIA_SERVER_URL ?? "";

const USE_MOCK = true;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getPaths(): Promise<CCTVPathsResponse> {
  const res = await fetch(`${MEDIA_SERVER_URL}/api/v3/paths/list`);
  if (!res.ok) throw new Error(`Failed to fetch paths: ${res.status}`);
  return res.json() as Promise<CCTVPathsResponse>;
}

async function getCCTVList(): Promise<CCTVListResponse> {
  if (USE_MOCK) {
    await delay(300);
    return { data: mockCCTVs };
  }

  const response = await fetch(`${API_BASE_URL}/cctvs`);
  if (!response.ok) throw new Error("Failed to fetch CCTV list");
  return response.json();
}

function getStreamUrl(streamName: string): string {
  return `${MEDIA_SERVER_URL}/${streamName}/whep`;
}

export const cctvService = {
  getPaths,
  getCCTVList,
  getStreamUrl,
  getWHEPUrl: (streamName: string): string => `${MEDIA_SERVER_URL}/webrtc/${streamName}/whep`,
  getHLSUrl: (streamName: string): string => `${MEDIA_SERVER_URL}/${streamName}/index.m3u8`,
};
