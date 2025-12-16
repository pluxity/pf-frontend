import { Box3, Vector3 } from "three";
import type { Mesh, BufferGeometry } from "three";
import type { MeshInfo } from "./types.ts";

/**
 * Mesh 정보 추출
 */
export function getMeshInfo(mesh: Mesh): MeshInfo {
  const geometry = mesh.geometry;
  const vertices = geometry.attributes.position?.count ?? 0;
  const triangles = geometry.index ? geometry.index.count / 3 : vertices / 3;

  const box = new Box3().setFromObject(mesh);
  const size = new Vector3();
  const center = new Vector3();
  box.getSize(size);
  box.getCenter(center);

  return {
    name: mesh.name,
    vertices,
    triangles,
    boundingBox: {
      min: box.min.clone(),
      max: box.max.clone(),
      size,
      center,
    },
  };
}

/**
 * 바운딩 박스 계산
 */
export function computeBoundingBox(geometry: BufferGeometry): Box3 {
  if (!geometry.boundingBox) {
    geometry.computeBoundingBox();
  }
  return geometry.boundingBox!;
}

/**
 * 중심점 계산
 */
export function getCenterPoint(mesh: Mesh): Vector3 {
  const box = new Box3().setFromObject(mesh);
  return box.getCenter(new Vector3());
}

/**
 * 크기 계산
 */
export function getSize(mesh: Mesh): Vector3 {
  const box = new Box3().setFromObject(mesh);
  return box.getSize(new Vector3());
}
