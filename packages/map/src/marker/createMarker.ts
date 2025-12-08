import { Viewer, Entity, Color, Cartesian3, VerticalOrigin, HorizontalOrigin } from "cesium";
import { coordinateToCartesian3 } from "../utils/coordinate.ts";
import { useViewerStore } from "../viewer/store.ts";
import type { MarkerConfig } from "../types.ts";

export function createMarker(viewer: Viewer, config: MarkerConfig): Entity {
  const position = coordinateToCartesian3(config.position);

  const entityConfig: Entity.ConstructorOptions = {
    id: config.id,
    position,
    billboard: config.icon
      ? {
          image: config.icon,
          scale: config.scale ?? 1.0,
          verticalOrigin: VerticalOrigin.BOTTOM,
          horizontalOrigin: HorizontalOrigin.CENTER,
        }
      : undefined,
    point: !config.icon
      ? {
          pixelSize: 10,
          color: config.color ? Color.fromCssColorString(config.color) : Color.RED,
          outlineColor: Color.WHITE,
          outlineWidth: 2,
        }
      : undefined,
    label: config.label
      ? {
          text: config.label,
          font: "14px sans-serif",
          verticalOrigin: VerticalOrigin.TOP,
          pixelOffset: new Cartesian3(0, 10, 0),
          fillColor: Color.WHITE,
          outlineColor: Color.BLACK,
          outlineWidth: 2,
          style: 2, // LabelStyle.FILL_AND_OUTLINE
        }
      : undefined,
    description: config.description,
  };

  const entity = viewer.entities.add(entityConfig);

  // Store에 추가
  useViewerStore.getState().addMarker(config.id, entity);

  // 클릭 이벤트 핸들러 등록 (전역 핸들러 사용)
  if (config.onClick) {
    useViewerStore.getState().setMarkerClickHandler(config.id, config.onClick);
  }

  return entity;
}

export function createMarkers(viewer: Viewer, configs: MarkerConfig[]): Entity[] {
  return configs.map((config) => createMarker(viewer, config));
}
