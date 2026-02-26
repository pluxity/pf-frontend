import useSWR from "swr";
import { noticeService } from "@/services/notice.service";

const NOTICES_KEY = "/notices";

export function useNotices() {
  const { data, error, isLoading } = useSWR(NOTICES_KEY, () => noticeService.getActive());

  return {
    notices: data ?? [],
    isLoading,
    isError: !!error,
    error,
  };
}
