import { type ReactNode } from "react";
import { useFBXLoader } from "../loaders/useFBXLoader.ts";
import type { Group } from "three";

export interface FBXModelProps {
  url: string;
  modelId?: string;
  autoAddToStore?: boolean;

  // Transform
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];

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

  if (isLoading || !object) return null;
  if (error) return null;

  return (
    <primitive object={object} position={position} rotation={rotation} scale={scale}>
      {typeof children === "function" ? children(object) : children}
    </primitive>
  );
}
