import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { getAttendanceList, updateAttendances } from "../services";

const API_PATH = {
  ATTENDANCES: "/attendances",
} as const;

export function useAttendance() {
  const {
    data: attendanceData,
    error: dataError,
    isLoading: isLoadingData,
    mutate: refreshData,
  } = useSWR(API_PATH.ATTENDANCES, () => getAttendanceList(), {
    revalidateOnFocus: false,
  });

  const { trigger: save, isMutating: isSaving } = useSWRMutation(
    API_PATH.ATTENDANCES,
    (_key, { arg }: { arg: { id: number; workContent: string }[] }) => updateAttendances(arg)
  );

  return {
    data: attendanceData?.data ?? [],
    totalElements: attendanceData?.totalElements ?? 0,
    isLoading: isLoadingData,
    isError: !!dataError,
    error: dataError,
    isSaving,
    save,
    refreshData,
  };
}
