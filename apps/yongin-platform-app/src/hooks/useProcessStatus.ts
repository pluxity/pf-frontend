import { useMemo } from "react";
import useSWR from "swr";
import { processStatusService } from "@/services";
import type { ProcessStatusData } from "@/services";

const PROCESS_STATUS_KEY = "/process-statuses";
const OVERALL_WORK_TYPE_NAME = "전체";

export function useProcessStatus() {
  const { data, error, isLoading } = useSWR(
    PROCESS_STATUS_KEY,
    () => processStatusService.getProcessStatuses(),
    { refreshInterval: 600000 }
  );

  const { overallStatus, workStatuses, latestDate } = useMemo(() => {
    const allStatuses = data ?? [];

    // 가장 최근 workDate 찾기
    const latestDate = allStatuses.reduce<string | null>((latest, row) => {
      if (!latest || row.workDate > latest) return row.workDate;
      return latest;
    }, null);

    // 최근 피리어드 데이터만 필터링
    const latestData = latestDate ? allStatuses.filter((row) => row.workDate === latestDate) : [];

    // "전체" 항목 분리
    let overallStatus: ProcessStatusData | null = null;
    const workStatuses: ProcessStatusData[] = [];

    for (const row of latestData) {
      if (row.workTypeName === OVERALL_WORK_TYPE_NAME) {
        overallStatus = row;
      } else {
        workStatuses.push(row);
      }
    }

    return { overallStatus, workStatuses, latestDate };
  }, [data]);

  return {
    overallStatus,
    workStatuses,
    latestDate,
    isLoading,
    isError: !!error,
    error,
  };
}
