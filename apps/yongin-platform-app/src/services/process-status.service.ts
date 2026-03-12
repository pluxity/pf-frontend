import { getApiClient, type DataResponse } from "@pf-dev/api";
import type { ProcessStatusResponse, ProcessStatusData, PageResponse } from "./types";

function toProcessStatusData(response: ProcessStatusResponse): ProcessStatusData {
  return {
    id: response.id,
    workDate: response.workDate,
    workTypeId: response.workType.id,
    workTypeName: response.workType.name,
    plannedRate: response.plannedRate,
    actualRate: response.actualRate,
  };
}

export const processStatusService = {
  getProcessStatuses: async (): Promise<ProcessStatusData[]> => {
    const response =
      await getApiClient().get<DataResponse<PageResponse<ProcessStatusResponse>>>(
        "/process-statuses"
      );
    return response.data.content.map(toProcessStatusData);
  },
};
