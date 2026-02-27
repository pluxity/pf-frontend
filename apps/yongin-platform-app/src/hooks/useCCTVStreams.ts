import useSWR from "swr";
import { cctvService } from "@/services";

const CCTVS_KEY = "/cctvs";

export function useCCTVStreams() {
  const { data, error, isLoading } = useSWR(CCTVS_KEY, () => cctvService.getCctvs());

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
