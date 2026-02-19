import useSWR from "swr";
import { getLatestAttendances } from "../services/attendance.service";

const API_PATH = {
  ATTENDANCES_LATEST: "/attendances/latest",
} as const;

export function useAttendance() {
  const {
    data: attendanceData,
    error: dataError,
    isLoading: isLoadingData,
  } = useSWR(API_PATH.ATTENDANCES_LATEST, getLatestAttendances, {
    refreshInterval: 600000,
    revalidateOnFocus: false,
  });

  return {
    data: attendanceData ?? [],
    isLoading: isLoadingData,
    isError: !!dataError,
    error: dataError,
  };
}
