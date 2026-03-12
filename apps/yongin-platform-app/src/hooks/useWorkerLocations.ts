import useSWR from "swr";
import { getWorkerLocations } from "../services/worker-location.service";

const WORKER_LOCATIONS_KEY = "/worker-locations";

export function useWorkerLocations() {
  const { data, error, isLoading } = useSWR(WORKER_LOCATIONS_KEY, getWorkerLocations, {
    refreshInterval: 60000,
    revalidateOnFocus: false,
  });

  return {
    workers: data ?? [],
    isLoading,
    isError: !!error,
  };
}
