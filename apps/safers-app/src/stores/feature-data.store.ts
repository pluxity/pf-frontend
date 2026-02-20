import { create } from "zustand";
import type { WorkerVitals, WorkerLocation } from "@/services/types";

interface FeatureDataState {
  vitals: Map<string, WorkerVitals>;
  locations: Map<string, WorkerLocation>;
  cctvStreamUrls: Map<string, string>;
}

interface FeatureDataActions {
  getWorkerVitals: (id: string) => WorkerVitals | null;
  updateWorkerVitals: (id: string, vitals: WorkerVitals) => void;
  getWorkerLocation: (id: string) => WorkerLocation | null;
  updateWorkerLocation: (id: string, location: WorkerLocation) => void;
  getCCTVStreamUrl: (id: string) => string | null;
  setCCTVStreamUrl: (id: string, url: string) => void;
  reset: () => void;
}

type FeatureDataStore = FeatureDataState & FeatureDataActions;

const initialState: FeatureDataState = {
  vitals: new Map(),
  locations: new Map(),
  cctvStreamUrls: new Map(),
};

export const useFeatureDataStore = create<FeatureDataStore>()((set, get) => ({
  ...initialState,

  getWorkerVitals(id) {
    return get().vitals.get(id) ?? null;
  },
  updateWorkerVitals(id, vitals) {
    set((state) => {
      const next = new Map(state.vitals);
      next.set(id, vitals);
      return { vitals: next };
    });
  },
  getWorkerLocation(id) {
    return get().locations.get(id) ?? null;
  },
  updateWorkerLocation(id, location) {
    set((state) => {
      const next = new Map(state.locations);
      next.set(id, location);
      return { locations: next };
    });
  },
  getCCTVStreamUrl(id) {
    return get().cctvStreamUrls.get(id) ?? null;
  },
  setCCTVStreamUrl(id, url) {
    set((state) => {
      const next = new Map(state.cctvStreamUrls);
      next.set(id, url);
      return { cctvStreamUrls: next };
    });
  },
  reset() {
    set({
      vitals: new Map(),
      locations: new Map(),
      cctvStreamUrls: new Map(),
    });
  },
}));
