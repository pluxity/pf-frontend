import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "../store";
import type { AuthState } from "../types";

export interface UseAuthReturn extends AuthState {
  isAuthenticated: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const { user, isLoading } = useAuthStore(
    useShallow((state) => ({ user: state.user, isLoading: state.isLoading }))
  );

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
};
