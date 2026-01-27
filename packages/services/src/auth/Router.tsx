import { Navigate, useLocation } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "./store";
import { useAuthContext } from "./context";
import type { ReactNode } from "react";

interface ProtectedRouterProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedRouter({ children, fallback }: ProtectedRouterProps) {
  const { user, isLoading } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
      isLoading: state.isLoading,
    }))
  );
  const { loginPath } = useAuthContext();
  const location = useLocation();

  if (isLoading) return fallback ?? null;
  if (!user) {
    const returnUrl = location.pathname + location.search;
    return <Navigate to={`${loginPath}?returnUrl=${encodeURIComponent(returnUrl)}`} replace />;
  }

  return <>{children}</>;
}
