import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import type { WorkType, ProcessStatusBulkRequest } from "../types";
import {
  getProcessStatusList,
  getWorkTypes,
  saveProcessStatuses,
} from "../services/processStatusService";

// SWR 키
const PROCESS_STATUS_KEY = "/process-statuses";
const WORK_TYPES_KEY = "/process-statuses/work-types";

// 공정현황 목록 조회 훅
export function useProcessStatusList(page = 1, size = 9999) {
  const { data, error, isLoading, mutate } = useSWR(
    [PROCESS_STATUS_KEY, page, size],
    () => getProcessStatusList(page, size),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    data: data?.data ?? [],
    totalElements: data?.totalElements ?? 0,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

// 공정명 목록 조회 훅
export function useWorkTypes() {
  const { data, error, isLoading } = useSWR<WorkType[]>(WORK_TYPES_KEY, getWorkTypes, {
    revalidateOnFocus: false,
  });

  return {
    workTypes: data ?? [],
    isLoading,
    isError: !!error,
    error,
  };
}

// 공정현황 저장 뮤테이션 훅
export function useProcessStatusMutation() {
  const { trigger, isMutating, error } = useSWRMutation(
    PROCESS_STATUS_KEY,
    async (_key: string, { arg }: { arg: ProcessStatusBulkRequest }) => {
      await saveProcessStatuses(arg);
    }
  );

  return {
    save: trigger,
    isSaving: isMutating,
    error,
  };
}

// 통합 훅 - 조회 + 저장
export function useProcessStatus() {
  const {
    data,
    totalElements,
    isLoading: isLoadingData,
    isError: isDataError,
    error: dataError,
    mutate,
  } = useProcessStatusList();

  const { workTypes, isLoading: isLoadingWorkTypes, isError: isWorkTypesError } = useWorkTypes();

  const { save, isSaving, error: saveError } = useProcessStatusMutation();

  const isLoading = isLoadingData || isLoadingWorkTypes;
  const isError = isDataError || isWorkTypesError;
  const error = dataError || saveError;

  const saveAndRefresh = async (request: ProcessStatusBulkRequest) => {
    await save(request);
    await mutate();
  };

  return {
    data,
    totalElements,
    workTypes,
    isLoading,
    isError,
    error,
    isSaving,
    saveAndRefresh,
    refresh: mutate,
  };
}
