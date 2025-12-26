import type { Camera } from "three";

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

/** lookAtFeature 함수의 옵션 */
export interface LookAtFeatureOptions {
  /** Feature로부터의 거리 (기본값: 10) */
  distance?: number;
  /** 애니메이션 여부 (기본값: true) */
  animate?: boolean;
  /** 애니메이션 시간 ms (기본값: 500) */
  duration?: number;
}

/** OrbitControls 인터페이스 (drei의 OrbitControls 타입) */
export interface OrbitControlsRef {
  target: { x: number; y: number; z: number; set: (x: number, y: number, z: number) => void };
  update: () => void;
}

/** 카메라 스토어 상태 */
export interface CameraStoreState {
  /** 현재 카메라 상태 (캐시) */
  currentState: CameraState | null;
  /** 카메라 설정 */
  config: CameraConfig;
  /** @internal Three.js 카메라 참조 */
  _camera: Camera | null;
  /** @internal OrbitControls 참조 */
  _controls: OrbitControlsRef | null;
}

/** 카메라 스토어 액션 */
export interface CameraActions {
  /**
   * 현재 카메라 상태 조회
   * 실제 카메라에서 position, rotation, target을 가져옴
   */
  getState: () => CameraState | null;

  /**
   * 카메라 상태 설정 (실제 카메라 이동)
   * @param state - 이동할 카메라 상태
   * @param animate - 애니메이션 여부 (기본값: false)
   */
  setState: (state: Partial<CameraState>, animate?: boolean) => void;

  /**
   * 특정 Feature를 바라보도록 카메라 이동
   * @param featureId - 바라볼 Feature의 ID
   * @param options - 이동 옵션 (distance, animate, duration)
   */
  lookAtFeature: (featureId: string, options?: LookAtFeatureOptions) => void;

  /**
   * 카메라 설정 업데이트
   */
  updateConfig: (config: Partial<CameraConfig>) => void;

  /** @internal 카메라 참조 설정 (useCameraSync에서 사용) */
  _setCamera: (camera: Camera | null) => void;

  /** @internal 컨트롤 참조 설정 (useCameraSync에서 사용) */
  _setControls: (controls: OrbitControlsRef | null) => void;

  /** @internal 현재 상태 캐시 업데이트 */
  _syncState: () => void;
}

export type CameraStore = CameraStoreState & CameraActions;
