import { Entity } from "cesium";
import { coordinateToCartesian3 } from "../utils/coordinate.ts";
import type { MarkerConfig } from "../types.ts";

export function updateMarker(entity: Entity, updates: Partial<Omit<MarkerConfig, "id">>): void {
  if (updates.position) {
    // @ts-expect-error - Cesium Entity position typing
    entity.position = coordinateToCartesian3(updates.position);
  }

  if (updates.label && entity.label) {
    // @ts-expect-error - Cesium Property typing
    entity.label.text = updates.label;
  }

  if (updates.description) {
    // @ts-expect-error - Cesium Property typing
    entity.description = updates.description;
  }

  if (updates.icon && entity.billboard) {
    // @ts-expect-error - Cesium Property typing
    entity.billboard.image = updates.icon;
  }

  if (updates.scale !== undefined && entity.billboard) {
    // @ts-expect-error - Cesium Property typing
    entity.billboard.scale = updates.scale;
  }
}
