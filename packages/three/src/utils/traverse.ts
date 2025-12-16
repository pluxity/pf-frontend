import type { Object3D, Mesh } from "three";
import type { TraverseCallback, MeshCallback, MeshPredicate } from "./types.ts";

/**
 * 객체 트리를 순회하며 콜백 실행
 */
export function traverseModel(object: Object3D, callback: TraverseCallback): void {
  object.traverse(callback);
}

/**
 * Mesh만 필터링하여 순회
 */
export function traverseMeshes(object: Object3D, callback: MeshCallback): void {
  object.traverse((child) => {
    if ((child as Mesh).isMesh) {
      callback(child as Mesh);
    }
  });
}

/**
 * 조건에 맞는 모든 Mesh 찾기
 */
export function filterMeshes(object: Object3D, predicate: MeshPredicate): Mesh[] {
  const meshes: Mesh[] = [];

  object.traverse((child) => {
    if ((child as Mesh).isMesh && predicate(child as Mesh)) {
      meshes.push(child as Mesh);
    }
  });

  return meshes;
}

/**
 * 이름으로 Mesh 찾기
 */
export function findMeshByName(object: Object3D, name: string, exact = true): Mesh | null {
  let found: Mesh | null = null;

  const matcher = exact
    ? (mesh: Mesh) => mesh.name === name
    : (mesh: Mesh) => mesh.name.includes(name);

  object.traverse((child) => {
    if (found) return;
    if ((child as Mesh).isMesh && matcher(child as Mesh)) {
      found = child as Mesh;
    }
  });

  return found;
}

/**
 * 이름 패턴으로 모든 Mesh 찾기
 */
export function findMeshesByName(object: Object3D, pattern: string | RegExp): Mesh[] {
  const meshes: Mesh[] = [];

  const matcher =
    typeof pattern === "string"
      ? (mesh: Mesh) => mesh.name.includes(pattern)
      : (mesh: Mesh) => pattern.test(mesh.name);

  object.traverse((child) => {
    if ((child as Mesh).isMesh && matcher(child as Mesh)) {
      meshes.push(child as Mesh);
    }
  });

  return meshes;
}
