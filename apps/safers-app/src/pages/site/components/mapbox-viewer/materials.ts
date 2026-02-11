import * as THREE from "three";
import type { MaterialPreset } from "./types";

export const MATERIAL_RULES: { pattern: RegExp; preset: MaterialPreset }[] = [
  {
    pattern: /^Material\s*#\d+$/i,
    preset: { roughness: 0.85, metalness: 0.86, envMapIntensity: 0 },
  },
  {
    pattern: /safe|net|fence/i,
    preset: {
      roughness: 1.0,
      metalness: 0,
      transparent: true,
      opacity: 1.0,
      side: THREE.DoubleSide,
    },
  },
  {
    pattern: /metal|steel|iron|rebar/i,
    preset: { roughness: 0.4, metalness: 0.85, envMapIntensity: 0 },
  },
];

export const DEFAULT_PRESET: MaterialPreset = { roughness: 0.8, metalness: 0, envMapIntensity: 0 };

export const GROUND_CLIP_PLANE = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

export function applyPreset(material: THREE.Material, clippingPlane: THREE.Plane): THREE.Material {
  const mat = material.clone() as THREE.MeshStandardMaterial;
  if (!("roughness" in mat)) return mat;

  const name = mat.name || "";
  const rule = MATERIAL_RULES.find((r) => r.pattern.test(name));
  const preset = rule?.preset ?? DEFAULT_PRESET;

  if (preset.roughness !== undefined) mat.roughness = preset.roughness;
  if (preset.metalness !== undefined) mat.metalness = preset.metalness;
  if (preset.envMapIntensity !== undefined) mat.envMapIntensity = preset.envMapIntensity;
  if (preset.transparent !== undefined) mat.transparent = preset.transparent;
  if (preset.opacity !== undefined) mat.opacity = preset.opacity;
  if (preset.side !== undefined) mat.side = preset.side;

  mat.clippingPlanes = [clippingPlane];
  mat.clipShadows = true;
  mat.needsUpdate = true;

  return mat;
}
