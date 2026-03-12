import useSWR from "swr";
import { getWorkerLocations } from "../services/worker-location.service";

const API_PATH = {
  WORKER_LOCATIONS: "/worker-locations",
} as const;

export function useWorkerLocations() {
  const { data, error, isLoading } = useSWR(API_PATH.WORKER_LOCATIONS, getWorkerLocations, {
    refreshInterval: 60000,
    revalidateOnFocus: false,
  });

  return {
    workers: data ?? [],
    isLoading,
    isError: !!error,
  };
}
