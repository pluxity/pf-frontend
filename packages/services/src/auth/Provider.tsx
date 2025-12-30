import { useEffect, type ReactNode } from "react";
import { getMe } from "./api";
import { useAuthStore } from "./store";
import { AuthContext } from "./context";

interface AuthProviderProps {
  children: ReactNode;
  loginPath?: string;
  onAuthError?: (error: Error) => void;
}

export function AuthProvider({ children, loginPath = "/login", onAuthError }: AuthProviderProps) {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch((error) => {
        setUser(null);
        if (error instanceof Error) onAuthError?.(error);
      });
  }, [setUser, onAuthError]);

  return <AuthContext.Provider value={{ loginPath }}>{children}</AuthContext.Provider>;
}
