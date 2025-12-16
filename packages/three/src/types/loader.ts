import type { Group, AnimationClip } from "three";
import type { GLTF } from "three-stdlib";

export type LoaderState = "idle" | "loading" | "loaded" | "error";

export interface LoaderProgress {
  loaded: number;
  total: number;
  percent: number;
}

export interface LoaderOptions {
  autoAddToStore?: boolean;
  modelId?: string;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
}

export interface UseGLTFLoaderOptions extends LoaderOptions {
  onLoaded?: (gltf: GLTF) => void;
}

export interface UseGLTFLoaderReturn {
  gltf: GLTF | null;
  scene: Group | null;
  animations: AnimationClip[];
  isLoading: boolean;
  progress: number;
  error: Error | null;
}

export interface UseFBXLoaderOptions extends LoaderOptions {
  onLoaded?: (object: Group) => void;
}

export interface UseFBXLoaderReturn {
  object: Group | null;
  isLoading: boolean;
  progress: number;
  error: Error | null;
}
