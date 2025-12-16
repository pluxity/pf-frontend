import { create } from "zustand";
import type { ModelState, ModelActions } from "../types/model.ts";

// ============================================================================
// Store
// ============================================================================

export const useModelStore = create<ModelState & ModelActions>((set, get) => ({
  // State
  models: new Map(),

  // Actions
  addModel: (model) => {
    const models = new Map(get().models); // 불변성
    models.set(model.id, { ...model, loadedAt: Date.now() });
    set({ models });
  },

  getModel: (id) => {
    return get().models.get(id) ?? null;
  },

  removeModel: (id) => {
    const models = new Map(get().models);
    models.delete(id);
    set({ models });
  },

  updateModelStatus: (id, status, error) => {
    const models = new Map(get().models);
    const model = models.get(id);
    if (model) {
      models.set(id, { ...model, status, error });
      set({ models });
    }
  },

  updateModelProgress: (id, progress) => {
    const models = new Map(get().models);
    const model = models.get(id);
    if (model) {
      models.set(id, { ...model, progress });
      set({ models });
    }
  },

  getAllModels: () => {
    return Array.from(get().models.values());
  },

  getModelsByStatus: (status) => {
    return Array.from(get().models.values()).filter((m) => m.status === status);
  },

  clearAll: () => {
    set({ models: new Map() });
  },

  disposeModel: (id) => {
    const model = get().models.get(id);
    if (model) {
      // Lazy import로 순환 참조 방지 (mapStore 패턴)
      import("../utils/dispose.ts").then(({ disposeScene }) => {
        disposeScene(model.object);
      });
      get().removeModel(id);
    }
  },
}));

// Alias for convenience
export const modelStore = useModelStore;
