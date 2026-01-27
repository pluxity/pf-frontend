import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore, selectUser, selectIsLoading, selectIsLoggingOut } from "./store";
import { useAuthContext } from "./context";
import type { ReactNode } from "react";

interface ProtectedRouterProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedRouter({ children, fallback }: ProtectedRouterProps) {
  const user = useAuthStore(selectUser);
  const isLoading = useAuthStore(selectIsLoading);
  const isLoggingOut = useAuthStore(selectIsLoggingOut);
  const { loginPath } = useAuthContext();
  const location = useLocation();

  if (isLoading) return fallback ?? null;
  if (!user) {
    if (isLoggingOut) {
      return <Navigate to={loginPath} replace />;
    }
    const returnUrl = location.pathname + location.search;
    return <Navigate to={`${loginPath}?returnUrl=${encodeURIComponent(returnUrl)}`} replace />;
  }

  return <>{children}</>;
}
