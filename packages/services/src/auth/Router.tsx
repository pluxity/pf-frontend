import { Navigate } from "react-router-dom";
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

  if (isLoading) return fallback ?? null;
  if (!user) return <Navigate to={loginPath} replace />;

  return <>{children}</>;
}
