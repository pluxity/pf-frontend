import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthStore, User } from "../types";

const initialState = {
  user: null,
  isLoading: true,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,
      setUser: (user: User | null) => set({ user, isLoading: false }),
      setLoading: (isLoading: boolean) => set({ isLoading }),
      reset: () => set(initialState),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
