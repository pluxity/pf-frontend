import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "./types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isLoggingOut: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isLoggingOut: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,
      setUser: (user) => set({ user, isLoading: false, isLoggingOut: false }),
      setLoading: (isLoading) => set({ isLoading }),
      reset: () => set({ ...initialState, isLoading: false, isLoggingOut: true }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export const selectUser = (state: AuthStore) => state.user;
export const selectIsLoading = (state: AuthStore) => state.isLoading;
export const selectIsLoggingOut = (state: AuthStore) => state.isLoggingOut;
export const selectIsAuthenticated = (state: AuthStore) => state.user !== null;
