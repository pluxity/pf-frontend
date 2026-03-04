import { getApiClient, type DataResponse } from "@pf-dev/api";
import type { SystemSetting, UpdateSystemSetting } from "../types";

export const systemSettingService = {
  /**
   * 시스템 설정 조회
   */
  get: async (): Promise<SystemSetting> => {
    const response = await getApiClient().get<DataResponse<SystemSetting>>("/system-settings");
    return response.data;
  },

  /**
   * 시스템 설정 업데이트
   */
  update: async (data: UpdateSystemSetting): Promise<void> => {
    await getApiClient().put("/system-settings", data);
  },
};
