import { getApiClient, type DataResponse } from "@pf-dev/api";
import type { Announcement } from "./types/announcement";

export const announcementService = {
  /** 안내사항 조회 */
  get: async (): Promise<Announcement> => {
    const result = await getApiClient().get<DataResponse<Announcement>>("/announcement");
    return result.data;
  },
};
