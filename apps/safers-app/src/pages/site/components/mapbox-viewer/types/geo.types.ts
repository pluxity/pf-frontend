import type { GeoPosition } from "@/services/types/worker.types";

/** mapbox-viewer 내부 alias — 서비스 계층의 GeoPosition과 동일 */
export type FeaturePosition = GeoPosition;

export interface ModelTransform {
  lng: number;
  lat: number;
  altitude: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scale: number;
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
