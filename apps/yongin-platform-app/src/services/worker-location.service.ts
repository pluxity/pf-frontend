import { getApiClient, type DataResponse } from "@pf-dev/api";
import type { WorkerLocation } from "./types/worker-location";

export async function getWorkerLocations(): Promise<WorkerLocation[]> {
  const response = await getApiClient().get<DataResponse<WorkerLocation[]>>("/worker-locations");
  return response.data;
}
