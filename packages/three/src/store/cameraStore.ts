import { create } from "zustand";
import type { CameraStoreState, CameraActions, CameraState } from "../types/camera";

export const useCameraStore = create<CameraStoreState & CameraActions>((set, get) => ({
  currentState: null,
  config: {},
  savedStates: new Map(),

  // New API
  setState: (state: CameraState) => {
    set({ currentState: state });
  },

  getState: () => {
    return get().currentState;
  },

  updateConfig: (newConfig) => {
    set({ config: { ...get().config, ...newConfig } });
  },

  saveState: (name) => {
    const state = get().currentState;
    if (state) {
      const savedStates = new Map(get().savedStates);
      savedStates.set(name, state);
      set({ savedStates });
    }
  },

  restoreState: (name) => {
    const state = get().savedStates.get(name);
    if (state) {
      set({ currentState: state });
      return true;
    }
    return false;
  },

  clearState: (name) => {
    const savedStates = new Map(get().savedStates);
    savedStates.delete(name);
    set({ savedStates });
  },

  getAllSavedStates: () => {
    return Array.from(get().savedStates.keys());
  },

  _updateState: (state: CameraState) => {
    set({ currentState: state });
  },

  // Deprecated aliases for backward compatibility
  setPosition: (state: CameraState) => {
    set({ currentState: state });
  },

  getPosition: () => {
    return get().currentState;
  },

  _updatePosition: (state: CameraState) => {
    set({ currentState: state });
  },
}));

export const cameraStore = useCameraStore;
