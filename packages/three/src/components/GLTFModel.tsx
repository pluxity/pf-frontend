import type { ReactNode } from "react";
import { useGLTFLoader } from "../loaders/useGLTFLoader.ts";
import type { Group } from "three";
import type { GLTF } from "three-stdlib";

export interface GLTFModelProps {
  url: string;
  modelId?: string;
  autoAddToStore?: boolean;

  // Transform
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];

  // Callbacks
  onProgress?: (progress: number) => void;
  onLoaded?: (gltf: GLTF) => void;
  onError?: (error: Error) => void;

  // Children: render props pattern or regular children
  children?: ReactNode | ((scene: Group) => ReactNode);
}

export function GLTFModel({
  url,
  modelId,
  autoAddToStore = true,
  position,
  rotation,
  scale,
  onProgress,
  onLoaded,
  onError,
  children,
}: GLTFModelProps) {
  const { scene, isLoading, error } = useGLTFLoader(url, {
    modelId,
    autoAddToStore,
    onProgress,
    onLoaded,
    onError,
  });

  if (isLoading || !scene) return null;
  if (error) return null;

  return (
    <primitive object={scene} position={position} rotation={rotation} scale={scale}>
      {typeof children === "function" ? children(scene) : children}
    </primitive>
  );
}
