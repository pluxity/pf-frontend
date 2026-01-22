import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import type { WorkType, ProcessStatusBulkRequest } from "../types";
import {
  getProcessStatusList,
  getWorkTypes,
  createWorkType,
  deleteWorkType,
  saveProcessStatuses,
} from "../services/processStatusService";

const API_PATH = {
  PROCESS_STATUS: "/process-statuses",
  WORK_TYPES: "/process-statuses/work-types",
} as const;

export function useProcessStatus() {
  // 공정현황 목록
  const {
    data: processData,
    error: dataError,
    isLoading: isLoadingData,
    mutate: refreshData,
  } = useSWR(API_PATH.PROCESS_STATUS, () => getProcessStatusList(), {
    revalidateOnFocus: false,
  });

  // 공정명 목록
  const {
    data: workTypes = [],
    error: workTypesError,
    isLoading: isLoadingWorkTypes,
  } = useSWR(API_PATH.WORK_TYPES, getWorkTypes, {
    revalidateOnFocus: false,
  });

  // 공정현황 저장
  const { trigger: save, isMutating: isSaving } = useSWRMutation(
    API_PATH.PROCESS_STATUS,
    (_key, { arg }: { arg: ProcessStatusBulkRequest }) => saveProcessStatuses(arg)
  );

  // 공정명 추가
  const { trigger: addWorkType } = useSWRMutation(
    API_PATH.WORK_TYPES,
    (_key, { arg }: { arg: string }) => createWorkType(arg)
  );

  // 공정명 삭제
  const { trigger: removeWorkType } = useSWRMutation(
    API_PATH.WORK_TYPES,
    (_key, { arg }: { arg: number }) => deleteWorkType(arg)
  );

  return {
    // 데이터
    data: processData?.data ?? [],
    totalElements: processData?.totalElements ?? 0,
    workTypes: workTypes as WorkType[],

    // 상태
    isLoading: isLoadingData || isLoadingWorkTypes,
    isError: !!dataError || !!workTypesError,
    error: dataError || workTypesError,
    isSaving,

    // 액션
    save,
    refreshData,
    addWorkType,
    removeWorkType,
  };
}
