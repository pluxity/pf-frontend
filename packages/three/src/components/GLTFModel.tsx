import type { ReactNode } from "react";
import { useEffect } from "react";
import { useGLTFLoader } from "../loaders/useGLTFLoader";
import type { Group, Mesh } from "three";
import type { GLTF } from "three-stdlib";

export interface GLTFModelProps {
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
  castShadow = false,
  receiveShadow = false,
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

  // Apply shadow settings to all meshes
  useEffect(() => {
    if (!scene) return;

    scene.traverse((child) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh;
        mesh.castShadow = castShadow;
        mesh.receiveShadow = receiveShadow;
      }
    });
  }, [scene, castShadow, receiveShadow]);

  if (isLoading || !scene) return null;
  if (error) return null;

  return (
    <primitive object={scene} position={position} rotation={rotation} scale={scale}>
      {typeof children === "function" ? children(scene) : children}
    </primitive>
  );
}
