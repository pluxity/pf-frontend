import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { noticeService } from "../services";
import type { NoticeFormData } from "../types";

const NOTICES_KEY = "/notices";

export function useNotices() {
  const { data, error, isLoading, mutate } = useSWR(NOTICES_KEY, () => noticeService.getList());

  return {
    notices: data ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useNotice(id: number | null) {
  const { data, error, isLoading } = useSWR(id ? [NOTICES_KEY, id] : null, () =>
    id ? noticeService.getById(id) : null
  );

  return {
    notice: data,
    isLoading,
    isError: !!error,
    error,
  };
}

export function useCreateNotice() {
  const { trigger, isMutating, error } = useSWRMutation(
    NOTICES_KEY,
    (_, { arg }: { arg: NoticeFormData }) => noticeService.create(arg)
  );

  return {
    createNotice: trigger,
    isCreating: isMutating,
    error,
  };
}

export function useUpdateNotice() {
  const { trigger, isMutating, error } = useSWRMutation(
    NOTICES_KEY,
    (_, { arg }: { arg: { id: number; data: NoticeFormData } }) =>
      noticeService.update(arg.id, arg.data)
  );

  return {
    updateNotice: trigger,
    isUpdating: isMutating,
    error,
  };
}

export function useDeleteNotice() {
  const { trigger, isMutating, error } = useSWRMutation(
    NOTICES_KEY,
    (_, { arg }: { arg: number }) => noticeService.delete(arg)
  );

  return {
    deleteNotice: trigger,
    isDeleting: isMutating,
    error,
  };
}
