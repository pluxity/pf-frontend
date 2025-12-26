/** 카메라의 위치, 회전, 타겟 상태 */
export interface CameraState {
  /** 카메라 위치 (x, y, z) */
  position: [number, number, number];
  /** 카메라 회전 (Euler angles: x, y, z) */
  rotation: [number, number, number];
  /** 바라보는 지점 (optional) */
  target?: [number, number, number];
}

/** @deprecated CameraState를 사용하세요 */
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

/** 카메라 스토어 상태 */
export interface CameraStoreState {
  currentState: CameraState | null;
  config: CameraConfig;
  savedStates: Map<string, CameraState>;
}

/** 카메라 스토어 액션 */
export interface CameraActions {
  setState: (state: CameraState) => void;
  getState: () => CameraState | null;
  updateConfig: (config: Partial<CameraConfig>) => void;
  saveState: (name: string) => void;
  restoreState: (name: string) => boolean;
  clearState: (name: string) => void;
  getAllSavedStates: () => string[];
  /** @internal */
  _updateState: (state: CameraState) => void;

  // Deprecated aliases for backward compatibility
  /** @deprecated setState를 사용하세요 */
  setPosition: (state: CameraState) => void;
  /** @deprecated getState를 사용하세요 */
  getPosition: () => CameraState | null;
  /** @deprecated _updateState를 사용하세요 */
  _updatePosition: (state: CameraState) => void;
}

export type CameraStore = CameraStoreState & CameraActions;
