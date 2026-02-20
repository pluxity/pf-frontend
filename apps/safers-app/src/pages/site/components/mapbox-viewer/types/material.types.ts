import type * as THREE from "three";

export interface MaterialPreset {
  roughness?: number;
  metalness?: number;
  envMapIntensity?: number;
  transparent?: boolean;
  opacity?: number;
  side?: THREE.Side;
}

export interface MaterialRule {
  pattern: RegExp;
  preset: MaterialPreset;
}

export interface AssetOptions {
  scale?: number;
}
