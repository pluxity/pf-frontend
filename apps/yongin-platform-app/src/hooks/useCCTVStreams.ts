import useSWR from "swr";
import { cctvService } from "@/services";

const PATHS_KEY = "/media/paths";

export function useCCTVStreams() {
  const { data, error, isLoading } = useSWR(PATHS_KEY, () => cctvService.getCctvs());

  return {
    cctvs: data ?? [],
    itemCount: data?.length ?? 0,
    isLoading,
    isError: !!error,
    error,
    getHLSUrl: cctvService.getHLSUrl,
    getWHEPUrl: cctvService.getWHEPUrl,
  };
}
