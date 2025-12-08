import { Entity, ConstantProperty, ConstantPositionProperty } from "cesium";
import { coordinateToCartesian3 } from "../utils/coordinate.ts";
import type { MarkerConfig } from "../types.ts";

export function updateMarker(entity: Entity, updates: Partial<Omit<MarkerConfig, "id">>): void {
  if (updates.position) {
    const newPosition = coordinateToCartesian3(updates.position);
    entity.position = new ConstantPositionProperty(newPosition);
  }

  if (updates.label && entity.label) {
    entity.label.text = new ConstantProperty(updates.label);
  }

  if (updates.description) {
    entity.description = new ConstantProperty(updates.description);
  }

  if (updates.icon && entity.billboard) {
    entity.billboard.image = new ConstantProperty(updates.icon);
  }

  if (updates.scale !== undefined && entity.billboard) {
    entity.billboard.scale = new ConstantProperty(updates.scale);
  }
}
