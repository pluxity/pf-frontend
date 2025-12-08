import { Viewer, Math as CesiumMath } from "cesium";
import { coordinateToCartesian3 } from "../utils/coordinate.ts";
import type { CameraDestination } from "../types.ts";

export function setView(viewer: Viewer, destination: CameraDestination): void {
  viewer.camera.setView({
    destination: coordinateToCartesian3(destination),
    orientation: {
      heading: destination.heading ? CesiumMath.toRadians(destination.heading) : undefined,
      pitch: destination.pitch ? CesiumMath.toRadians(destination.pitch) : undefined,
      roll: destination.roll ? CesiumMath.toRadians(destination.roll) : undefined,
    },
  });
}
