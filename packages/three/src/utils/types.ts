import type { Object3D, Mesh, Vector3 } from "three";

export type TraverseCallback = (object: Object3D) => void;
export type MeshCallback = (mesh: Mesh) => void;
export type MeshPredicate = (mesh: Mesh) => boolean;

export interface MeshInfo {
  name: string;
  vertices: number;
  triangles: number;
  boundingBox: {
    min: Vector3;
    max: Vector3;
    size: Vector3;
    center: Vector3;
  };
}
