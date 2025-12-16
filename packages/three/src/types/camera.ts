export interface CameraPosition {
  position: [number, number, number];
  target: [number, number, number];
}

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

export interface CameraState {
  currentPosition: CameraPosition | null;
  config: CameraConfig;
  savedStates: Map<string, CameraPosition>;
}

export interface CameraActions {
  setPosition: (position: CameraPosition) => void;
  getPosition: () => CameraPosition | null;
  updateConfig: (config: Partial<CameraConfig>) => void;
  saveState: (name: string) => void;
  restoreState: (name: string) => boolean;
  clearState: (name: string) => void;
  getAllSavedStates: () => string[];
  _updatePosition: (position: CameraPosition) => void;
}

export type CameraStore = CameraState & CameraActions;
