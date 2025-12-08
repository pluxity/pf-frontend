import { CustomDataSource } from "cesium";
import { coordinateToCartesian3 } from "../utils/coordinate.ts";
import type { MarkerConfig } from "../types.ts";

export function updateCluster(dataSource: CustomDataSource, markers: MarkerConfig[]): void {
  // 기존 엔티티 제거
  dataSource.entities.removeAll();

  // 새 마커 추가
  markers.forEach((markerConfig) => {
    const position = coordinateToCartesian3(markerConfig.position);

    dataSource.entities.add({
      id: markerConfig.id,
      position,
      billboard: markerConfig.icon
        ? {
            image: markerConfig.icon,
            scale: markerConfig.scale ?? 1.0,
          }
        : undefined,
      label: markerConfig.label
        ? {
            text: markerConfig.label,
          }
        : undefined,
      description: markerConfig.description,
    });
  });
}
