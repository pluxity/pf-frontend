import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore, selectUser, selectIsLoading } from "./store";
import { useAuthContext } from "./context";
import type { ReactNode } from "react";

interface ProtectedRouterProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedRouter({ children, fallback }: ProtectedRouterProps) {
  const user = useAuthStore(selectUser);
  const isLoading = useAuthStore(selectIsLoading);
  const { loginPath } = useAuthContext();
  const location = useLocation();

  if (isLoading) return fallback ?? null;
  if (!user) {
    // 현재 경로를 returnUrl 파라미터로 저장
    const returnUrl = location.pathname + location.search;
    return <Navigate to={`${loginPath}?returnUrl=${encodeURIComponent(returnUrl)}`} replace />;
  }

  return <>{children}</>;
}
