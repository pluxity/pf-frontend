import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useCameraStore } from "../store/cameraStore";
import type { OrbitControlsRef } from "../types/camera";

/**
 * 카메라 스토어와 실제 Three.js 카메라를 동기화하는 훅
 *
 * Canvas 내부에서 호출해야 합니다.
 * OrbitControls를 사용하는 경우, controls ref를 전달하세요.
 *
 * @example
 * ```tsx
 * function Scene() {
 *   const controlsRef = useRef<OrbitControls>(null);
 *
 *   useCameraSync(controlsRef);
 *
 *   return (
 *     <>
 *       <OrbitControls ref={controlsRef} />
 *       <mesh>...</mesh>
 *     </>
 *   );
 * }
 * ```
 */
export function useCameraSync(controlsRef?: React.RefObject<OrbitControlsRef | null>): void {
  const camera = useThree((state) => state.camera);
  const { _setCamera, _setControls, _syncState } = useCameraStore();
  const isInitialized = useRef(false);

  // 카메라 참조 설정
  useEffect(() => {
    _setCamera(camera);

    return () => {
      _setCamera(null);
    };
  }, [camera, _setCamera]);

  // 컨트롤 참조 설정
  useEffect(() => {
    if (controlsRef?.current) {
      _setControls(controlsRef.current);
    }

    return () => {
      _setControls(null);
    };
  }, [controlsRef, _setControls]);

  // 초기 상태 동기화 및 매 프레임 상태 업데이트
  useFrame(() => {
    if (!isInitialized.current) {
      _syncState();
      isInitialized.current = true;
    }

    // 매 프레임마다 상태 동기화 (카메라가 외부에서 변경될 수 있음)
    _syncState();
  });
}
