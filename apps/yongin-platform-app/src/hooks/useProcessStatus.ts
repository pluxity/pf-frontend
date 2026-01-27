import useSWR from "swr";
import { processStatusService } from "@/services";

const PROCESS_STATUS_KEY = "/process-statuses/latest";

export function useProcessStatus() {
  const { data, error, isLoading } = useSWR(PROCESS_STATUS_KEY, () =>
    processStatusService.getLatest()
  );

  const items = data ?? [];

  const overallPlanned =
    items.length > 0
      ? Math.round(items.reduce((sum, s) => sum + s.plannedRate, 0) / items.length)
      : 0;

  const overallActual =
    items.length > 0
      ? Math.round(items.reduce((sum, s) => sum + s.actualRate, 0) / items.length)
      : 0;

  return {
    items,
    overallPlanned,
    overallActual,
    isLoading,
    isError: !!error,
    error,
  };
}
