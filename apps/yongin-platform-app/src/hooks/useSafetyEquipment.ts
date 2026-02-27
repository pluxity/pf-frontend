import useSWR from "swr";
import { safetyEquipmentService } from "@/services";

const SAFETY_EQUIPMENT_KEY = "/safety-equipments";

export function useSafetyEquipment() {
  const { data, error, isLoading } = useSWR(SAFETY_EQUIPMENT_KEY, () =>
    safetyEquipmentService.getAll()
  );

  return {
    equipments: data ?? [],
    isLoading,
    isError: !!error,
    error,
  };
}
