import type { Object3D, Mesh, Material, BufferGeometry, Texture } from "three";

/**
 * Material dispose (텍스처 포함)
 */
export function disposeMaterial(material: Material | Material[]): void {
  const materials = Array.isArray(material) ? material : [material];

  materials.forEach((mat) => {
    // 텍스처 정리
    Object.keys(mat).forEach((key) => {
      const value = (mat as unknown as Record<string, unknown>)[key];
      if (value && (value as Texture).isTexture) {
        (value as Texture).dispose();
      }
    });

    mat.dispose();
  });
}

/**
 * Geometry dispose
 */
export function disposeGeometry(geometry: BufferGeometry): void {
  geometry.dispose();
}

/**
 * Mesh dispose (geometry + material)
 */
export function disposeMesh(mesh: Mesh): void {
  if (mesh.geometry) {
    disposeGeometry(mesh.geometry);
  }

  if (mesh.material) {
    disposeMaterial(mesh.material);
  }
}

/**
 * 씬 전체 dispose (재귀적)
 */
export function disposeScene(object: Object3D): void {
  object.traverse((child) => {
    if ((child as Mesh).isMesh) {
      disposeMesh(child as Mesh);
    }
  });

  // 자식 제거
  while (object.children.length > 0) {
    const child = object.children[0];
    if (child) {
      object.remove(child);
    }
  }
}

/**
 * 선택적 dispose (Mesh만)
 */
export function disposeMeshes(object: Object3D, predicate?: (mesh: Mesh) => boolean): void {
  const meshesToDispose: Mesh[] = [];

  object.traverse((child) => {
    if ((child as Mesh).isMesh) {
      const mesh = child as Mesh;
      if (!predicate || predicate(mesh)) {
        meshesToDispose.push(mesh);
      }
    }
  });

  meshesToDispose.forEach((mesh) => {
    if (mesh.parent) {
      mesh.parent.remove(mesh);
    }
    disposeMesh(mesh);
  });
}
