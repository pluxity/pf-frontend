import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks";
import { useAuthContext } from "./AuthContext";
import type { ProtectedRouterProps } from "../types";
import type { ReactNode } from "react";

export const ProtectedRouter = ({ children, fallback }: ProtectedRouterProps): ReactNode => {
  const { user, isLoading } = useAuth();
  const { loginPath } = useAuthContext();

  if (isLoading) {
    return fallback ?? null;
  }

  if (!user) {
    return <Navigate to={loginPath} replace />;
  }

  return children;
};
