import {
  Viewer,
  CustomDataSource,
  Color,
  VerticalOrigin,
  HorizontalOrigin,
  Cartesian3,
} from "cesium";
import { coordinateToCartesian3 } from "../utils/coordinate.ts";
import { useViewerStore } from "../viewer/store.ts";
import type { MarkerConfig, ClusterConfig } from "../types.ts";

export async function createCluster(
  viewer: Viewer,
  id: string,
  markers: MarkerConfig[],
  config: ClusterConfig = { enabled: true }
): Promise<CustomDataSource> {
  const dataSource = new CustomDataSource(id);

  // 마커 추가
  markers.forEach((markerConfig) => {
    const position = coordinateToCartesian3(markerConfig.position);

    dataSource.entities.add({
      id: markerConfig.id,
      position,
      billboard: markerConfig.icon
        ? {
            image: markerConfig.icon,
            scale: markerConfig.scale ?? 1.0,
            verticalOrigin: VerticalOrigin.BOTTOM,
            horizontalOrigin: HorizontalOrigin.CENTER,
          }
        : undefined,
      point: !markerConfig.icon
        ? {
            pixelSize: 10,
            color: markerConfig.color ? Color.fromCssColorString(markerConfig.color) : Color.RED,
            outlineColor: Color.WHITE,
            outlineWidth: 2,
          }
        : undefined,
      label: markerConfig.label
        ? {
            text: markerConfig.label,
            font: "14px sans-serif",
            verticalOrigin: VerticalOrigin.TOP,
            pixelOffset: new Cartesian3(0, 10, 0),
            fillColor: Color.WHITE,
            outlineColor: Color.BLACK,
            outlineWidth: 2,
            style: 2, // LabelStyle.FILL_AND_OUTLINE
          }
        : undefined,
      description: markerConfig.description,
    });
  });

  // 클러스터링 설정
  if (config.enabled) {
    dataSource.clustering.enabled = true;
    dataSource.clustering.pixelRange = config.pixelRange ?? 50;
    dataSource.clustering.minimumClusterSize = config.minimumClusterSize ?? 2;

    // 클러스터 스타일 커스터마이징
    // @ts-expect-error - Cesium clustering event typing
    dataSource.clustering.clusterEvent.addEventListener((entities, cluster) => {
      cluster.billboard.show = true;
      cluster.billboard.image = createClusterIcon(entities.length);
      cluster.billboard.verticalOrigin = VerticalOrigin.BOTTOM;

      cluster.label.show = true;
      cluster.label.text = entities.length.toString();
      cluster.label.font = "bold 16px sans-serif";
      cluster.label.fillColor = Color.WHITE;
      cluster.label.outlineColor = Color.BLACK;
      cluster.label.outlineWidth = 2;
      cluster.label.style = 2; // LabelStyle.FILL_AND_OUTLINE
      cluster.label.verticalOrigin = VerticalOrigin.CENTER;
    });
  }

  await viewer.dataSources.add(dataSource);

  // Store에 추가
  useViewerStore.getState().addCluster(id, dataSource);

  return dataSource;
}

/**
 * 클러스터 아이콘 생성 (간단한 원형 아이콘)
 */
function createClusterIcon(count: number): string {
  const size = Math.min(count * 5 + 40, 100);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) return "";

  // 원 그리기
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
  ctx.fillStyle = "rgba(255, 0, 0, 0.7)";
  ctx.fill();
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.stroke();

  return canvas.toDataURL();
}
