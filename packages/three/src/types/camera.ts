import type { Camera } from "three";

export interface CameraState {
  position: [number, number, number];
  rotation: [number, number, number];
  target?: [number, number, number];
}

/** @deprecated Use CameraState instead */
export type CameraPosition = CameraState;

export interface CameraConfig {
  fov?: number;
  near?: number;
  far?: number;
  enableDamping?: boolean;
  dampingFactor?: number;
  enablePan?: boolean;
  enableZoom?: boolean;
  enableRotate?: boolean;
  minDistance?: number;
  maxDistance?: number;
  minPolarAngle?: number;
  maxPolarAngle?: number;
}

export interface LookAtFeatureOptions {
  distance?: number;
  animate?: boolean;
  duration?: number;
}

export interface OrbitControlsRef {
  target: { x: number; y: number; z: number; set: (x: number, y: number, z: number) => void };
  update: () => void;
}

export interface CameraStoreState {
  currentState: CameraState | null;
  config: CameraConfig;
  _camera: Camera | null;
  _controls: OrbitControlsRef | null;
}

export interface CameraActions {
  getState: () => CameraState | null;
  setState: (state: Partial<CameraState>, animate?: boolean) => void;
  lookAtFeature: (featureId: string, options?: LookAtFeatureOptions) => void;
  updateConfig: (config: Partial<CameraConfig>) => void;
  _setCamera: (camera: Camera | null) => void;
  _setControls: (controls: OrbitControlsRef | null) => void;
  _syncState: () => void;
}

export type CameraStore = CameraStoreState & CameraActions;
