import type * as THREE from "three";

export interface ModelTransform {
  lng: number;
  lat: number;
  altitude: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scale: number;
}

export interface MaterialPreset {
  roughness?: number;
  metalness?: number;
  envMapIntensity?: number;
  transparent?: boolean;
  opacity?: number;
  side?: THREE.Side;
}
