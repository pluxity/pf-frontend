import { getApiClient, type DataResponse } from "@pf-dev/api";
import { SystemSettingsResponse } from "./types";

export const systemSettingsService = {
  get: async (): Promise<SystemSettingsResponse> => {
    const result =
      await getApiClient().get<DataResponse<SystemSettingsResponse>>("/system-settings");
    return result.data;
  },
};
