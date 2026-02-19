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

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const today = `${year}-${month}-${day}`;

  const todayData = attendanceData?.filter((item) => item.attendanceDate === today) ?? [];

  return {
    data: todayData,
    isLoading: isLoadingData,
    isError: !!dataError,
    error: dataError,
  };
}
