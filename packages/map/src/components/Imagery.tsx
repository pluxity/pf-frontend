import { useEffect, useRef } from "react";
import {
  OpenStreetMapImageryProvider,
  ArcGisMapServerImageryProvider,
  IonImageryProvider,
  BingMapsImageryProvider,
  WebMapTileServiceImageryProvider,
  ImageryLayer,
  Credit,
} from "cesium";
import type { ImageryProvider } from "cesium";
import { useMapStore } from "../store/index.ts";
import type { ImageryProps, ImageryProviderType, VWorldLayer } from "../types/index.ts";

export type { ImageryProps, ImageryProviderType, VWorldLayer };

async function createImageryProvider(
  provider: ImageryProviderType,
  assetId?: number,
  apiKey?: string,
  vworldLayer: VWorldLayer = "Base"
): Promise<ImageryProvider> {
  switch (provider) {
    case "ion":
      if (!assetId) throw new Error("Ion imagery requires assetId");
      return await IonImageryProvider.fromAssetId(assetId);

    case "osm":
      return new OpenStreetMapImageryProvider({ url: "https://tile.openstreetmap.org/" });

    case "bing":
      if (!apiKey) throw new Error("Bing imagery requires apiKey");
      return await BingMapsImageryProvider.fromUrl("https://dev.virtualearth.net", { key: apiKey });

    case "arcgis":
      return await ArcGisMapServerImageryProvider.fromUrl(
        "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
      );

    case "vworld": {
      if (!apiKey) throw new Error("VWorld imagery requires apiKey");
      const ext = vworldLayer === "Satellite" ? "jpeg" : "png";
      return new WebMapTileServiceImageryProvider({
        url: `https://api.vworld.kr/req/wmts/1.0.0/${apiKey}/${vworldLayer}/{TileMatrix}/{TileRow}/{TileCol}.${ext}`,
        layer: vworldLayer,
        style: "default",
        format: `image/${ext}`,
        tileMatrixSetID: "EPSG:3857",
        maximumLevel: 18,
        credit: new Credit("VWorld"),
      });
    }

    default:
      throw new Error(`Unknown imagery provider: ${provider}`);
  }
}

export function Imagery({ provider, assetId, apiKey, vworldLayer = "Base" }: ImageryProps) {
  const viewer = useMapStore((state) => state.viewer);
  const layerRef = useRef<ImageryLayer | null>(null);

  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    let isCancelled = false;

    const setupImagery = async () => {
      try {
        if (layerRef.current && !viewer.isDestroyed()) {
          viewer.imageryLayers.remove(layerRef.current);
          layerRef.current = null;
        }

        const imageryProvider = await createImageryProvider(provider, assetId, apiKey, vworldLayer);
        if (isCancelled || viewer.isDestroyed()) return;

        layerRef.current = viewer.imageryLayers.addImageryProvider(imageryProvider);
        viewer.scene.requestRender();
      } catch (error) {
        console.error("Failed to create imagery provider:", error);
      }
    };

    setupImagery();

    return () => {
      isCancelled = true;
      if (layerRef.current && viewer && !viewer.isDestroyed()) {
        viewer.imageryLayers.remove(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [viewer, provider, assetId, apiKey, vworldLayer]);

  return null;
}
