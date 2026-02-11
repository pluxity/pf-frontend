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

export interface ScreenPosition {
  x: number;
  y: number;
}

export interface RaycastHit {
  lng: number;
  lat: number;
  altitude: number;
  meshName: string;
  featureId?: string;
}

export interface FeaturePosition {
  lng: number;
  lat: number;
  altitude: number;
}

export interface AssetOptions {
  scale?: number;
}

export interface WorkerVitals {
  temperature: number;
  heartRate: number;
}

export interface ThreeOverlayHandle {
  render: (matrix: number[]) => boolean;
  raycast: (screenX: number, screenY: number, width: number, height: number) => RaycastHit | null;
  highlightFeature: (id: string, color?: number) => void;
  clearHighlight: () => void;
  projectFeatureToScreen: (id: string, width: number, height: number) => ScreenPosition | null;
  getWorkerVitals: (id: string) => WorkerVitals | null;
  swapFeatureAsset: (id: string, newAssetId: string) => void;
  updateWorkerVitals: (id: string, vitals: WorkerVitals) => void;
  setBuildingOpacity: (opacity: number) => void;
  checkOcclusion: (featureId: string) => boolean;
}
