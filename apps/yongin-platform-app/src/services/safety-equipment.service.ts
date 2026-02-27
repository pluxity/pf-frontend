import { getApiClient, type DataResponse } from "@pf-dev/api";
import type { SafetyEquipment } from "./types/safety-equipment";

export const safetyEquipmentService = {
  getAll: async (): Promise<SafetyEquipment[]> => {
    const result = await getApiClient().get<DataResponse<SafetyEquipment[]>>("/safety-equipments");
    return result.data;
  },
};
