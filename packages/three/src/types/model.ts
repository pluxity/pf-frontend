import type { Group, Object3D } from "three";
import type { GLTF } from "three-stdlib";

export type ModelStatus = "loading" | "loaded" | "error";

export interface LoadedModel {
  id: string;
  url: string;
  object: Group | Object3D;
  gltf?: GLTF;
  loadedAt: number;
  status: ModelStatus;
  error?: string;
  progress?: number;
}

export interface ModelState {
  models: Map<string, LoadedModel>;
}

export interface ModelActions {
  addModel: (model: Omit<LoadedModel, "loadedAt">) => void;
  getModel: (id: string) => LoadedModel | null;
  removeModel: (id: string) => void;
  updateModelStatus: (id: string, status: ModelStatus, error?: string) => void;
  updateModelProgress: (id: string, progress: number) => void;
  getAllModels: () => LoadedModel[];
  getModelsByStatus: (status: ModelStatus) => LoadedModel[];
  clearAll: () => void;
  disposeModel: (id: string) => void;
}

export type ModelStore = ModelState & ModelActions;
