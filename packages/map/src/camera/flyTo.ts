import { Viewer, Math as CesiumMath } from "cesium";
import { coordinateToCartesian3 } from "../utils/coordinate.ts";
import type { FlyToOptions } from "../types.ts";

export function flyTo(viewer: Viewer, options: FlyToOptions): void {
  const { destination, duration = 2, complete, cancel } = options;

  viewer.camera.flyTo({
    destination: coordinateToCartesian3(destination),
    orientation: {
      heading: destination.heading ? CesiumMath.toRadians(destination.heading) : undefined,
      pitch: destination.pitch ? CesiumMath.toRadians(destination.pitch) : undefined,
      roll: destination.roll ? CesiumMath.toRadians(destination.roll) : undefined,
    },
    duration,
    complete,
    cancel,
  });
}
