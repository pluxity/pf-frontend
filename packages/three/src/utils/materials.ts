import type { Material, MeshStandardMaterial, Color } from "three";

/**
 * Material 복제
 */
export function cloneMaterial<T extends Material>(material: T): T {
  return material.clone() as T;
}

/**
 * Material 속성 업데이트
 */
export function updateMaterialProps(
  material: Material,
  props: Partial<MeshStandardMaterial>
): void {
  Object.assign(material, props);
  material.needsUpdate = true;
}

/**
 * Material 색상 변경
 */
export function setMaterialColor(
  material: MeshStandardMaterial,
  color: Color | string | number
): void {
  material.color.set(color);
  material.needsUpdate = true;
}

/**
 * Material 투명도 설정
 */
export function setMaterialOpacity(material: Material, opacity: number): void {
  material.opacity = opacity;
  material.transparent = opacity < 1;
  material.needsUpdate = true;
}

/**
 * 모든 Material 찾기
 */
export function getAllMaterials(material: Material | Material[]): Material[] {
  return Array.isArray(material) ? material : [material];
}
