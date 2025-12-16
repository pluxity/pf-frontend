import { create } from "zustand";
import type { CameraState, CameraActions } from "../types/camera.ts";

// ============================================================================
// Store
// ============================================================================

export const useCameraStore = create<CameraState & CameraActions>((set, get) => ({
  // State
  currentPosition: null,
  config: {},
  savedStates: new Map(),

  // Actions
  setPosition: (position) => {
    set({ currentPosition: position });
  },

  getPosition: () => {
    return get().currentPosition;
  },

  updateConfig: (newConfig) => {
    set({ config: { ...get().config, ...newConfig } });
  },

  saveState: (name) => {
    const position = get().currentPosition;
    if (position) {
      const savedStates = new Map(get().savedStates);
      savedStates.set(name, position);
      set({ savedStates });
    }
  },

  restoreState: (name) => {
    const position = get().savedStates.get(name);
    if (position) {
      set({ currentPosition: position });
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

  _updatePosition: (position) => {
    set({ currentPosition: position });
  },
}));

// Alias for convenience
export const cameraStore = useCameraStore;
