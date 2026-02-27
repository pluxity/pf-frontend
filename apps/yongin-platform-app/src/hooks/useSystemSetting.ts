import useSWR from "swr";
import { systemSettingsService } from "@/services/system-settings.service";

const SYSTEM_SETTINGS_KEY = "/system-settings";

export function useSystemSettings() {
  const { data, error, isLoading } = useSWR(SYSTEM_SETTINGS_KEY, () => systemSettingsService.get());

  return {
    systemSettings: data ?? null,
    isLoading,
    isError: !!error,
    error,
  };
}
