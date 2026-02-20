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

export interface MaterialRule {
  pattern: RegExp;
  preset: MaterialPreset;
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

export type LocationType = "indoor" | "outdoor";

export interface WorkerLocation {
  locationType: LocationType;
  floor: string;
  floorNumber: number;
}

export interface DangerZone {
  id: string;
  name: string;
  coordinates: [number, number][];
}

export interface SelectedFeatureData {
  id: string;
  lng: number;
  lat: number;
  altitude: number;
  vitals: WorkerVitals | null;
  streamUrl: string | null;
  location: WorkerLocation | null;
}

export interface ThreeOverlayHandle {
  render: (matrix: number[]) => boolean;
  raycast: (screenX: number, screenY: number, width: number, height: number) => RaycastHit | null;
  highlightFeature: (id: string, color?: number) => void;
  clearHighlight: () => void;
  projectFeatureToScreen: (id: string, width: number, height: number) => ScreenPosition | null;
  getFeaturePosition: (id: string) => FeaturePosition | null;
  getWorkerVitals: (id: string) => WorkerVitals | null;
  swapFeatureAsset: (id: string, newAssetId: string) => void;
  updateWorkerVitals: (id: string, vitals: WorkerVitals) => void;
  setBuildingOpacity: (opacity: number) => void;
  setBuildingClipAltitude: (altitude: number | null, workerPosition?: FeaturePosition) => void;
  checkOcclusion: (featureId: string) => boolean;
  moveFeatureTo: (
    id: string,
    target: FeaturePosition,
    durationMs: number,
    onComplete?: () => void
  ) => void;
  moveFeatureAlongPath: (
    id: string,
    path: FeaturePosition[],
    durationMs: number,
    onComplete?: () => void
  ) => void;
  getInitialPosition: (id: string) => FeaturePosition | null;
  setFeatureHeading: (id: string, radians: number) => void;
  setFeatureFOV: (id: string, fovDeg: number, range: number, pitchDeg?: number) => void;
  setFeatureFOVVisible: (id: string, visible: boolean) => void;
  setFOVColor: (id: string, color: number) => void;
  getWorkerLocation: (id: string) => WorkerLocation | null;
  updateWorkerLocation: (id: string, location: WorkerLocation) => void;
  getCCTVStreamUrl: (id: string) => string | null;
  getAllFeatureScreenPositions: (width: number, height: number) => Map<string, ScreenPosition>;
  highlightFeatures: (ids: string[], color?: number) => void;
  pushLivePosition: (id: string, position: FeaturePosition, lerpMs?: number) => void;
  addFeatureMarker: (id: string, color?: number, radius?: number) => void;
  removeFeatureMarker: (id: string) => void;
  clearAllMarkers: () => void;
  setDangerZones: (zones: DangerZone[]) => void;
  startPatrol: (id: string, path: FeaturePosition[], durationMs: number) => void;
  stopPatrol: (id: string) => void;
  probeAltitude: (lng: number, lat: number) => number | null;
}
