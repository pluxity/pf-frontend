import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useCameraStore } from "../store/cameraStore";
import type { OrbitControlsRef } from "../types/camera";

export function useCameraSync(controlsRef?: React.RefObject<OrbitControlsRef | null>): void {
  const camera = useThree((state) => state.camera);
  const { _setCamera, _setControls, _syncState } = useCameraStore();
  const prevControlsRef = useRef<OrbitControlsRef | null>(null);

  useEffect(() => {
    _setCamera(camera);

    return () => {
      _setCamera(null);
    };
  }, [camera, _setCamera]);

  useEffect(() => {
    return () => {
      _setControls(null);
    };
  }, [_setControls]);

  useFrame(() => {
    const currentControls = controlsRef?.current ?? null;
    if (prevControlsRef.current !== currentControls) {
      _setControls(currentControls);
      prevControlsRef.current = currentControls;
    }
    _syncState();
  });
}
