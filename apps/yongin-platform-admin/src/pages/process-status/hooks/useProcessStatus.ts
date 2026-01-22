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

const PROCESS_STATUS_KEY = "/process-statuses";
const WORK_TYPES_KEY = "/process-statuses/work-types";

export function useProcessStatus() {
  const {
    data: processData,
    error: dataError,
    isLoading: isLoadingData,
    mutate: mutateData,
  } = useSWR([PROCESS_STATUS_KEY], () => getProcessStatusList(), {
    revalidateOnFocus: false,
  });

  const {
    data: workTypesData,
    error: workTypesError,
    isLoading: isLoadingWorkTypes,
    mutate: mutateWorkTypes,
  } = useSWR<WorkType[]>(WORK_TYPES_KEY, getWorkTypes, {
    revalidateOnFocus: false,
  });

  const { trigger: save, isMutating: isSaving } = useSWRMutation(
    PROCESS_STATUS_KEY,
    async (_key: string, { arg }: { arg: ProcessStatusBulkRequest }) => {
      await saveProcessStatuses(arg);
    }
  );

  const addWorkType = async (name: string) => {
    await createWorkType(name);
    await mutateWorkTypes();
  };

  const removeWorkType = async (id: number) => {
    await deleteWorkType(id);
    await mutateWorkTypes();
  };

  const saveAndRefresh = async (request: ProcessStatusBulkRequest) => {
    await save(request);
    await mutateData();
  };

  return {
    data: processData?.data ?? [],
    totalElements: processData?.totalElements ?? 0,
    workTypes: workTypesData ?? [],
    isLoading: isLoadingData || isLoadingWorkTypes,
    isError: !!dataError || !!workTypesError,
    error: dataError || workTypesError,
    isSaving,
    saveAndRefresh,
    refresh: mutateData,
    addWorkType,
    removeWorkType,
  };
}
