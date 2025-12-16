import { useEffect } from "react";
import type { Object3D, Mesh } from "three";
import type { TraverseCallback, MeshCallback } from "../utils/types.ts";

export function useModelTraverse(
  object: Object3D | null,
  callback: TraverseCallback,
  dependencies: unknown[] = []
) {
  useEffect(() => {
    if (!object) return;

    object.traverse(callback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [object, callback, ...dependencies]);
}

export function useMeshTraverse(
  object: Object3D | null,
  callback: MeshCallback,
  dependencies: unknown[] = []
) {
  useEffect(() => {
    if (!object) return;

    object.traverse((child) => {
      if ((child as Mesh).isMesh) {
        callback(child as Mesh);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [object, callback, ...dependencies]);
}
