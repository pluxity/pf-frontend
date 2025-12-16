import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { Raycaster, Vector2 } from "three";
import type { Intersection, Object3D } from "three";

export interface UseRaycastOptions {
  objects?: Object3D[];
  recursive?: boolean;
}

export interface UseRaycastReturn {
  intersections: Intersection[];
  firstHit: Intersection | null;
  hasHit: boolean;
}

export function useRaycast(
  pointer: { x: number; y: number } | null,
  options: UseRaycastOptions = {}
): UseRaycastReturn {
  const { camera, scene } = useThree();
  const { objects = [scene], recursive = true } = options;

  const raycaster = useMemo(() => new Raycaster(), []);

  const intersections = useMemo<Intersection[]>(() => {
    if (!pointer) return [];

    const coords = new Vector2(pointer.x, pointer.y);
    raycaster.setFromCamera(coords, camera);

    return raycaster.intersectObjects(objects, recursive);
  }, [pointer, camera, objects, recursive, raycaster]);

  return {
    intersections,
    firstHit: intersections[0] ?? null,
    hasHit: intersections.length > 0,
  };
}
