import { useEffect } from "react";
import { CesiumTerrainProvider, EllipsoidTerrainProvider } from "cesium";
import { useMapStore } from "../store/index";
import type { TerrainProps, TerrainProviderType } from "../types/index";

export type { TerrainProps, TerrainProviderType };

export function Terrain({ provider = "ellipsoid", assetId, url }: TerrainProps) {
  const viewer = useMapStore((state) => state.viewer);

  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    const setupTerrain = async () => {
      try {
        switch (provider) {
          case "ion":
            if (!assetId) {
              throw new Error("Ion terrain requires assetId");
            }
            viewer.terrainProvider = await CesiumTerrainProvider.fromIonAssetId(assetId);
            break;

          case "custom":
            if (!url) {
              throw new Error("Custom terrain requires url");
            }
            viewer.terrainProvider = await CesiumTerrainProvider.fromUrl(url);
            break;

          case "ellipsoid":
          default:
            viewer.terrainProvider = new EllipsoidTerrainProvider();
            break;
        }

        viewer.scene.globe.depthTestAgainstTerrain = true;
        viewer.scene.requestRender();
      } catch (error) {
        console.error("Failed to setup terrain:", error);
      }
    };

    setupTerrain();
  }, [viewer, provider, assetId, url]);

  return null;
}
