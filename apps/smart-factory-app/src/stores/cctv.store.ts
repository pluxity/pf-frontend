import { create } from "zustand";

export interface CCTVPopup {
  id: string;
  label: string;
  streamUrl: string;
  triggeredBy?: string;
}

interface CCTVPopupState {
  popups: CCTVPopup[];
}

interface CCTVPopupActions {
  openPopup: (popup: CCTVPopup) => void;
  closePopup: (id: string) => void;
  closeAll: () => void;
}

type CCTVPopupStore = CCTVPopupState & CCTVPopupActions;

const MAX_POPUPS = 4;

export const useCCTVPopupStore = create<CCTVPopupStore>()((set) => ({
  popups: [],

  openPopup: (popup) =>
    set((state) => {
      // Skip if already open
      if (state.popups.some((p) => p.id === popup.id)) return state;

      const next = [...state.popups, popup];
      // FIFO: remove oldest if exceeding max
      if (next.length > MAX_POPUPS) {
        return { popups: next.slice(next.length - MAX_POPUPS) };
      }
      return { popups: next };
    }),

  closePopup: (id) =>
    set((state) => ({
      popups: state.popups.filter((p) => p.id !== id),
    })),

  closeAll: () => set({ popups: [] }),
}));

// Selectors
export const selectPopups = (s: CCTVPopupStore) => s.popups;
