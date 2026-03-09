import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import {
  getSafetyEquipmentList,
  createSafetyEquipment,
  updateSafetyEquipment,
  deleteSafetyEquipment,
} from "../services/safetyEquipmentService";
import type { SafetyEquipmentRequest, SafetyEquipmentUpdateResquest } from "../types";

const API_PATH = "/safety-equipments";

export function useSafetyEquipment() {
  // 목록 조회
  const {
    data,
    error,
    isLoading,
    mutate: refresh,
  } = useSWR(API_PATH, getSafetyEquipmentList, { revalidateOnFocus: false });

  // 등록
  const { trigger: create, isMutating: isCreating } = useSWRMutation(
    API_PATH,
    (_key, { arg }: { arg: SafetyEquipmentRequest }) => createSafetyEquipment(arg)
  );

  // 수정
  const { trigger: update, isMutating: isUpdating } = useSWRMutation(
    API_PATH,
    (_key, { arg }: { arg: { id: number; data: SafetyEquipmentUpdateResquest } }) =>
      updateSafetyEquipment(arg.id, arg.data)
  );

  // 삭제
  const { trigger: remove } = useSWRMutation(API_PATH, (_key, { arg }: { arg: number }) =>
    deleteSafetyEquipment(arg)
  );

  return {
    data: data ?? [],
    isLoading,
    isError: !!error,
    isMutating: isCreating || isUpdating,

    refresh,
    create,
    update,
    remove,
  };
}
