import { useEffect, useRef, type ReactNode } from "react";
import { authApi } from "../api";
import { useAuthStore } from "../store";
import { AuthContext } from "./AuthContext";
import type { AuthProviderProps } from "../types";

export const AuthProvider = ({
  children,
  loginPath = "/login",
  onAuthError,
}: AuthProviderProps): ReactNode => {
  const setUser = useAuthStore((state) => state.setUser);
  const onAuthErrorRef = useRef(onAuthError);

  useEffect(() => {
    onAuthErrorRef.current = onAuthError;
  }, [onAuthError]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await authApi.getMe();
        setUser(user);
      } catch (error) {
        setUser(null);
        if (onAuthErrorRef.current && error instanceof Error) {
          onAuthErrorRef.current(error);
        }
      }
    };

    initAuth();
  }, [setUser]);

  return <AuthContext.Provider value={{ loginPath }}>{children}</AuthContext.Provider>;
};
