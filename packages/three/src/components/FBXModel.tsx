import { type ReactNode, useEffect } from "react";
import { useFBXLoader } from "../loaders/useFBXLoader";
import type { Group, Mesh } from "three";

export interface FBXModelProps {
  url: string;
  modelId?: string;
  autoAddToStore?: boolean;

  // Transform
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];

  // Shadow
  castShadow?: boolean;
  receiveShadow?: boolean;

  // Callbacks
  onProgress?: (progress: number) => void;
  onLoaded?: (object: Group) => void;
  onError?: (error: Error) => void;

  // Children: render props pattern or regular children
  children?: ReactNode | ((object: Group) => ReactNode);
}

export function FBXModel({
  url,
  modelId,
  autoAddToStore = true,
  position,
  rotation,
  scale,
  castShadow = false,
  receiveShadow = false,
  onProgress,
  onLoaded,
  onError,
  children,
}: FBXModelProps) {
  const { object, isLoading, error } = useFBXLoader(url, {
    modelId,
    autoAddToStore,
    onProgress,
    onLoaded,
    onError,
  });

  // Apply shadow settings to all meshes
  useEffect(() => {
    if (!object) return;

    object.traverse((child) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh;
        mesh.castShadow = castShadow;
        mesh.receiveShadow = receiveShadow;
      }
    });
  }, [object, castShadow, receiveShadow]);

  if (isLoading || !object) return null;
  if (error) return null;

  return (
    <primitive object={object} position={position} rotation={rotation} scale={scale}>
      {typeof children === "function" ? children(object) : children}
    </primitive>
  );
}
