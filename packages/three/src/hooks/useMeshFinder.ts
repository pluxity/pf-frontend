import { useMemo } from "react";
import type { Object3D, Mesh } from "three";

export type MeshPredicate = (mesh: Mesh) => boolean;

export function useMeshFinder(
  object: Object3D | null,
  predicate: string | MeshPredicate
): Mesh | null {
  return useMemo(() => {
    if (!object) return null;

    const matcher =
      typeof predicate === "string" ? (mesh: Mesh) => mesh.name === predicate : predicate;

    let found: Mesh | null = null;

    object.traverse((child) => {
      if (found) return;
      if ((child as Mesh).isMesh && matcher(child as Mesh)) {
        found = child as Mesh;
      }
    });

    return found;
  }, [object, predicate]);
}

export function useMeshFinderAll(
  object: Object3D | null,
  predicate: string | MeshPredicate
): Mesh[] {
  return useMemo(() => {
    if (!object) return [];

    const matcher =
      typeof predicate === "string" ? (mesh: Mesh) => mesh.name.includes(predicate) : predicate;

    const meshes: Mesh[] = [];

    object.traverse((child) => {
      if ((child as Mesh).isMesh && matcher(child as Mesh)) {
        meshes.push(child as Mesh);
      }
    });

    return meshes;
  }, [object, predicate]);
}
