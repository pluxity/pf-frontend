import { getApiClient, type DataResponse } from "@pf-dev/api";
import type { ProcessStatus } from "./types/processStatus";

export const processStatusService = {
  getLatest: async (): Promise<ProcessStatus[]> => {
    const result = await getApiClient().get<DataResponse<ProcessStatus[]>>(
      "/process-statuses/latest"
    );
    return result.data;
  },
};
