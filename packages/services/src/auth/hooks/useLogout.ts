import { useCallback, useState } from "react";
import { authApi } from "../api";
import { useAuthStore } from "../store";
import type { UseLogoutOptions, UseLogoutReturn } from "../types";

export const useLogout = (options?: UseLogoutOptions): UseLogoutReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const reset = useAuthStore((state) => state.reset);

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      await authApi.logout();
      reset();
      options?.onSuccess?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error("로그아웃 실패");
      options?.onError?.(error);
      reset();
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [reset, options]);

  return {
    logout,
    isLoading,
  };
};
