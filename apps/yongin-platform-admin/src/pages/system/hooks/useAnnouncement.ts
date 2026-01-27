import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { announcementService } from "../services";
import type { AnnouncementFormData } from "../types";

const ANNOUNCEMENT_KEY = "/announcement";

export function useAnnouncement() {
  const { data, error, isLoading, mutate } = useSWR(ANNOUNCEMENT_KEY, () =>
    announcementService.get()
  );

  return {
    announcement: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useUpdateAnnouncement() {
  const { trigger, isMutating, error } = useSWRMutation(
    ANNOUNCEMENT_KEY,
    async (_, { arg }: { arg: AnnouncementFormData }) => {
      await announcementService.update(arg);
    }
  );

  return {
    updateAnnouncement: trigger,
    isUpdating: isMutating,
    error,
  };
}
