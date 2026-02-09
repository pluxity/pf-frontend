import type { Material, MeshStandardMaterial, Color, Object3D } from "three";
import type { MaterialPreset, MaterialPresetsConfig } from "../types/material";
import { traverseMeshes } from "./traverse";

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

function matchesPattern(name: string, pattern: RegExp | string): boolean {
  if (typeof pattern === "string") {
    return name.includes(pattern);
  }
  return pattern.test(name);
}

export function findMatchingPreset(
  materialName: string,
  config: MaterialPresetsConfig
): MaterialPreset | undefined {
  const matched = config.rules.find((rule) => matchesPattern(materialName, rule.pattern));
  return matched?.preset ?? config.default;
}

function applyPresetToMaterial(material: Material, preset: MaterialPreset): void {
  if (!("metalness" in material) || !("roughness" in material)) return;

  const mat = material as MeshStandardMaterial;
  const { color, emissive, ...rest } = preset;

  if (color !== undefined && mat.color) {
    mat.color.set(color);
  }

  if (emissive !== undefined && mat.emissive) {
    mat.emissive.set(emissive);
  }

  Object.assign(mat, rest);
  mat.needsUpdate = true;
}

export function applyMaterialPresets(object: Object3D, config: MaterialPresetsConfig): void {
  traverseMeshes(object, (mesh) => {
    const materials = getAllMaterials(mesh.material);

    const updated = materials.map((mat) => {
      const preset = findMatchingPreset(mat.name, config);
      if (!preset) return mat;

      const cloned = mat.clone();
      applyPresetToMaterial(cloned, preset);
      return cloned;
    });

    if (updated.length === 0) return;

    mesh.material = Array.isArray(mesh.material) ? updated : updated[0]!;
  });
}
