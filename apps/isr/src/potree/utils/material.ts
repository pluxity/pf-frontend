import * as THREE from "three";
import { OUTLINE } from "../constants";

export function createPotreeCompatibleTexture(
  originalTexture: THREE.Texture
): THREE.Texture | null {
  if (!originalTexture.image) return null;

  const newTexture = new THREE.Texture(originalTexture.image);
  newTexture.flipY = originalTexture.flipY;
  newTexture.wrapS = originalTexture.wrapS;
  newTexture.wrapT = originalTexture.wrapT;
  newTexture.colorSpace = THREE.SRGBColorSpace;
  newTexture.needsUpdate = true;

  return newTexture;
}

export function createPotreeCompatibleMaterial(
  originalMaterial: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial
): THREE.MeshBasicMaterial {
  if (originalMaterial.map && originalMaterial.map.image) {
    const newTexture = createPotreeCompatibleTexture(originalMaterial.map);
    return new THREE.MeshBasicMaterial({
      map: newTexture,
      side: THREE.DoubleSide,
    });
  }

  return new THREE.MeshBasicMaterial({
    color: 0xcccccc,
    side: THREE.DoubleSide,
  });
}

export function createOutlineMesh(
  geometry: THREE.BufferGeometry,
  color: number,
  scale: number = OUTLINE.DEFAULT_SCALE
): THREE.Mesh {
  const outlineMaterial = new THREE.MeshBasicMaterial({
    color,
    side: THREE.BackSide,
  });

  const outlineMesh = new THREE.Mesh(geometry.clone(), outlineMaterial);
  outlineMesh.scale.multiplyScalar(scale);

  return outlineMesh;
}

export function applyPotreeCompatibleMaterials(
  model: THREE.Object3D,
  outlineColor?: number,
  outlineScale?: number
): void {
  model.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return;

    const mesh = child as THREE.Mesh;
    const originalMaterial = mesh.material as THREE.MeshPhysicalMaterial;

    mesh.material = createPotreeCompatibleMaterial(originalMaterial);

    if (outlineColor !== undefined) {
      const outlineMesh = createOutlineMesh(mesh.geometry, outlineColor, outlineScale);
      mesh.add(outlineMesh);
    }
  });
}
