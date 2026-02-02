import { getApiClient, type DataResponse } from "@pf-dev/api";
import type { KeyManagementItem, KeyManagementType } from "./types/key-management";

export const keyManagementService = {
  getSelected: async (): Promise<KeyManagementItem[]> => {
    const result = await getApiClient().get<DataResponse<KeyManagementItem[]>>(
      "/key-management/selected"
    );
    return result.data;
  },

  getTypes: async (): Promise<KeyManagementType[]> => {
    const result =
      await getApiClient().get<DataResponse<KeyManagementType[]>>("/key-management/types");
    return result.data;
  },
};
