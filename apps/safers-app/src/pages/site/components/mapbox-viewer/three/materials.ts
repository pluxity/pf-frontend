import * as THREE from "three";
import type { MaterialPreset, MaterialRule } from "../types";

export const MATERIAL_RULES: MaterialRule[] = [
  {
    pattern: /^Material\s*#\d+$/i,
    preset: { roughness: 0.85, metalness: 0, envMapIntensity: 0.2 },
  },
  {
    pattern: /safe|net|fence/i,
    preset: {
      roughness: 1.0,
      metalness: 0,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    },
  },
  {
    pattern: /metal|steel/i,
    preset: { roughness: 0.3, metalness: 0.9, envMapIntensity: 0.8 },
  },
  {
    pattern: /iron|rebar/i,
    preset: { roughness: 0.35, metalness: 0.85, envMapIntensity: 0.6 },
  },
];

export const DEFAULT_PRESET: MaterialPreset = {
  roughness: 0.8,
  metalness: 0,
  envMapIntensity: 0.2,
};

export const GROUND_CLIP_PLANE = new THREE.Plane(new THREE.Vector3(0, 0, 1), 1);

export function applyPreset(
  material: THREE.Material,
  clippingPlane: THREE.Plane,
  rules?: MaterialRule[]
): THREE.Material {
  if (!(material instanceof THREE.MeshStandardMaterial)) return material.clone();
  const mat = material.clone();

  const name = mat.name || "";
  const activeRules = rules ?? MATERIAL_RULES;
  const rule = activeRules.find((r) => r.pattern.test(name));
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
