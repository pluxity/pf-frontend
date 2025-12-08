import {
  Viewer,
  IonImageryProvider,
  OpenStreetMapImageryProvider,
  BingMapsImageryProvider,
  BingMapsStyle,
  ArcGisMapServerImageryProvider,
} from "cesium";
import type { ImageryConfig } from "../types.ts";

export async function setupImagery(viewer: Viewer, config: ImageryConfig): Promise<void> {
  // 기존 이미지리 레이어 제거
  viewer.imageryLayers.removeAll();

  let imageryProvider;

  switch (config.provider) {
    case "ion":
      imageryProvider = await IonImageryProvider.fromAssetId(config.assetId ?? 2);
      break;

    case "osm":
      imageryProvider = new OpenStreetMapImageryProvider({
        url: "https://tile.openstreetmap.org/",
      } as ConstructorParameters<typeof OpenStreetMapImageryProvider>[0]);
      break;

    case "bing":
      if (!config.key) {
        throw new Error("Bing Maps requires an API key");
      }
      imageryProvider = await BingMapsImageryProvider.fromUrl("https://dev.virtualearth.net", {
        key: config.key,
        mapStyle: BingMapsStyle.AERIAL_WITH_LABELS_ON_DEMAND,
      });
      break;

    case "arcgis":
      imageryProvider = await ArcGisMapServerImageryProvider.fromUrl(
        "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
      );
      break;

    default:
      throw new Error(`Unknown imagery provider: ${config.provider}`);
  }

  viewer.imageryLayers.addImageryProvider(imageryProvider);
}
