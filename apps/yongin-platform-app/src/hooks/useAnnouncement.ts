import useSWR from "swr";
import { announcementService } from "@/services";

const ANNOUNCEMENT_KEY = "/announcement";

export function useAnnouncement() {
  const { data, error, isLoading } = useSWR(ANNOUNCEMENT_KEY, () => announcementService.get());

  return {
    announcement: data,
    content: data?.content ?? "",
    isLoading,
    isError: !!error,
    error,
  };
}
