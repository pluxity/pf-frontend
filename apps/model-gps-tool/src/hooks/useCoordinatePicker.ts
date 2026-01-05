import { useEffect } from "react";
import {
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Cartographic,
  Math as CesiumMath,
  type Viewer,
} from "cesium";

interface Coordinate {
  longitude: number;
  latitude: number;
}

interface UseCoordinatePickerProps {
  viewer: Viewer | null;
  enabled: boolean;
  setClickedCoord: (coord: Coordinate | null) => void;
}

export function useCoordinatePicker({
  viewer,
  enabled,
  setClickedCoord,
}: UseCoordinatePickerProps) {
  useEffect(() => {
    if (!viewer || viewer.isDestroyed() || !enabled) {
      return;
    }

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((movement: ScreenSpaceEventHandler.PositionedEvent) => {
      const cartesian = viewer.scene.pickPosition(movement.position);

      if (!cartesian) return;

      const cartographic = Cartographic.fromCartesian(cartesian);

      setClickedCoord({
        longitude: CesiumMath.toDegrees(cartographic.longitude),
        latitude: CesiumMath.toDegrees(cartographic.latitude),
      });
    }, ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      if (!handler.isDestroyed()) {
        handler.destroy();
      }
    };
  }, [viewer, enabled, setClickedCoord]);
}
