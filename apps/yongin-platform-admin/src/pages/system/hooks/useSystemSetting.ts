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
  const { isUpdating, error, setData, setUpdating, setError } = useSystemSettingStore();

  const updateSetting = async (updateData: UpdateSystemSetting) => {
    try {
      setUpdating(true);
      setError(null);
      await systemSettingService.update(updateData);
      const result = await systemSettingService.get();
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("설정 저장에 실패했습니다");
      setError(error);
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  return {
    updateSetting,
    isUpdating,
    error,
  };
}
