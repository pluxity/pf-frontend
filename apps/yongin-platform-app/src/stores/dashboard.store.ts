import { create } from "zustand";

const PAGE_COUNT = 2;

interface DashboardState {
  page: number;
  isPlaying: boolean;
}

interface DashboardActions {
  next: () => void;
  prev: () => void;
  togglePlay: () => void;
  pause: () => void;
  play: () => void;
}

type DashboardStore = DashboardState & DashboardActions;

export const useDashboardStore = create<DashboardStore>()((set) => ({
  page: 0,
  isPlaying: true,

  next: () => set((state) => ({ page: (state.page + 1) % PAGE_COUNT })),
  prev: () => set((state) => ({ page: (state.page - 1 + PAGE_COUNT) % PAGE_COUNT })),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  pause: () => set({ isPlaying: false }),
  play: () => set({ isPlaying: true }),
}));

export const selectPage = (state: DashboardStore) => state.page;
export const selectIsPlaying = (state: DashboardStore) => state.isPlaying;
