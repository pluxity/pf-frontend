import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { systemSettingService } from "../services";
import type { UpdateSystemSetting } from "../types";

const SYSTEM_SETTING_KEY = "/system-settings";

export function useSystemSetting() {
  const { data, error, isLoading, mutate } = useSWR(SYSTEM_SETTING_KEY, () =>
    systemSettingService.get()
  );

  return {
    setting: data ?? null,
    isLoading,
    error,
    mutate,
  };
}

export function useUpdateSystemSetting() {
  const { trigger, isMutating, error } = useSWRMutation(
    SYSTEM_SETTING_KEY,
    async (_, { arg }: { arg: UpdateSystemSetting }) => {
      await systemSettingService.update(arg);
    }
  );

  return {
    updateSetting: trigger,
    isUpdating: isMutating,
    error,
  };
}
