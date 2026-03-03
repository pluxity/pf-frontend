import { create } from "zustand";
import type { SystemSetting } from "../types";

interface SystemSettingState {
  data: SystemSetting | null;
  isLoading: boolean;
  error: Error | null;
  setData: (data: SystemSetting) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
}

export const useSystemSettingStore = create<SystemSettingState>((set) => ({
  data: null,
  isLoading: true,
  error: null,
  setData: (data) => set({ data, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
}));
