import { create } from "zustand";

const MAX_POPUPS = 4;

export interface CCTVPopupEntry {
  featureId: string;
  streamUrl: string;
}

interface CCTVPopupState {
  popups: CCTVPopupEntry[];
}

interface CCTVPopupActions {
  openPopup: (featureId: string, streamUrl: string) => void;
  closePopup: (featureId: string) => void;
  closeAll: () => void;
}

type CCTVPopupStore = CCTVPopupState & CCTVPopupActions;

export const useCCTVPopupStore = create<CCTVPopupStore>()((set) => ({
  popups: [],

  openPopup(featureId, streamUrl) {
    set((state) => {
      // Already open — bring to end (most recent)
      const existing = state.popups.find((p) => p.featureId === featureId);
      if (existing) return state;

      const next = [...state.popups, { featureId, streamUrl }];
      // FIFO: remove oldest if exceeding max
      if (next.length > MAX_POPUPS) {
        next.shift();
      }
      return { popups: next };
    });
  },

  closePopup(featureId) {
    set((state) => ({
      popups: state.popups.filter((p) => p.featureId !== featureId),
    }));
  },

  closeAll() {
    set({ popups: [] });
  },
}));

export const selectCCTVPopups = (state: CCTVPopupStore) => state.popups;
