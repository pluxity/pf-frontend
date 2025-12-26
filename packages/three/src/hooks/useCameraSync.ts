import { useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useCameraStore } from "../store/cameraStore";
import type { OrbitControlsRef } from "../types/camera";

export function useCameraSync(controlsRef?: React.RefObject<OrbitControlsRef | null>): void {
  const camera = useThree((state) => state.camera);
  const { _setCamera, _setControls, _syncState } = useCameraStore();

  useEffect(() => {
    _setCamera(camera);

    return () => {
      _setCamera(null);
    };
  }, [camera, _setCamera]);

  useEffect(() => {
    if (controlsRef?.current) {
      _setControls(controlsRef.current);
    }

    return () => {
      _setControls(null);
    };
  }, [controlsRef, _setControls]);

  useFrame(() => {
    _syncState();
  });
}
