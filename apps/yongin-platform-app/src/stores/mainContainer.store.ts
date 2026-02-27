import { create } from "zustand";

interface MainContainerState {
  requestedTab: string | null;
}

interface MainContainerActions {
  requestTab: (tab: string) => void;
  clearRequest: () => void;
}

type MainContainerStore = MainContainerState & MainContainerActions;

export const useMainContainerStore = create<MainContainerStore>()((set) => ({
  requestedTab: null,

  requestTab: (tab) => set({ requestedTab: tab }),
  clearRequest: () => set({ requestedTab: null }),
}));
