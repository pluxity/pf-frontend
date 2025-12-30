import { useCallback, useState } from "react";
import { authApi } from "../api";
import { useAuthStore } from "../store";
import type { LoginCredentials, UseLoginOptions, UseLoginReturn } from "../types";

export const useLogin = (options?: UseLoginOptions): UseLoginReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const setUser = useAuthStore((state) => state.setUser);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authApi.login(credentials);
        setUser(response.user);
        options?.onSuccess?.(response);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("로그인 실패");
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [setUser, options]
  );

  return {
    login,
    isLoading,
    error,
  };
};
