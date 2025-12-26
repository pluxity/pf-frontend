import { create } from "zustand";
import type {
  CameraStoreState,
  CameraActions,
  CameraState,
  OrbitControlsRef,
  LookAtFeatureOptions,
} from "../types/camera";
import type { Camera } from "three";
import { useFeatureStore } from "./featureStore";

/** 현재 진행 중인 애니메이션 ID */
let animationFrameId: number | null = null;

/** 두 상태가 동일한지 비교 (부동소수점 오차 고려) */
function isCameraStateEqual(
  a: CameraState | null,
  b: CameraState | null,
  epsilon: number = 0.0001
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;

  const arraysEqual = (arr1: number[], arr2: number[]): boolean => {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (Math.abs(arr1[i]! - arr2[i]!) >= epsilon) return false;
    }
    return true;
  };

  if (!arraysEqual(a.position, b.position)) return false;
  if (!arraysEqual(a.rotation, b.rotation)) return false;

  if (a.target && b.target) {
    if (!arraysEqual(a.target, b.target)) return false;
  } else if (a.target !== b.target) {
    return false;
  }

  return true;
}

/** 카메라 상태를 실제 카메라에서 읽어오는 헬퍼 */
function readCameraState(
  camera: Camera | null,
  controls: OrbitControlsRef | null
): CameraState | null {
  if (!camera) return null;

  const state: CameraState = {
    position: [camera.position.x, camera.position.y, camera.position.z],
    rotation: [camera.rotation.x, camera.rotation.y, camera.rotation.z],
  };

  if (controls) {
    state.target = [controls.target.x, controls.target.y, controls.target.z];
  }

  return state;
}

/** 애니메이션 없이 카메라 이동 */
function applyCameraState(
  camera: Camera,
  controls: OrbitControlsRef | null,
  state: Partial<CameraState>
) {
  if (state.position) {
    camera.position.set(state.position[0], state.position[1], state.position[2]);
  }

  if (state.rotation) {
    camera.rotation.set(state.rotation[0], state.rotation[1], state.rotation[2]);
  }

  if (state.target && controls) {
    controls.target.set(state.target[0], state.target[1], state.target[2]);
    controls.update();
  }
}

/** 애니메이션으로 카메라 이동 */
function animateCameraState(
  camera: Camera,
  controls: OrbitControlsRef | null,
  state: Partial<CameraState>,
  duration: number = 500
) {
  // 진행 중인 애니메이션 취소
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  const startTime = performance.now();
  const startPosition = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
  const startTarget = controls
    ? { x: controls.target.x, y: controls.target.y, z: controls.target.z }
    : null;

  const endPosition = state.position
    ? { x: state.position[0], y: state.position[1], z: state.position[2] }
    : startPosition;
  const endTarget =
    state.target && controls
      ? { x: state.target[0], y: state.target[1], z: state.target[2] }
      : startTarget;

  function animate() {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // easeOutCubic
    const eased = 1 - Math.pow(1 - progress, 3);

    camera.position.set(
      startPosition.x + (endPosition.x - startPosition.x) * eased,
      startPosition.y + (endPosition.y - startPosition.y) * eased,
      startPosition.z + (endPosition.z - startPosition.z) * eased
    );

    if (endTarget && controls && startTarget) {
      controls.target.set(
        startTarget.x + (endTarget.x - startTarget.x) * eased,
        startTarget.y + (endTarget.y - startTarget.y) * eased,
        startTarget.z + (endTarget.z - startTarget.z) * eased
      );
      controls.update();
    }

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      animationFrameId = null;
    }
  }

  animationFrameId = requestAnimationFrame(animate);
}

export const useCameraStore = create<CameraStoreState & CameraActions>((set, get) => ({
  currentState: null,
  config: {},
  _camera: null,
  _controls: null,

  getState: () => {
    const { _camera, _controls } = get();
    return readCameraState(_camera, _controls);
  },

  setState: (state: Partial<CameraState>, animate: boolean = false) => {
    const { _camera, _controls } = get();
    if (!_camera) {
      console.warn("[useCameraStore] Camera not initialized. Use useCameraSync inside Canvas.");
      return;
    }

    if (animate) {
      animateCameraState(_camera, _controls, state);
    } else {
      applyCameraState(_camera, _controls, state);
    }
  },

  lookAtFeature: (featureId: string, options: LookAtFeatureOptions = {}) => {
    const { distance = 10, animate = true, duration = 500 } = options;
    const { _camera, _controls } = get();

    if (!_camera) {
      console.warn("[useCameraStore] Camera not initialized. Use useCameraSync inside Canvas.");
      return;
    }

    // featureStore에서 Feature 조회
    const feature = useFeatureStore.getState().getFeature(featureId);
    if (!feature) {
      console.warn(`[useCameraStore] Feature not found: ${featureId}`);
      return;
    }

    const [fx, fy, fz] = feature.position;

    // 현재 카메라 위치에서 Feature까지의 방향 계산
    const dx = _camera.position.x - fx;
    const dy = _camera.position.y - fy;
    const dz = _camera.position.z - fz;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // 방향 벡터 정규화 (카메라가 Feature 위치와 동일하면 기본 방향 사용)
    let nx = 0,
      ny = 0.5,
      nz = 1;
    if (len > 0.001) {
      nx = dx / len;
      ny = dy / len;
      nz = dz / len;
    }

    // Feature에서 distance만큼 떨어진 위치에 카메라 배치
    const newPosition: [number, number, number] = [
      fx + nx * distance,
      fy + ny * distance,
      fz + nz * distance,
    ];

    const newState: Partial<CameraState> = {
      position: newPosition,
      target: [fx, fy, fz],
    };

    if (animate) {
      animateCameraState(_camera, _controls, newState, duration);
    } else {
      applyCameraState(_camera, _controls, newState);
    }
  },

  updateConfig: (newConfig) => {
    set({ config: { ...get().config, ...newConfig } });
  },

  _setCamera: (camera: Camera | null) => {
    set({ _camera: camera });
  },

  _setControls: (controls: OrbitControlsRef | null) => {
    set({ _controls: controls });
  },

  _syncState: () => {
    const { _camera, _controls, currentState } = get();
    const newState = readCameraState(_camera, _controls);

    // 상태가 변경되었을 때만 업데이트 (불필요한 리렌더링 방지)
    if (!isCameraStateEqual(currentState, newState)) {
      set({ currentState: newState });
    }
  },
}));

export const cameraStore = useCameraStore;
