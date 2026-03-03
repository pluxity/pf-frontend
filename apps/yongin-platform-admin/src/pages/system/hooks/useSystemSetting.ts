import { useEffect } from "react";
import { useSystemSettingStore } from "../stores/systemSettingStore";
import { systemSettingService } from "../services";
import type { UpdateSystemSetting } from "../types";

export function useSystemSetting() {
  const { data, isLoading, error, setData, setLoading, setError } = useSystemSettingStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await systemSettingService.get();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("설정을 불러올 수 없습니다"));
      }
    };

    fetchData();
  }, []);

  return {
    data,
    isLoading,
    error,
  };
}

export function useUpdateSystemSetting() {
  const { setData } = useSystemSettingStore();

  const updateSetting = async (updateData: UpdateSystemSetting) => {
    try {
      await systemSettingService.update(updateData);
      const result = await systemSettingService.get();
      setData(result);
    } catch (err) {
      throw err instanceof Error ? err : new Error("설정 저장에 실패했습니다");
    }
  };

  return {
    updateSetting,
    isUpdating: false,
    error: null,
  };
}
