import { getApiClient, type DataResponse } from "@pf-dev/api";
import type { CctvBookmark } from "./types/cctv-bookmark";

export const cctvBookmarkService = {
  getAll: async (): Promise<CctvBookmark[]> => {
    const result = await getApiClient().get<DataResponse<CctvBookmark[]>>("/cctv-bookmarks");
    return result.data;
  },

  create: async (streamName: string): Promise<number> => {
    const result = await getApiClient().post<DataResponse<number>>("/cctv-bookmarks", {
      streamName,
    });
    return result.data;
  },

  delete: async (id: number): Promise<void> => {
    await getApiClient().delete(`/cctv-bookmarks/${id}`);
  },

  /** 즐겨찾기 순서 변경 (드래그앤드롭 정렬 시 사용) */
  updateOrder: async (ids: number[]): Promise<void> => {
    await getApiClient().patch("/cctv-bookmarks/order", { ids });
  },
};
