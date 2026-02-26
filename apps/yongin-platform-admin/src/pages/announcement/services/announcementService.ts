import { getApiClient, type DataResponse } from "@pf-dev/api";
import type { Announcement, AnnouncementFormData } from "../types";

export const announcementService = {
  get: async (): Promise<Announcement> => {
    const response = await getApiClient().get<DataResponse<Announcement>>("/announcement");
    return response.data;
  },

  update: async (data: AnnouncementFormData): Promise<void> => {
    await getApiClient().put("/announcement", data);
  },
};
