import { getApiClient, type DataResponse } from "@pf-dev/api";
import type { Notice } from "./types/notice";

export const noticeService = {
  getActive: async (): Promise<Notice[]> => {
    const result = await getApiClient().get<DataResponse<Notice[]>>("/notices");
    return result.data;
  },
};
